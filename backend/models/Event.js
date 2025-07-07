// WatchtowerX/backend/models/Event.js
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  eventType:     { type: String,  enum: ["fire","fall","fight"], required: true },
  timestamp:     { type: Date,    required: true },
  confidence:    { type: Number,  min: 0, max: 1, required: true },
  priority:      { type: Number,  min: 1, max: 3, required: true },
  priorityLabel: { type: String,  enum: ["Low","Medium","High"], required: true },
  cameraId:      { type: String,  required: true },
  location:      { type: String,  default: "Unknown" },
  snapshotUrl:   { type: String,  default: null },
  severity:      { type: String,  enum: ["low","medium","high"], default: "medium" },
  status:        { type: String,  enum: ["pending","dispatched","resolved"], default: "pending" },
  notes:         { type: String,  maxlength: 512, default: "" },
  mode:          { type: String, enum: ["live", "offline"], default: "live" },
  frameIndex:    { type: Number, default: null },
});

// Indexes for performance
eventSchema.index({ eventType: 1, timestamp: -1 });
eventSchema.index({ priority: 1 });
eventSchema.index({ mode: 1 });

// Debug
console.log("🐛 Event schema paths:", Object.keys(eventSchema.paths));

module.exports = mongoose.model("Event", eventSchema);
