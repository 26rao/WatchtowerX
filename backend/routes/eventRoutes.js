// WatchtowerX/backend/routes/eventRoutes.js

const express = require('express');
const Joi     = require('joi');
const Event   = require('../models/Event');
const router  = express.Router();

// Validation schema
const eventValidationSchema = Joi.object({
  eventType:    Joi.string().valid('fire','fall','fight').required(),
  timestamp:    Joi.date().iso().required(),
  priority:     Joi.number().integer().min(1).max(3).required(),
  cameraId:     Joi.string().required(),
  location:     Joi.string().allow('', null),
  confidence:   Joi.number().min(0).max(1).optional(),
  snapshotUrl:  Joi.string().uri().optional().allow(null, ''),
  base64Image:  Joi.string().optional()   // ← newly added
});


// POST /api/event  → create a new event
const { uploadSnapshot } = require('../utils/upload');

router.post('/event', async (req, res, next) => {
  const { error, value } = eventValidationSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    // If ML eventually sends base64Image, handle it:
    if (req.body.base64Image) {
      value.snapshotUrl = await uploadSnapshot(req.body.base64Image);
    }
    const evt = new Event(value);
    await evt.save();
    return res.status(201).json({ success: true, event: evt });
  } catch (err) {
    next(err);
  }
});


// GET /api/events  → list events with optional filters
router.get('/events', async (req, res, next) => {
  try {
    const { type, priority, cameraId, limit = 50, sort = 'timestamp', order = 'desc' } = req.query;
    const filter = {};
    if (type)      filter.eventType = type;
    if (priority)  filter.priority  = Number(priority);
    if (cameraId)  filter.cameraId  = cameraId;

    const sortOrder = order === 'asc' ? 1 : -1;
    const events = await Event.find(filter)
      .sort({ [sort]: sortOrder })
      .limit(Number(limit));

    return res.json({ events });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

