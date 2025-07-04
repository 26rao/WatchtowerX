const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const notifyRoute = require('./routes/notify');
const smsRoute = require('./routes/smsEvent'); 

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/notify', notifyRoute);
app.use('/sms_event', smsRoute); // ✅ Mounts /sms_event/*

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
