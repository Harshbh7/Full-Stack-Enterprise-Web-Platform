import { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/errors.util.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const errorCode = err instanceof AppError ? err.code : 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected internal error occurred';
  const errors = err instanceof AppError ? err.errors : undefined;

  logger.error(`[${req.method}] ${req.originalUrl} - Status: ${statusCode} - Error: ${message}`, {
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message,
    code: errorCode,
    ...(errors && { errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
};
