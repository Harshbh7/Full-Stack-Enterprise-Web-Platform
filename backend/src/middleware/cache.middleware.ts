import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service.js';
import { logger } from '../config/logger.js';

interface CacheOptions {
  ttlSeconds?: number;
  resourcePrefix?: string;
}

export const cacheMiddleware = (options: CacheOptions = {}) => {
  const { ttlSeconds = 120, resourcePrefix = 'api' } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache idempotent GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const tenantId = (req as any).tenantId;
    const url = req.originalUrl || req.url;
    const cacheKey = cacheService.generateKey(tenantId, resourcePrefix, url);

    try {
      const cached = await cacheService.get<any>(cacheKey);

      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        res.status(200).json(cached);
        return;
      }

      // Cache MISS - intercept res.json to populate cache
      res.setHeader('X-Cache', 'MISS');
      const originalJson = res.json.bind(res);

      res.json = (body: any): Response => {
        // Only cache successful 200 responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(cacheKey, body, ttlSeconds).catch((err) => {
            logger.warn(`Failed to set cache for key ${cacheKey}: ${err.message}`);
          });
        }
        return originalJson(body);
      };

      next();
    } catch (err: any) {
      logger.warn(`Cache middleware bypassed due to error: ${err.message}`);
      next();
    }
  };
};
