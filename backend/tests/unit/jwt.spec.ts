import { describe, it, expect } from 'vitest';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../../src/utils/jwt.util.js';

describe('JWT Dual-Token Security Utility Unit Tests', () => {
  const mockPayload = {
    userId: '507f1f77bcf86cd799439011',
    email: 'test.student@apex.edu',
    role: 'STUDENT' as const,
    tenantId: '507f1f77bcf86cd799439022',
  };

  it('JWT-01: signs access token containing user, role, and tenant claims', () => {
    const token = generateAccessToken(mockPayload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(mockPayload.userId);
    expect(decoded.email).toBe(mockPayload.email);
    expect(decoded.role).toBe(mockPayload.role);
    expect(decoded.tenantId).toBe(mockPayload.tenantId);
  });

  it('JWT-02: signs and verifies refresh token with long-lived secret', () => {
    const refreshToken = generateRefreshToken(mockPayload);
    expect(refreshToken).toBeDefined();

    const decoded = verifyRefreshToken(refreshToken);
    expect(decoded.userId).toBe(mockPayload.userId);
    expect(decoded.role).toBe('STUDENT');
  });

  it('JWT-03: rejects tampered token payload with signature error', () => {
    const token = generateAccessToken(mockPayload);
    const tampered = token.slice(0, -6) + 'abcdef';

    expect(() => verifyAccessToken(tampered)).toThrow();
  });
});

