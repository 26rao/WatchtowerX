// WatchtowerX/backend/utils/sms.js
const twilio = require('twilio');
require('dotenv').config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (message, toPhone) => {
  if (!message || !toPhone) {
    throw new Error('Both message and toPhone are required');
  }

  const msg = await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: toPhone,
  });

  console.log('📨 SMS sent:', msg.sid);
  return msg.sid;
};

module.exports = sendSMS;
