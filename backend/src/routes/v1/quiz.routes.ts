import { Router } from 'express';
import { quizController } from '../../controllers/quiz.controller.js';
import { authenticateJwt } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { createQuizSchema, addQuestionSchema, submitQuizSchema } from '../../schemas/quiz.schema.js';

const router = Router();

router.get('/', authenticateJwt, (req, res, next) =>
  quizController.listQuizzes(req, res, next)
);

router.get(
  '/attempts/all',
  authenticateJwt,
  requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR']),
  (req, res, next) => quizController.getAllAttempts(req, res, next)
);

router.get('/:id', authenticateJwt, (req, res, next) =>
  quizController.getQuizDetails(req, res, next)
);

router.post(
  '/',
  authenticateJwt,
  requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR']),
  validateRequest({ body: createQuizSchema }),
  (req, res, next) => quizController.createQuiz(req, res, next)
);

router.post(
  '/:id/questions',
  authenticateJwt,
  requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR']),
  validateRequest({ body: addQuestionSchema }),
  (req, res, next) => quizController.addQuestion(req, res, next)
);

router.post(
  '/:id/submit',
  authenticateJwt,
  validateRequest({ body: submitQuizSchema }),
  (req, res, next) => quizController.submitQuiz(req, res, next)
);

router.get('/:id/attempts', authenticateJwt, (req, res, next) =>
  quizController.getAttempts(req, res, next)
);

export default router;
