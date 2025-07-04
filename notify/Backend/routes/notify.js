const express = require('express');
const router = express.Router(); 
const admin = require('../firebase');
router.post('/', async (req, res) => {
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
    return res.status(400).json({ error: 'An array of tokens is required.' });
  }

  const confidenceThresholds = {
    fire: 0.7,
    fall: 0.75,
    fight: 0.85,
    weapon: 0.6
  };

  const threshold = confidenceThresholds[type] || 0.7;
  if (confidence !== undefined && confidence < threshold) {
    return res.status(200).json({ skipped: true, message: 'Confidence below threshold, no alert sent.' });
  }

  const alertCampaigns = {
    fire: {
      title: '🔥 Fire Alert',
      body: 'A fire has been detected. Please evacuate immediately.',
    },
    fall: {
      title: '🚨 Fall Detected',
      body: 'A person has fallen. Immediate medical attention may be needed.',
    },
    fight: {
      title: '⚠️ Conflict Detected',
      body: 'Aggressive behavior detected. Please investigate.',
    },
    weapon: {
      title: '🔫 Weapon Threat',
      body: 'Suspicious object or weapon detected.',
    }
  };

  const campaign = alertCampaigns[type] || {};
  const title = overrideTitle || campaign.title || '⚠️ Incident Alert';
  const body = overrideBody || `${campaign.body || 'Suspicious activity detected.'} (${reason || 'unspecified'})`;

  const message = {
    notification: { title, body },
    tokens
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);

    // 📝 Optional Logging
    /*
    await NotificationLog.create({
      tokens,
      type,
      title,
      body,
      status: 'sent',
      confidence,
      reason,
      timestamp: timestamp || new Date()
    });

    console.log('✅ Notification sent and logged');
    */

    res.status(200).json({ success: true, response });

  } catch (err) {
    console.error('❌ Failed to send notification:', err.message);

    // 📝 Optional Failed Logging
    /*
    await NotificationLog.create({
      tokens,
      type,
      title,
      body,
      status: 'failed',
      confidence,
      reason,
      timestamp: timestamp || new Date()
    });
    */

    res.status(500).json({ success: false, error: err.message });
  }
});
module.exports = router;