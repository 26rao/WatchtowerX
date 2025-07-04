// backend/utils/sms.js
const twilio = require('twilio');
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (message, toPhone) => {
  try {
    const msg = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhone,
    });
    console.log("📨 SMS sent:", msg.sid);
  } catch (err) {
    console.error("❌ SMS failed:", err.message);
  }
};

module.exports = sendSMS;
