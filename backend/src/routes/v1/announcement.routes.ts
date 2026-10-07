import { Router } from 'express';
import { announcementController } from '../../controllers/announcement.controller.js';
import { authenticateJwt } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';

const router = Router();

router.get('/', authenticateJwt, (req, res, next) =>
  announcementController.listAnnouncements(req, res, next)
);

router.post('/', authenticateJwt, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR']), (req, res, next) =>
  announcementController.createAnnouncement(req, res, next)
);

export default router;
