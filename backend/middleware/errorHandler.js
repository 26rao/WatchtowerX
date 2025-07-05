// WatchtowerX/backend/middleware/errorHandler.js

module.exports = (err, req, res, next) => {
  // Log full error for debugging
  console.error(err);

  // Handle payload-too-large from express.json({ limit: ... })
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large' });
  }

  // Joi validation error
  if (err.isJoi || err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // Use explicit statusCode / status if set on the error
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(status).json({ error: message });
};
