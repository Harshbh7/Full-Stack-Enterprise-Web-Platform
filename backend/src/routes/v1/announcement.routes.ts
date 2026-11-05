import { Router } from 'express';
import { announcementController } from '../../controllers/announcement.controller.js';
import { authenticateJwt } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';
import { cacheMiddleware } from '../../middleware/cache.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { createAnnouncementSchema } from '../../schemas/announcement.schema.js';

const router = Router();

router.get(
  '/',
  authenticateJwt,
  cacheMiddleware({ ttlSeconds: 60, resourcePrefix: 'announcements' }),
  (req, res, next) => announcementController.listAnnouncements(req, res, next)
);

router.post(
  '/',
  authenticateJwt,
  requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR']),
  validateRequest({ body: createAnnouncementSchema }),
  (req, res, next) => announcementController.createAnnouncement(req, res, next)
);

router.delete(
  '/:id',
  authenticateJwt,
  requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']),
  (req, res, next) => announcementController.deleteAnnouncement(req, res, next)
);

export default router;
