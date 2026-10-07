import { Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { AuthenticatedRequest } from '../types/index.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';
import { getPaginationParams, buildPaginationMeta } from '../utils/pagination.util.js';
import { hashPassword } from '../utils/password.util.js';

export class UserController {
  async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);
      const search = (req.query.search as string) || '';
      const role = (req.query.role as string) || '';

      const filter: Record<string, unknown> = {};
      if (req.user?.role !== 'SUPER_ADMIN' && req.tenantId) {
        filter.tenantId = req.tenantId;
      }
      if (role) {
        filter.role = role;
      }
      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const [items, total] = await Promise.all([
        User.find(filter)
          .select('-passwordHash')
          .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments(filter),
      ]);

      const meta = buildPaginationMeta(total, page, limit);
      return sendSuccess(res, items, 'Users retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async inviteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, role } = req.body;
      const tenantId = req.user?.role === 'SUPER_ADMIN' ? req.body.tenantId : req.tenantId;

      const defaultHash = await hashPassword('Password123!');
      const user = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        passwordHash: defaultHash,
        role: role || 'STUDENT',
        tenantId,
        status: 'ACTIVE',
      });

      const sanitized = user.toObject();
      delete (sanitized as any).passwordHash;

      return sendCreated(res, sanitized, 'User created/invited successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
