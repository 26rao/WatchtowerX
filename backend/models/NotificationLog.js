const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  tokens: [String],
  type: String,
  title: String,
  body: String,
  status: String, // "sent" or "failed"
  confidence: Number,
  reason: String,
  timestamp: Date
});

module.exports = mongoose.model("NotificationLog", notificationSchema);
