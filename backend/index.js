// WatchtowerX/backend/index.js

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
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGODB_URI;
let server; // Will hold server instance

// 1️⃣ Required ENV vars
[
  "MONGODB_URI",
  "PLACEHOLDER_SNAPSHOT_URL",
  "S3_BUCKET",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY"
].forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Environment variable ${key} is required`);
    process.exit(1);
  }
});

// 2️⃣ Swagger docs
const swaggerDoc = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// 3️⃣ Global middlewares
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

// 6️⃣ Health checks
app.get("/health", (req, res) =>
  res.json({ status: "OK", timestamp: new Date().toISOString() })
);
app.get("/", (req, res) => res.json({ message: "Hello from WatchtowerX backend!" }));

// 7️⃣ Global error handler
app.use(errorHandler);

// 8️⃣ Daily cleanup (cron)
const cleanupJob = cron.schedule("0 0 * * *", () => {
  console.log("🗑️ Running scheduled cleanup job");
  require("./scripts/cleanupOldEvents")(); // Make sure it's a function
});
app.cleanupJob = cleanupJob; // Attach for test shutdown

// 9️⃣ Start server only if run directly
if (require.main === module) {
  mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  })
    .then(() => {
      console.log("✅ Connected to MongoDB");
      server = app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
      });
      app.server = server; // Attach server for graceful shutdown in tests
    })
    .catch(err => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1);
    });
}

// 🔁 Export for testing or reuse
module.exports = { app, server };
