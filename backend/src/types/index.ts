import { Request } from 'express';
import { Types } from 'mongoose';

export type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'INSTRUCTOR' | 'STUDENT';

export interface IJwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  iat?: number;
  exp?: number;
}

export interface ITenantContext {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
  settings?: Record<string, unknown>;
}

export interface AuthenticatedRequest extends Request {
  user?: IJwtPayload;
  tenant?: ITenantContext;
  tenantId?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
  errors?: Array<{ field?: string; message: string }>;
  code?: string;
  timestamp?: string;
}
