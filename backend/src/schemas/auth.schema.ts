import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  tenantSlug: z.string().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});
