import { z } from 'zod';

export const inviteUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Valid email address required'),
  role: z.enum(['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR', 'STUDENT']),
  tenantId: z.string().optional(),
  password: z.string().min(6).optional(),
});
