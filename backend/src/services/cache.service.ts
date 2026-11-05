import { redis } from '../config/redis.js';
import { logger } from '../config/logger.js';

export class CacheService {
  private readonly defaultTTL = 300; // 5 minutes default

  /**
   * Generates a strictly tenant-isolated cache key.
   * Format: edusphere:tenant:<tenantId>:<resource>:<idOrQuery>
   */
  generateKey(tenantId: string | undefined, resource: string, identifier = 'all'): string {
    const scope = tenantId ? `tenant:${tenantId}` : 'tenant:global';
    return `edusphere:${scope}:${resource}:${identifier}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err: any) {
      logger.warn(`Redis GET failed for key "${key}": ${err.message}`);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = this.defaultTTL): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await redis.set(key, serialized, 'EX', ttlSeconds);
    } catch (err: any) {
      logger.warn(`Redis SET failed for key "${key}": ${err.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (err: any) {
      logger.warn(`Redis DEL failed for key "${key}": ${err.message}`);
    }
  }

  /**
   * Scans and deletes keys matching a glob pattern safely using SCAN
   */
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      let cursor = '0';
      let deletedTotal = 0;
      do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          const count = await redis.del(...keys);
          deletedTotal += count;
        }
      } while (cursor !== '0');

      if (deletedTotal > 0) {
        logger.info(`Invalidated ${deletedTotal} cache keys matching pattern: ${pattern}`);
      }
      return deletedTotal;
    } catch (err: any) {
      logger.warn(`Redis SCAN/DEL invalidation failed for pattern "${pattern}": ${err.message}`);
      return 0;
    }
  }

  /**
   * Invalidate all cached data for a specific tenant and resource
   */
  async invalidateTenantResource(tenantId: string, resource: string): Promise<number> {
    const pattern = `edusphere:tenant:${tenantId}:${resource}:*`;
    return this.invalidatePattern(pattern);
  }

  /**
   * Invalidate all cached data for a specific tenant across all resources
   */
  async invalidateTenantAll(tenantId: string): Promise<number> {
    const pattern = `edusphere:tenant:${tenantId}:*`;
    return this.invalidatePattern(pattern);
  }
}

export const cacheService = new CacheService();
