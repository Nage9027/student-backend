import { Request, Response, NextFunction } from 'express';
import { MongoError } from 'mongodb';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err } as AppError;
  error.message = err.message;

  // Log error
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = createError(message, 404);
  }

  // Mongoose duplicate key
  if ((err as MongoError).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    const message = `${field} already exists`;
    error = createError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error = createError(message, 400);
  }

  // JWT errors
  if (err instanceof JsonWebTokenError) {
    const message = 'Invalid token';
    error = createError(message, 401);
  }

  if (err instanceof TokenExpiredError) {
    const message = 'Token expired';
    error = createError(message, 401);
  }

  // File upload errors
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    switch ((err as any).code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected field';
        break;
    }
    error = createError(message, 400);
  }

  // Rate limiting errors
  if (err.message === 'Too many requests') {
    error = createError('Too many requests, please try again later', 429);
  }

  // Default error
  if (!error.statusCode) {
    error.statusCode = 500;
  }

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = createError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
