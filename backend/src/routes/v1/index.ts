import { Router, Request, Response } from 'express';
import { sendSuccess } from '../../utils/response.util.js';
import { redis } from '../../config/redis.js';
import mongoose from 'mongoose';
import authRoutes from './auth.routes.js';
import tenantRoutes from './tenant.routes.js';
import userRoutes from './user.routes.js';
import courseRoutes from './course.routes.js';
import announcementRoutes from './announcement.routes.js';

const router = Router();

// Mount Sub-routers
router.use('/auth', authRoutes);
router.use('/tenants', tenantRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/announcements', announcementRoutes);

// Health check endpoint (Used by Docker, CI/CD, and monitoring)
router.get('/healthz', async (_req: Request, res: Response) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'UP' : 'DOWN';
  let redisStatus = 'DOWN';
  try {
    const pingRes = await redis.ping();
    if (pingRes === 'PONG') redisStatus = 'UP';
  } catch {
    redisStatus = 'DOWN';
  }

  const isHealthy = mongoStatus === 'UP' && redisStatus === 'UP';

  return sendSuccess(
    res,
    {
      status: isHealthy ? 'HEALTHY' : 'DEGRADED',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        database: mongoStatus,
        cache: redisStatus,
      },
    },
    'EduSphere API Health Status',
    isHealthy ? 200 : 503
  );
});

// Platform overview info
router.get('/info', (_req: Request, res: Response) => {
  return sendSuccess(res, {
    project: 'EduSphere',
    version: '1.0.0',
    description: 'Multi-Tenant Enterprise Learning Management System',
    targetCourses: ['CAP646', 'CAP774'],
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;
