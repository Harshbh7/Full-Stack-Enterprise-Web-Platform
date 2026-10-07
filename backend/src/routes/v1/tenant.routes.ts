import { Router } from 'express';
import { tenantController } from '../../controllers/tenant.controller.js';
import { authenticateJwt } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';

const router = Router();

router.get('/', authenticateJwt, requireRole(['SUPER_ADMIN']), (req, res, next) =>
  tenantController.listTenants(req, res, next)
);

router.post('/', authenticateJwt, requireRole(['SUPER_ADMIN']), (req, res, next) =>
  tenantController.createTenant(req, res, next)
);

export default router;
