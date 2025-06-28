const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  };

  // SQLite errors
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    error = {
      message: 'Resource already exists',
      status: 409,
      code: 'DUPLICATE_RESOURCE'
    };
  } else if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    error = {
      message: 'Referenced resource not found',
      status: 400,
      code: 'INVALID_REFERENCE'
    };
  } else if (err.code && err.code.startsWith('SQLITE_')) {
    error = {
      message: 'Database error',
      status: 500,
      code: 'DATABASE_ERROR'
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      status: 401,
      code: 'INVALID_TOKEN'
    };
  } else if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      status: 401,
      code: 'TOKEN_EXPIRED'
    };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error = {
      message: 'Validation failed',
      status: 400,
      code: 'VALIDATION_ERROR',
      details: err.details
    };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File too large',
      status: 413,
      code: 'FILE_TOO_LARGE'
    };
  }

  // Send error response
  res.status(error.status).json({
    error: error.message,
    code: error.code,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(error.details && { details: error.details })
  });
};

module.exports = { errorHandler };