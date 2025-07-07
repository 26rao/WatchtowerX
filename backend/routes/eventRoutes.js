const express = require("express");
const Joi = require("joi");
const { Parser } = require("json2csv");
const Event = require("../models/Event");
const { uploadSnapshot } = require("../utils/upload");
const router = express.Router();

const LABEL_TO_PRIORITY = { Low: 1, Medium: 2, High: 3 };
//this is connected 

// 1) Validation schema
const eventValidationSchema = Joi.object({
  eventType:     Joi.string().valid("fire","fall","fight").required(),
  timestamp:     Joi.date().iso().required(),
  cameraId:      Joi.string().required(),
  confidence:    Joi.number().min(0).max(1).required(),
  priorityLabel: Joi.string().valid("Low","Medium","High").required(),
  snapshotData:  Joi.string().dataUri().required(),
  eventDetails:  Joi.object({ description: Joi.string().max(512) }).optional(),
  location:      Joi.string().optional(),
  severity:      Joi.string().valid("low","medium","high").optional(),
  status:        Joi.string().valid("pending","dispatched","resolved").optional(),
  notes:         Joi.string().max(512).optional(),
  mode:          Joi.string().valid("live", "offline").optional(),
  frameIndex:    Joi.number().integer().optional(),
});

// 2) POST /api/event
router.post("/event", async (req, res, next) => {
  const { error, value } = eventValidationSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  let snapshotUrl;
  try {
    snapshotUrl = await uploadSnapshot(value.snapshotData);
  } catch (uploadErr) {
    console.error("Snapshot upload error:", uploadErr);
    return res.status(500).json({ error: "Snapshot upload failed" });
  }

  try {
    const toSave = {
      eventType:     value.eventType,
      timestamp:     new Date(value.timestamp),
      cameraId:      value.cameraId,
      confidence:    value.confidence,
      priority:      LABEL_TO_PRIORITY[value.priorityLabel],
      priorityLabel: value.priorityLabel,
      location:      value.location || "Unknown",
      severity:      value.severity || "medium",
      status:        value.status   || "pending",
      notes:         value.notes    || value.eventDetails?.description || "",
      snapshotUrl,
      mode:          value.mode || "live",
      frameIndex:    value.frameIndex ?? null,
    };

    const evt = await Event.create(toSave);

    return res.status(201).json({
      success: true,
      event: {
        eventId:       evt._id.toString(),
        eventType:     evt.eventType,
        timestamp:     evt.timestamp.toISOString(),
        cameraId:      evt.cameraId,
        confidence:    evt.confidence,
        priority:      evt.priority,
        priorityLabel: evt.priorityLabel,
        location:      evt.location,
        severity:      evt.severity,
        snapshotUrl:   evt.snapshotUrl,
        status:        evt.status,
        notes:         evt.notes,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 3) GET /api/events
router.get("/events", async (req, res, next) => {
  try {
    let { type, cameraId, priority, location, limit = 50, page = 1, startDate, endDate, sort = "timestamp", order = "desc" } = req.query;
    const filter = {};

    if (type)      filter.eventType = { $in: type.split(",").map(s=>s.trim()) };
    if (cameraId)  filter.cameraId  = cameraId;
    if (priority)  filter.priority  = { $in: priority.split(",").map(n=>Number(n)) };
    if (location)  filter.location  = { $regex: location, $options: "i" };
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
      eventId:       doc._id.toString(),
      eventType:     doc.eventType,
      timestamp:     doc.timestamp.toISOString(),
      cameraId:      doc.cameraId,
      confidence:    doc.confidence,
      priority:      doc.priority,
      priorityLabel: doc.priorityLabel,
      location:      doc.location,
      severity:      doc.severity,
      snapshotUrl:   doc.snapshotUrl,
      status:        doc.status,
      notes:         doc.notes,
    }));

    return res.json({ page, limit, events });
  } catch (err) {
    next(err);
  }
});

// 4) DELETE /api/events
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

// 5) CSV export
router.get("/events/export", async (req, res, next) => {
  try {
    const docs = await Event.find().lean();
    const fields = ["eventType","timestamp","cameraId","confidence","priority","priorityLabel","location","severity","status","notes"];
    const parser = new Parser({ fields });
    const csv = parser.parse(docs);

    res.header("Content-Type", "text/csv");
    res.attachment("events.csv");
    return res.send(csv);
  } catch (err) {
    next(err);
  }
});

// 6) JSON export
router.get("/events/export.json", async (req, res, next) => {
  try {
    const docs = await Event.find().lean();
    const out = docs.map(doc => ({
      eventId:       doc._id.toString(),
      eventType:     doc.eventType,
      timestamp:     doc.timestamp.toISOString(),
      cameraId:      doc.cameraId,
      confidence:    doc.confidence,
      priority:      doc.priority,
      priorityLabel: doc.priorityLabel,
      location:      doc.location,
      severity:      doc.severity,
      snapshotUrl:   doc.snapshotUrl,
      status:        doc.status,
      notes:         doc.notes,
    }));
    return res.json(out);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
