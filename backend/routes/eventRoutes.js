// WatchtowerX/backend/routes/eventRoutes.js

const express     = require('express');
const Joi         = require('joi');
const { Parser }  = require('json2csv');
const Event       = require('../models/Event');
const { uploadSnapshot } = require('../utils/upload');
const router      = express.Router();

// Validation schema
const eventValidationSchema = Joi.object({
  eventType:    Joi.string().valid('fire','fall','fight').required(),
  timestamp:    Joi.date().iso().required(),
  priority:     Joi.number().integer().min(1).max(3).required(),
  cameraId:     Joi.string().required(),
  location:     Joi.string().allow('', null),
  confidence:   Joi.number().min(0).max(1).optional(),
  snapshotUrl:  Joi.string().uri().optional().allow(null, ''),
  base64Image:  Joi.string().optional()
});

// POST /api/event → create a new event
router.post('/event', async (req, res, next) => {
  const { error, value } = eventValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // handle base64 snapshot stub
    if (req.body.base64Image) {
      value.snapshotUrl = await uploadSnapshot(req.body.base64Image);
    }
    const evt = new Event(value);
    await evt.save();
    res.status(201).json({ success: true, event: evt });
  } catch (err) {
    next(err);
  }
});

// GET /api/events → list with filters, pagination, date-range
router.get('/events', async (req, res, next) => {
  try {
    let {
      type, priority, cameraId,
      limit = 50, page = 1,
      startDate, endDate,
      sort = 'timestamp', order = 'desc'
    } = req.query;

    // build filter object
    const filter = {};
    if (type)      filter.eventType = type;
    if (priority)  filter.priority  = Number(priority);
    if (cameraId)  filter.cameraId  = cameraId;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate)   filter.timestamp.$lte = new Date(endDate);
    }

    // pagination & sorting
    limit = parseInt(limit);
    page  = parseInt(page);
    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    // fetch
    const events = await Event.find(filter)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(limit);

    res.json({ page, limit, events });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/events?olderThan=YYYY-MM-DD → bulk delete
router.delete('/events', async (req, res, next) => {
  try {
    const { olderThan } = req.query;
    if (!olderThan) {
      return res.status(400).json({ error: 'Query param `olderThan` is required' });
    }
    const cutoff = new Date(olderThan);
    const result = await Event.deleteMany({ timestamp: { $lt: cutoff } });
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    next(err);
  }
});

// GET /api/events/export → CSV export of all events
router.get('/events/export', async (req, res, next) => {
  try {
    const events = await Event.find().lean();
    const fields = ['eventType','timestamp','priority','cameraId','location'];
    const parser = new Parser({ fields });
    const csv = parser.parse(events);

    res.header('Content-Type', 'text/csv');
    res.attachment('events.csv');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
