import { describe, it, expect, vi } from 'vitest';
import { requireRole } from '../../src/middleware/rbac.middleware.js';
import { AuthenticatedRequest, UserRole } from '../../src/types/index.js';
import { Response, NextFunction } from 'express';

describe('RBAC Middleware Unit Tests', () => {
  const createMockReq = (role?: UserRole): AuthenticatedRequest => {
    return {
      user: role
        ? {
            userId: 'user-123',
            email: 'user@test.edu',
            role,
            tenantId: 'tenant-123',
          }
        : undefined,
    } as unknown as AuthenticatedRequest;
  };

  const mockRes = {} as Response;

  it('RBAC-01: allows authorized role through middleware chain', () => {
    const middleware = requireRole(['INSTRUCTOR', 'TENANT_ADMIN', 'SUPER_ADMIN']);
    const req = createMockReq('INSTRUCTOR');
    const next = vi.fn() as NextFunction;

    middleware(req, mockRes, next);

    expect(next).toHaveBeenCalledWith(); // called with no error
  });

  it('RBAC-02: rejects request with UnauthorizedError when user is not authenticated', () => {
    const middleware = requireRole(['STUDENT']);
    const req = createMockReq(undefined);
    const next = vi.fn() as NextFunction;

    middleware(req, mockRes, next);

    expect(next).toHaveBeenCalled();
    const errorPassed = next.mock.calls[0][0];
    expect(errorPassed).toBeDefined();
    expect(errorPassed.statusCode).toBe(401);
  });

  it('RBAC-03: rejects unauthorized role with ForbiddenError 403', () => {
    const middleware = requireRole(['SUPER_ADMIN']);
    const req = createMockReq('STUDENT');
    const next = vi.fn() as NextFunction;

    middleware(req, mockRes, next);

    expect(next).toHaveBeenCalled();
    const errorPassed = next.mock.calls[0][0];
    expect(errorPassed).toBeDefined();
    expect(errorPassed.statusCode).toBe(403);
    expect(errorPassed.message).toContain('STUDENT');
  });
});

