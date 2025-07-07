require("dotenv").config();
const express     = require("express");
const mongoose    = require("mongoose");
const cors        = require("cors");
const helmet      = require("helmet");
const compression = require("compression");
const rateLimit   = require("express-rate-limit");
const cron        = require("node-cron");
const swaggerUi   = require("swagger-ui-express");
const YAML        = require("yamljs");

const eventRoutes  = require("./routes/eventRoutes");
const notifyRoute  = require("./routes/notify");
const smsRoute     = require("./routes/smsEvents");
const errorHandler = require("./middleware/errorHandler");
const rawEventsRoute = require("./routes/rawEvents");

const app       = express();
let server;     // will hold our HTTP server if started below
const PORT      = process.env.PORT || 5000;
const mongoURI  = process.env.MONGODB_URI;

// 1️⃣ Env checks
[
  "MONGODB_URI",
  "PLACEHOLDER_SNAPSHOT_URL",
  "S3_BUCKET",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER"
].forEach(k => {
  if (!process.env[k]) {
    console.error(`❌ ENV ${k} required`);
    process.exit(1);
  }
});

// 2️⃣ Swagger UI
const swaggerDoc = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// 3️⃣ Middlewares
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(rateLimit({ windowMs: 10 * 60 * 1000, max: 200 }));

// 4️⃣ Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, req.body || "");
  next();
});

// 5️⃣ Mount routes
app.use("/api", eventRoutes);
app.use("/api", rawEventsRoute);
app.use("/notify", notifyRoute);
app.use("/sms_event", smsRoute);

// 6️⃣ Health & root
app.get("/health", (req, res) =>
  res.json({ status: "OK", timestamp: new Date().toISOString() })
);
app.get("/", (req, res) =>
  res.json({ message: "Hello from WatchtowerX backend!" })
);

// 7️⃣ Global error handler
app.use(errorHandler);

// 8️⃣ Daily cleanup
const cleanupJob = cron.schedule("0 0 * * *", () => {
  console.log("🗑️ Running scheduled cleanup");
  require("./scripts/cleanupOldEvents")();
});
app.cleanupJob = cleanupJob;

// 9️⃣ Start server only if this file is run directly
if (require.main === module) {
  mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  })
    .then(() => {
      console.log("✅ Connected to MongoDB");
      server = app.listen(PORT, () =>
        console.log(`🚀 Server @ http://localhost:${PORT}`)
      );
    })
    .catch(err => {
      console.error("❌ MongoDB error:", err);
      process.exit(1);
    });
}

module.exports = { app, server };
