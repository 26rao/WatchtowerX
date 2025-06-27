require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const eventRoutes = require('./routes/eventRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGODB_URI;

// Debug info
console.log('CWD:', process.cwd());
console.log('Using .env from project root (if exists)');
console.log('process.env.PORT =', process.env.PORT);
console.log('process.env.MONGODB_URI =', JSON.stringify(mongoURI));

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', eventRoutes);


// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, req.body || '');
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Hello from WatchtowerX backend!' });
});

// Error handler (must come after all routes)
app.use(errorHandler);

// Connect to MongoDB
if (!mongoURI) {
  console.error('MONGODB_URI not set');
  process.exit(1);
}
console.log('Attempting to connect to MongoDB...');

const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

mongoose.connect(mongoURI, options)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB. Error details:', err);
    if (err.name === 'MongoServerSelectionError') {
      console.error('Check IP whitelist, cluster status, credentials');
    }
    console.error('Connection string used:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@'));
    process.exit(1);
  });


