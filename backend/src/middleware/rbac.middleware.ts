import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types/index.js';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.util.js';

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required to verify permissions', 'AUTH_REQUIRED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `User role [${req.user.role}] does not have permission to perform this action. Required: [${allowedRoles.join(', ')}]`,
          'INSUFFICIENT_ROLE_PERMISSIONS'
        )
      );
    }

    next();
  };
};
