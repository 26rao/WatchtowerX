// WatchtowerX/backend/models/Event.js
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  eventType: { type: String, enum: ["fire","fall","fight"], required: true },
  timestamp: { type: Date, required: true },
  priority: { type: Number, required: true, min:1, max:3 },
  cameraId: { type: String, required: true },
  location: { type: String, default: "Unknown" },
  confidence: { type: Number, min:0, max:1 },
  snapshotUrl: { type: String, default: null },
  severity: { type: String, enum:["low","medium","high"], default:"medium" },
  status: { type: String, enum:["pending","dispatched","resolved"], default:"pending" },
  notes: { type: String, maxlength:500 },
});

// **Debug line—temporary**
console.log("🐛 Event schema paths:", Object.keys(eventSchema.paths));

module.exports = mongoose.model("Event", eventSchema);
