import { Request, Response, NextFunction } from 'express';
import { tenantRepository } from '../repositories/tenant.repository.js';
import { ITenant } from '../models/Tenant.js';
import { User } from '../models/User.js';
import { hashPassword } from '../utils/password.util.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';
import { getPaginationParams, buildPaginationMeta } from '../utils/pagination.util.js';
import { NotFoundError } from '../utils/errors.util.js';

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

      const result = await tenantRepository.findPaginated(
        filter,
        undefined,
        true,
        { page, limit, skip, sortBy, sortOrder }
      );

      const meta = buildPaginationMeta(result.total, page, limit);
      return sendSuccess(res, result.items, 'Tenants retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getTenantBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const tenant = await tenantRepository.findBySlug(slug);
      if (!tenant) {
        throw new NotFoundError(`Tenant with slug "${slug}" not found`);
      }
      return sendSuccess(res, tenant, 'Tenant resolved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, slug, domain, primaryColor, contactEmail, maxStudents, adminPassword, adminName } = req.body;
      const tenant = await tenantRepository.create({
        name,
        slug: slug.toLowerCase().trim(),
        domain: domain?.trim() || `${slug.toLowerCase().trim()}.edusphere.io`,
        primaryColor: primaryColor || '#2563EB',
        contactEmail: contactEmail.toLowerCase().trim(),
        settings: {
          allowSelfRegistration: true,
          maxStudents: maxStudents || 5000,
          maxCourses: 100,
          storageQuotaBytes: 53687091200,
          requireMFA: false,
        },
      });

      // Automatically provision initial Tenant Administrator User
      const initialPassword = adminPassword || 'Password123!';
      const passwordHash = await hashPassword(initialPassword);
      const nameParts = (adminName || `${name} Admin`).trim().split(' ');
      const firstName = nameParts[0] || 'Admin';
      const lastName = nameParts.slice(1).join(' ') || 'User';

      await User.create({
        tenantId: tenant._id,
        email: contactEmail.toLowerCase().trim(),
        passwordHash,
        firstName,
        lastName,
        role: 'TENANT_ADMIN',
        status: 'ACTIVE',
      });

      return sendCreated(res, tenant, 'Tenant created and administrator provisioned successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const success = await tenantRepository.delete(id, undefined, true);
      if (!success) {
        throw new NotFoundError(`Tenant with ID "${id}" not found`);
      }
      return sendSuccess(res, { id }, 'Tenant removed successfully');
    } catch (error) {
      next(error);
    }
  }

  async listPublicTenants(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await tenantRepository.findActiveTenants({
        page: 1,
        limit: 100,
        skip: 0,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      const publicList = result.items.map((t: ITenant) => ({
        id: t._id,
        name: t.name,
        slug: t.slug,
        domain: t.domain,
        primaryColor: t.primaryColor,
        status: t.status,
      }));
      return sendSuccess(res, publicList, 'Public tenants retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const tenantController = new TenantController();
