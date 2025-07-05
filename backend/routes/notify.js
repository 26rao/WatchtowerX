// WatchtowerX/backend/routes/notify.js

const express = require("express");
const router  = express.Router();
const admin   = require("../firebase");  // your firebase initialization

router.post("/", async (req, res) => {
  const {
    tokens,
    type,
    confidence,
    reason,
    timestamp,
    overrideTitle,
    overrideBody
  } = req.body;

  if (!tokens || !Array.isArray(tokens)) {
    return res.status(400).json({ error: "An array of tokens is required." });
  }

  // Confidence thresholds per event type
  const thresholds = { fire:0.7, fall:0.75, fight:0.85, weapon:0.6 };
  const threshold = thresholds[type] ?? 0.7;
  if (confidence !== undefined && confidence < threshold) {
    return res
      .status(200)
      .json({ skipped:true, message:"Confidence below threshold." });
  }

  // Default titles/bodies
  const campaigns = {
    fire:  { title:"🔥 Fire Alert",       body:"A fire has been detected. Please evacuate immediately." },
    fall:  { title:"🚨 Fall Detected",     body:"A person has fallen. Immediate medical attention may be needed." },
    fight: { title:"⚠️ Conflict Detected", body:"Aggressive behavior detected. Please investigate." },
    weapon:{ title:"🔫 Weapon Threat",     body:"Suspicious object or weapon detected." }
  };

  const camp  = campaigns[type] || {};
  const title = overrideTitle || camp.title  || "⚠️ Incident Alert";
  const body  = overrideBody  || camp.body   || `Suspicious activity detected. (${reason||"unspecified"})`;

  const message = { notification:{ title, body }, tokens };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    res.status(200).json({ success:true, response });
  } catch (err) {
    console.error("❌ Notification error:", err);
    res.status(500).json({ success:false, error:err.message });
  }
});

module.exports = router;
