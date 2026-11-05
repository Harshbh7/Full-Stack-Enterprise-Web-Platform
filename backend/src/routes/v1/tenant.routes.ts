import { Router } from 'express';
import { tenantController } from '../../controllers/tenant.controller.js';
import { authenticateJwt } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';

const router = Router();

// Public list of active tenants for login dropdown
router.get('/public', (req, res, next) =>
  tenantController.listPublicTenants(req, res, next)
);

// Public tenant resolution by slug (used for subdomain / custom domain branding)
router.get('/resolve/:slug', (req, res, next) =>
  tenantController.getTenantBySlug(req, res, next)
);

// Admin-only tenant management
router.get('/', authenticateJwt, requireRole(['SUPER_ADMIN']), (req, res, next) =>
  tenantController.listTenants(req, res, next)
);

router.post('/', authenticateJwt, requireRole(['SUPER_ADMIN']), (req, res, next) =>
  tenantController.createTenant(req, res, next)
);

router.delete('/:id', authenticateJwt, requireRole(['SUPER_ADMIN']), (req, res, next) =>
  tenantController.deleteTenant(req, res, next)
);

export default router;
