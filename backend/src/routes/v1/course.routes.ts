import { Router } from 'express';
import { courseController } from '../../controllers/course.controller.js';
import { authenticateJwt } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';

const router = Router();

router.get('/', authenticateJwt, (req, res, next) => courseController.listCourses(req, res, next));
router.get('/:id', authenticateJwt, (req, res, next) => courseController.getCourseDetails(req, res, next));
router.post('/', authenticateJwt, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR']), (req, res, next) =>
  courseController.createCourse(req, res, next)
);

export default router;
