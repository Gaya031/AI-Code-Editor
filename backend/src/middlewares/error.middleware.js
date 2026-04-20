import { env } from '../config/env.js';

export function notFoundMiddleware(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorMiddleware(error, _req, res, _next) {
  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  const isOperational = statusCode < 500;

  res.status(statusCode).json({
    success: false,
    error: {
      message: isOperational ? error.message : 'Internal server error',
      statusCode,
      details: env.NODE_ENV === 'development' ? error.message : undefined
    }
  });
}

