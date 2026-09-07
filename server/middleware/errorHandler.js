const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

// Centralized error handler — never leaks stack traces to the client.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let error = err;

  if (!(error instanceof ApiError)) {
    if (error.name === 'ValidationError') {
      error = ApiError.badRequest('Validation failed', error.errors);
    } else if (error.code === 11000) {
      error = ApiError.conflict('A record with this value already exists');
    } else if (error.name === 'CastError') {
      error = ApiError.badRequest('Invalid identifier supplied');
    } else if (error.name === 'MulterError') {
      error = ApiError.badRequest(`Upload error: ${error.message}`);
    } else {
      error = ApiError.internal('Something went wrong. Please try again.');
    }
  }

  logger.error(err.message, { path: req.path, method: req.method, stack: err.stack });

  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message,
      details: error.details || undefined,
    },
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, error: { message: `Route not found: ${req.originalUrl}` } });
}

module.exports = { errorHandler, notFoundHandler };
