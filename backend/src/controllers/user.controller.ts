import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { userService } from '../services/user.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';
import { getPaginationParams, buildPaginationMeta } from '../utils/pagination.util.js';
import { BadRequestError } from '../utils/errors.util.js';

export class UserController {
  async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);
      const search = (req.query.search as string) || '';
      const role = (req.query.role as string) || '';
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

      const result = await userService.listUsers(
        req.tenantId,
        isSuperAdmin,
        search,
        role,
        { page, limit, skip, sortBy, sortOrder }
      );

      const meta = buildPaginationMeta(result.total, page, limit);
      return sendSuccess(res, result.items, 'Users retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async inviteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.inviteUser(req.body, {
        userId: req.user?.userId || '',
        role: req.user?.role || 'STUDENT',
        tenantId: req.tenantId,
      });

      return sendCreated(res, user, 'User created/invited successfully');
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
      const user = await userService.getUserById(id, req.tenantId, isSuperAdmin);
      return sendSuccess(res, user, 'User details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email, newPassword } = req.body;
      if (!email) {
        throw new BadRequestError('User email address is required');
      }

      const result = await userService.resetPassword(
        email,
        {
          userId: req.user?.userId || '',
          email: req.user?.email || '',
          role: req.user?.role || 'STUDENT',
          tenantId: req.tenantId,
        },
        newPassword
      );

      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const success = await userService.deleteUser(id, {
        userId: req.user?.userId || '',
        role: req.user?.role || 'STUDENT',
        tenantId: req.tenantId,
      });
      return sendSuccess(res, { success }, 'User removed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPendingVerifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const users = await userService.getPendingVerifications({
        userId: req.user?.userId || '',
        role: req.user?.role || 'STUDENT',
        tenantId: req.tenantId,
      });
      return sendSuccess(res, users, 'Pending verifications retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async approveUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.approveUser(id, {
        userId: req.user?.userId || '',
        role: req.user?.role || 'STUDENT',
        tenantId: req.tenantId,
      });
      return sendSuccess(res, user, 'User approved successfully');
    } catch (error) {
      next(error);
    }
  }

  async rejectUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.rejectUser(id, {
        userId: req.user?.userId || '',
        role: req.user?.role || 'STUDENT',
        tenantId: req.tenantId,
      });
      return sendSuccess(res, user, 'User registration request rejected');
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
