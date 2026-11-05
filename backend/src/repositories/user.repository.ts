import { Types, FilterQuery } from 'mongoose';
import { BaseRepository, PaginationOptions, PaginatedResult } from './base.repository.js';
import { User, IUser } from '../models/User.js';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    // User is tenant-scoped, but Super Admins can have null tenantId
    super(User, true);
  }

  async findByEmail(email: string, tenantId?: string, isSuperAdmin = false): Promise<IUser | null> {
    const filter: FilterQuery<IUser> = { email: email.toLowerCase().trim() };
    if (!isSuperAdmin && tenantId) {
      filter.tenantId = new Types.ObjectId(tenantId);
    }
    return this.model.findOne(filter).exec();
  }

  async findWithPassword(email: string): Promise<IUser | null> {
    return this.model
      .findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate('tenantId', 'name slug domain status')
      .exec();
  }

  async searchUsers(
    search?: string,
    role?: string,
    tenantId?: string,
    isSuperAdmin = false,
    options: PaginationOptions = { page: 1, limit: 10, skip: 0 }
  ): Promise<PaginatedResult<IUser>> {
    const filter: FilterQuery<IUser> = {};

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    return this.findPaginated(filter, tenantId, isSuperAdmin, options, 'tenantId');
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.model.findByIdAndUpdate(userId, { lastLoginAt: new Date() }).exec();
  }
}

export const userRepository = new UserRepository();
