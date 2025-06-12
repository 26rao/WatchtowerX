// backend/models/Event.js
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['fire', 'fall', 'fight'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  cameraId: {
    type: String,
    default: null,
  },
  location: {
    type: String,
    default: null,
  },
  snapshotUrl: {
    type: String,
    default: null,
  },
  priority: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model('Event', EventSchema);
