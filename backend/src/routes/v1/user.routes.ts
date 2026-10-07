import { Router } from 'express';
import { userController } from '../../controllers/user.controller.js';
import { authenticateJwt } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';

const router = Router();

router.get('/', authenticateJwt, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR']), (req, res, next) =>
  userController.listUsers(req, res, next)
);

router.post('/invite', authenticateJwt, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), (req, res, next) =>
  userController.inviteUser(req, res, next)
);

export default router;
