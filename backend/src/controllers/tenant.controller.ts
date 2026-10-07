import { Request, Response, NextFunction } from 'express';
import { Tenant } from '../models/Tenant.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';
import { getPaginationParams, buildPaginationMeta } from '../utils/pagination.util.js';

export class TenantController {
  async listTenants(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);
      const search = (req.query.search as string) || '';

      const filter: Record<string, unknown> = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { slug: { $regex: search, $options: 'i' } },
        ];
      }

      const [items, total] = await Promise.all([
        Tenant.find(filter)
          .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limit),
        Tenant.countDocuments(filter),
      ]);

      const meta = buildPaginationMeta(total, page, limit);
      return sendSuccess(res, items, 'Tenants retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async createTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, slug, domain, primaryColor, contactEmail, maxStudents } = req.body;
      const tenant = await Tenant.create({
        name,
        slug: slug.toLowerCase(),
        domain,
        primaryColor: primaryColor || '#2563EB',
        contactEmail,
        settings: {
          allowSelfRegistration: true,
          maxStudents: maxStudents || 5000,
          maxCourses: 100,
          storageQuotaBytes: 53687091200,
          requireMFA: false,
        },
      });
      return sendCreated(res, tenant, 'Tenant created successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const tenantController = new TenantController();
