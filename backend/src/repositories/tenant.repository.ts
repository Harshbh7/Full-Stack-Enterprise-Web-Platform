import { Types } from 'mongoose';
import { BaseRepository, PaginationOptions, PaginatedResult } from './base.repository.js';
import { Tenant, ITenant } from '../models/Tenant.js';
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';

export class TenantRepository extends BaseRepository<ITenant> {
  constructor() {
    super(Tenant, false); // Tenants collection is system-wide
  }

  async findBySlug(slug: string): Promise<ITenant | null> {
    return this.model.findOne({ slug: slug.toLowerCase().trim() }).exec();
  }

  async findByDomain(domain: string): Promise<ITenant | null> {
    return this.model.findOne({ domain: domain.toLowerCase().trim() }).exec();
  }

  async findActiveTenants(options: PaginationOptions): Promise<PaginatedResult<ITenant>> {
    return this.findPaginated({ status: 'ACTIVE' }, undefined, true, options);
  }

  async getTenantMetrics(tenantId: string): Promise<{
    userCount: number;
    courseCount: number;
  }> {
    if (!Types.ObjectId.isValid(tenantId)) {
      return { userCount: 0, courseCount: 0 };
    }
    const tId = new Types.ObjectId(tenantId);
    const [userCount, courseCount] = await Promise.all([
      User.countDocuments({ tenantId: tId }),
      Course.countDocuments({ tenantId: tId }),
    ]);
    return { userCount, courseCount };
  }
}

export const tenantRepository = new TenantRepository();
