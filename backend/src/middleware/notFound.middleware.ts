import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../utils/errors.util.js';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new NotFoundError(`Resource not found: [${req.method}] ${req.originalUrl}`, 'ENDPOINT_NOT_FOUND'));
};
