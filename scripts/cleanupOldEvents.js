// scripts/cleanupOldEvents.js
require("dotenv").config();
const mongoose = require("mongoose");
const Event    = require("../models/Event");

// Retain events for 30 days
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is required");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  const cutoff = new Date(Date.now() - RETENTION_MS);
  const { deletedCount } = await Event.deleteMany({ timestamp: { $lt: cutoff } });
  console.log(`Deleted ${deletedCount} events older than ${cutoff.toISOString()}`);
  process.exit(0);
}

run().catch(err => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
