const express = require('express');
const router = express.Router();
const sendSMS = require('../utils/sms');

// ✅ Use '/' instead of '/sms-event' since it's already mounted at '/sms_event'
router.post('/', async (req, res) => {
  const { alertType, location, phone } = req.body;

  if (!alertType || !location || !phone) {
    return res.status(400).json({ error: 'Missing alertType, location, or phone' });
  }

  try {
    const message = `🚨 ${alertType.toUpperCase()} detected at ${location}. Immediate attention required!`;
    await sendSMS(message, phone);
    res.status(200).json({ status: 'SMS sent successfully' });
  } catch (err) {
    console.error("❌ SMS Error:", err.message);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

module.exports = router;
