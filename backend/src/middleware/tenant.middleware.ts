import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { AuthenticatedRequest } from '../types/index.js';
import { BadRequestError } from '../utils/errors.util.js';
import { tenantRepository } from '../repositories/tenant.repository.js';
import { logger } from '../config/logger.js';

export const resolveTenant = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Highest priority: Verified JWT token claim
    if (req.user?.tenantId) {
      req.tenantId = req.user.tenantId;
      return next();
    }

    // 2. Custom request header (can be ObjectId or slug)
    const headerTenantId = req.header('X-Tenant-ID') || req.header('x-tenant-id');
    if (headerTenantId) {
      if (Types.ObjectId.isValid(headerTenantId)) {
        req.tenantId = headerTenantId;
        return next();
      }
      // If it's a slug, resolve to ObjectId
      const tenant = await tenantRepository.findBySlug(headerTenantId);
      if (tenant) {
        req.tenantId = tenant._id.toString();
        return next();
      }
    }

    // 3. Subdomain resolution (e.g. apex-uni.edusphere.io -> resolve slug)
    const host = req.header('host') || req.hostname || '';
    const hostParts = host.split('.');
    if (hostParts.length > 2) {
      const subdomain = hostParts[0].toLowerCase();
      if (subdomain !== 'www' && subdomain !== 'api' && subdomain !== 'localhost') {
        const tenant = await tenantRepository.findBySlug(subdomain);
        if (tenant) {
          req.tenantId = tenant._id.toString();
          return next();
        }
      }
    }

    next();
  } catch (err: any) {
    logger.warn(`Error resolving tenant: ${err.message}`);
    next();
  }
};

export const requireTenant = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.tenantId) {
    return next(
      new BadRequestError(
        'Tenant context is required for this operation',
        'TENANT_CONTEXT_REQUIRED'
      )
    );
  }
  next();
};
