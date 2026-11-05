import { Router } from 'express';
import { courseController } from '../../controllers/course.controller.js';
import { authenticateJwt } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';
import { cacheMiddleware } from '../../middleware/cache.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import {
  createCourseSchema,
  updateCourseSchema,
  addModuleSchema,
  addLessonSchema,
  addSyllabusSchema,
} from '../../schemas/course.schema.js';

const router = Router();

router.get(
  '/',
  authenticateJwt,
  cacheMiddleware({ ttlSeconds: 120, resourcePrefix: 'courses' }),
  (req, res, next) => courseController.listCourses(req, res, next)
);

router.get(
  '/user/enrollments',
  authenticateJwt,
  (req, res, next) => courseController.getMyEnrollments(req, res, next)
);

router.get(
  '/:id',
  authenticateJwt,
  cacheMiddleware({ ttlSeconds: 300, resourcePrefix: 'course-details' }),
  (req, res, next) => courseController.getCourseDetails(req, res, next)
);

router.post(
  '/',
  authenticateJwt,
  requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR']),
  validateRequest({ body: createCourseSchema }),
  (req, res, next) => courseController.createCourse(req, res, next)
);

router.put(
  '/:id',
  authenticateJwt,
  requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR']),
  validateRequest({ body: updateCourseSchema }),
  (req, res, next) => courseController.updateCourse(req, res, next)
);

router.delete(
  '/:id',
  authenticateJwt,
  requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']),
  (req, res, next) => courseController.deleteCourse(req, res, next)
);

// Syllabus & Curriculum Endpoints (Allowed for Instructors & Admins)
router.post(
  '/:id/modules',
  authenticateJwt,
  requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR']),
  validateRequest({ body: addModuleSchema }),
  (req, res, next) => courseController.addModule(req, res, next)
);

router.post(
  '/:id/modules/:moduleId/lessons',
  authenticateJwt,
  requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR']),
  validateRequest({ body: addLessonSchema }),
  (req, res, next) => courseController.addLesson(req, res, next)
);

router.post(
  '/:id/syllabus',
  authenticateJwt,
  requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR']),
  validateRequest({ body: addSyllabusSchema }),
  (req, res, next) => courseController.addSyllabus(req, res, next)
);

// Student Course Enrollment and Progress Tracking
router.post(
  '/:id/enroll',
  authenticateJwt,
  (req, res, next) => courseController.enroll(req, res, next)
);

router.post(
  '/:id/progress',
  authenticateJwt,
  (req, res, next) => courseController.updateProgress(req, res, next)
);

export default router;
