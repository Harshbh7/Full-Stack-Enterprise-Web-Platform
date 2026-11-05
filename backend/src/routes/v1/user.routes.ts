import { Router } from 'express';
import { userController } from '../../controllers/user.controller.js';
import { authenticateJwt } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { authRateLimiter } from '../../middleware/rateLimit.middleware.js';
import { inviteUserSchema } from '../../schemas/user.schema.js';

const router = Router();

router.get(
  '/',
  authenticateJwt,
  requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR']),
  (req, res, next) => userController.listUsers(req, res, next)
);

router.get(
  '/pending',
  authenticateJwt,
  requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR']),
  (req, res, next) => userController.getPendingVerifications(req, res, next)
);

router.post(
  '/:id/approve',
  authenticateJwt,
  requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR']),
  (req, res, next) => userController.approveUser(req, res, next)
);

router.post(
  '/:id/reject',
  authenticateJwt,
  requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR']),
  (req, res, next) => userController.rejectUser(req, res, next)
);

router.get(
  '/:id',
  authenticateJwt,
  (req, res, next) => userController.getUserById(req, res, next)
);

router.post(
  '/invite',
  authenticateJwt,
  requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']),
  validateRequest({ body: inviteUserSchema }),
  (req, res, next) => userController.inviteUser(req, res, next)
);

router.post(
  '/reset-password',
  authenticateJwt,
  authRateLimiter,
  (req, res, next) => userController.resetPassword(req, res, next)
);

router.delete(
  '/:id',
  authenticateJwt,
  requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']),
  (req, res, next) => userController.deleteUser(req, res, next)
);

export default router;
