// backend/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

function computePriority(eventType) {
  switch (eventType) {
    case 'fire': return 3;
    case 'fall': return 2;
    case 'fight': return 1;
    default: return 1;
  }
}

// POST /api/event
router.post('/', async (req, res) => {
  try {
    const { eventType, timestamp, cameraId, location, snapshotUrl } = req.body;
    if (!eventType) return res.status(400).json({ error: 'eventType is required' });
    if (!['fire', 'fall', 'fight'].includes(eventType)) {
      return res.status(400).json({ error: 'Invalid eventType' });
    }

    const priority = computePriority(eventType);

    const newEvent = new Event({
      eventType,
      timestamp: timestamp || new Date(),
      cameraId,
      location,
      snapshotUrl,
      priority,
    });

    const savedEvent = await newEvent.save();
    return res.status(201).json({ success: true, event: savedEvent });
  } catch (error) {
    console.error('POST /api/event error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'timestamp';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const events = await Event.find()
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .lean();

    return res.json({ events });
  } catch (error) {
    console.error('GET /api/events error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
