// backend/models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventType:   { type: String, required: true },      // fire|fall|fight
  timestamp:   { type: Date,   required: true, default: Date.now },
  priority:    { type: Number, required: true },      // 1–3
  cameraId:    { type: String, required: true },
  location:    { type: String, default: 'Unknown' },
  confidence:  { type: Number, default: null },       // new
  snapshotUrl: { type: String, default: null },       // new
});

// Create indexes for faster querying
eventSchema.index({ timestamp: -1 });
eventSchema.index({ priority: 1 });

module.exports = mongoose.model('Event', eventSchema);
