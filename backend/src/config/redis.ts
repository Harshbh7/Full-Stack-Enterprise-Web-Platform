import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
  lazyConnect: false,
});

redis.on('connect', () => {
  logger.info('Redis / Valkey client connected successfully');
});

redis.on('ready', () => {
  logger.info('Redis / Valkey ready to accept commands');
});

redis.on('error', (err) => {
  logger.error(`Redis connection error: ${err.message}`);
});
