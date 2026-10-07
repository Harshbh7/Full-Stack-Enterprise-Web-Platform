import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { verifyAccessToken } from '../utils/jwt.util.js';
import { UnauthorizedError } from '../utils/errors.util.js';

export const authenticateJwt = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.header('Authorization') || req.header('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authentication token is missing or malformed', 'TOKEN_MISSING'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    if (payload.tenantId) {
      req.tenantId = payload.tenantId;
    }
    next();
  } catch (error) {
    return next(new UnauthorizedError('Access token is invalid or expired', 'TOKEN_INVALID'));
  }
};
