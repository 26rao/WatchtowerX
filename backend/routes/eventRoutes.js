const express = require("express");
const Joi = require("joi");
const { Parser } = require("json2csv");
const Event = require("../models/Event");
const { uploadSnapshot } = require("../utils/upload");
const router = express.Router();

// ———————————————
// 1) Validation schema
// ———————————————
const eventValidationSchema = Joi.object({
  eventType:   Joi.string().valid("fire", "fall", "fight").required(),
  timestamp:   Joi.date().iso().required(),
  priority:    Joi.number().integer().min(1).max(5).required(),
  cameraId:    Joi.string().required(),
  location:    Joi.string().optional(),
  severity:    Joi.string().valid("low", "medium", "high").optional(),
  status:      Joi.string().valid("pending", "dispatched", "resolved").optional(),
  notes:       Joi.string().max(512).optional(),
  base64Image: Joi.string().optional(),
});

// ———————————————
// 2) POST /api/event → create a new event
// ———————————————
router.post("/event", async (req, res, next) => {
  const { error, value } = eventValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // snapshot stub or real upload
    let snapshotUrl = null;
    if (value.base64Image) {
      try {
        snapshotUrl = await uploadSnapshot(value.base64Image);
      } catch {
        return res.status(500).json({ error: "Snapshot upload failed" });
      }
    }

    // assemble persisted object with defaults
    const toSave = {
      eventType:   value.eventType,
      timestamp:   new Date(value.timestamp),
      priority:    value.priority,
      cameraId:    value.cameraId,
      location:    value.location || "Unknown",
      severity:    value.severity || "medium",
      status:      value.status   || "pending",
      notes:       value.notes    || "",
      snapshotUrl,
    };

    const evt = await Event.create(toSave);

    // shape response exactly as UI expects
    return res.status(201).json({
      success: true,
      event: {
        eventId:     evt._id.toString(),
        eventType:   evt.eventType,
        timestamp:   evt.timestamp.toISOString(),
        priority:    evt.priority,
        cameraId:    evt.cameraId,
        location:    evt.location,
        severity:    evt.severity,
        snapshotUrl: evt.snapshotUrl,
        status:      evt.status,
        notes:       evt.notes,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ——————————————————————————————
// 3) GET /api/events → list with filters, pagination, date-range
// ——————————————————————————————
router.get("/events", async (req, res, next) => {
  try {
    let {
      type, priority, cameraId,
      limit = 50, page = 1,
      startDate, endDate,
      sort = "timestamp", order = "desc"
    } = req.query;

    const filter = {};
    if (type)      filter.eventType = type;
    if (priority)  filter.priority  = Number(priority);
    if (cameraId)  filter.cameraId  = cameraId;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate)   filter.timestamp.$lte = new Date(endDate);
    }

    limit = parseInt(limit, 10);
    page  = parseInt(page,  10);
    const skip = (page - 1) * limit;
    const sortOrder = order === "asc" ? 1 : -1;

    const docs = await Event.find(filter)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(limit);

    const events = docs.map(doc => ({
      eventId:     doc._id.toString(),
      eventType:   doc.eventType,
      timestamp:   doc.timestamp.toISOString(),
      priority:    doc.priority,
      cameraId:    doc.cameraId,
      location:    doc.location,
      severity:    doc.severity,
      snapshotUrl: doc.snapshotUrl,
      status:      doc.status,
      notes:       doc.notes,
    }));

    return res.json({ page, limit, events });
  } catch (err) {
    next(err);
  }
});

// ————————————————————————
// 4) DELETE /api/events?olderThan= → bulk delete
// ————————————————————————
router.delete("/events", async (req, res, next) => {
  try {
    const { olderThan } = req.query;
    if (!olderThan) {
      return res.status(400).json({ error: "Query param `olderThan` is required" });
    }
    const cutoff = new Date(olderThan);
    const result = await Event.deleteMany({ timestamp: { $lt: cutoff } });
    return res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    next(err);
  }
});

// ————————————————————————————————
// 5) GET /api/events/export → CSV export of all events
// ————————————————————————————————
router.get("/events/export", async (req, res, next) => {
  try {
    const docs = await Event.find().lean();
    const fields = [
      "eventType","timestamp","priority","cameraId",
      "location","severity","status","notes"
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(docs);

    res.header("Content-Type", "text/csv");
    res.attachment("events.csv");
    return res.send(csv);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
