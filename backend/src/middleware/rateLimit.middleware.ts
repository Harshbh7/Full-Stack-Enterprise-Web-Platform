import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis.js';
import { logger } from '../config/logger.js';
import { AppError } from '../utils/errors.util.js';

interface RateLimitOptions {
  windowSeconds?: number;
  maxRequests?: number;
  prefix?: string;
  message?: string;
}

export const rateLimiter = (options: RateLimitOptions = {}) => {
  const {
    windowSeconds = 60,
    maxRequests = 30,
    prefix = 'rl:general',
    message = 'Too many requests. Please slow down and try again later.',
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientIp = req.ip || req.header('x-forwarded-for') || req.socket.remoteAddress || 'anonymous';
      const key = `edusphere:${prefix}:${clientIp}`;

      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      const ttl = await redis.ttl(key);

      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current).toString());
      res.setHeader('X-RateLimit-Reset', ttl > 0 ? ttl.toString() : windowSeconds.toString());

      if (current > maxRequests) {
        res.setHeader('Retry-After', ttl > 0 ? ttl.toString() : windowSeconds.toString());
        throw new AppError(message, 429, 'RATE_LIMIT_EXCEEDED');
      }

      next();
    } catch (err: any) {
      if (err instanceof AppError && err.statusCode === 429) {
        return next(err);
      }
      // If Redis has temporary hiccup, fail open with warning so users are not blocked
      logger.warn(`Rate limiter Redis fallback: ${err.message}`);
      next();
    }
  };
};

export const authRateLimiter = rateLimiter({
  windowSeconds: 60,
  maxRequests: 15,
  prefix: 'rl:auth',
  message: 'Too many authentication attempts from this IP address. Please wait 1 minute before retrying.',
});

export const apiRateLimiter = rateLimiter({
  windowSeconds: 60,
  maxRequests: 200,
  prefix: 'rl:api',
  message: 'High traffic rate limit reached. Please wait a moment.',
});

