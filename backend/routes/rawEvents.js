const express = require('express');
const router  = express.Router();
const Event   = require('../models/Event');

/**
 * GET /api/events/raw
 * Returns the entire events collection as JSON.
 * WARNING: if you have thousands of docs, this will be heavy!
 */
router.get('/events/raw', async (req, res) => {
  try {
    // fetch ALL documents
    const allEvents = await Event.find({}).lean();
    res.json(allEvents);
  } catch (err) {
    console.error('Error fetching raw events:', err);
    res.status(500).json({ error: 'Failed to fetch raw events' });
  }
});

module.exports = router; 