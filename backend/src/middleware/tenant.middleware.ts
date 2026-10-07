import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { BadRequestError } from '../utils/errors.util.js';

export const resolveTenant = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  // 1. Highest priority: Verified JWT token claim
  if (req.user?.tenantId) {
    req.tenantId = req.user.tenantId;
    return next();
  }

  // 2. Custom request header
  const headerTenantId = req.header('X-Tenant-ID') || req.header('x-tenant-id');
  if (headerTenantId) {
    req.tenantId = headerTenantId;
    return next();
  }

  // 3. Subdomain resolution
  const host = req.header('host') || req.hostname || '';
  const hostParts = host.split('.');
  if (hostParts.length > 2) {
    const subdomain = hostParts[0];
    if (subdomain !== 'www' && subdomain !== 'api') {
      req.tenantId = subdomain;
      return next();
    }
  }

  next();
};

export const requireTenant = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.tenantId) {
    return next(new BadRequestError('Tenant context is required for this operation', 'TENANT_CONTEXT_REQUIRED'));
  }
  next();
};
