import { Router } from 'express';
import { authController } from '../../controllers/auth.controller.js';
import { authenticateJwt } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { authRateLimiter } from '../../middleware/rateLimit.middleware.js';
import { loginSchema, refreshTokenSchema } from '../../schemas/auth.schema.js';

const router = Router();

router.post(
  '/login',
  authRateLimiter,
  validateRequest({ body: loginSchema }),
  (req, res, next) => authController.login(req, res, next)
);

router.post(
  '/sso/google',
  authRateLimiter,
  (req, res, next) => authController.googleSso(req, res, next)
);

router.post(
  '/refresh',
  validateRequest({ body: refreshTokenSchema }),
  (req, res, next) => authController.refresh(req, res, next)
);

router.post('/logout', (req, res, next) => authController.logout(req, res, next));

router.get('/me', authenticateJwt, (req, res, next) => authController.me(req, res, next));

export default router;
