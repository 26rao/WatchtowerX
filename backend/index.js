require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const eventRoutes = require("./routes/eventRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGODB_URI;

// ---------- Swagger UI ----------
const swaggerDoc = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// ---------- Debug Logging ----------
console.log("CWD:", process.cwd());
console.log("Using .env from project root");
console.log("PORT =", PORT);
console.log("MONGODB_URI =", mongoURI ? "<configured>" : "<missing>");

// ---------- Global Middleware ----------
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());

// ---------- Rate Limiting ----------
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200, // limit each IP to 200 requests per window
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// ---------- Request Logging ----------
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url}`,
    req.body || "",
  );
  next();
});

// ---------- API Routes ----------
app.use("/api", eventRoutes);

// ---------- Health & Root Routes ----------
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});
app.get("/", (req, res) => {
  res.json({ message: "Hello from WatchtowerX backend!" });
});

// ---------- Error Handler ----------
app.use(errorHandler);

// ---------- Connect to MongoDB & Start Server ----------
if (require.main === module) {
  if (!mongoURI) {
    console.error("MONGODB_URI not set in .env");
    process.exit(1);
  }

  console.log("Attempting to connect to MongoDB...");
  mongoose
    .connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    .then(() => {
      console.log("✅ Connected to MongoDB Atlas");
      app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
        console.log(`🩺 Health check at http://localhost:${PORT}/health`);
      });
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      if (err.name === "MongoServerSelectionError") {
        console.error("→ Check your IP whitelist, cluster status, credentials");
      }
      console.error(
        "→ Connection string used:",
        mongoURI.replace(/\/\/[^:]+:[^@]+@/, "//<credentials>@"),
      );
      process.exit(1);
    });
}

// ---------- Export for Testing ----------
module.exports = app;
