import crypto from 'crypto';
import { User, IUser } from '../models/User.js';
import { Tenant } from '../models/Tenant.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { verifyPassword, hashToken } from '../utils/password.util.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util.js';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../utils/errors.util.js';
import { redis } from '../config/redis.js';

export class AuthService {
  async login(email: string, passwordPlain: string, tenantSlug?: string, userAgent?: string, ipAddress?: string) {
    let tenantId;
    let tenant;

    // Resolve tenant if provided and not global superadmin
    if (tenantSlug && tenantSlug !== 'global') {
      tenant = await Tenant.findOne({ slug: tenantSlug.toLowerCase(), status: 'ACTIVE' });
      if (!tenant) {
        throw new NotFoundError(`Tenant organization [${tenantSlug}] not found or inactive`);
      }
      tenantId = tenant._id;
    }

    // Find user query
    const userQuery: Record<string, unknown> = { email: email.toLowerCase() };
    if (tenantId) {
      userQuery.tenantId = tenantId;
    }

    const user = await User.findOne(userQuery);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenError(`User account is ${user.status.toLowerCase()}`);
    }

    // Verify Argon2id password hash
    const isPasswordValid = await verifyPassword(user.passwordHash, passwordPlain);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password credentials');
    }

    // Update last login timestamp
    user.lastLoginAt = new Date();
    await user.save();

    // If user belongs to a tenant but tenant wasn't loaded
    if (!tenant && user.tenantId) {
      tenant = await Tenant.findById(user.tenantId);
    }

    // Generate token pair
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId ? user.tenantId.toString() : undefined,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({
      ...tokenPayload,
      jti: crypto.randomUUID(),
    });

    // Save refresh token family
    const familyId = crypto.randomUUID();
    const tokenH = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await RefreshToken.create({
      userId: user._id,
      tenantId: user.tenantId,
      tokenHash: tokenH,
      familyId,
      expiresAt,
      userAgent,
      ipAddress,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId?.toString(),
        avatarUrl: user.avatarUrl,
      },
      tenant: tenant
        ? {
            id: tenant._id.toString(),
            name: tenant.name,
            slug: tenant.slug,
            primaryColor: tenant.primaryColor,
            status: tenant.status,
          }
        : null,
    };
  }

  async rotateRefreshToken(oldRefreshToken: string, userAgent?: string, ipAddress?: string) {
    let payload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const oldTokenHash = hashToken(oldRefreshToken);
    const existingRecord = await RefreshToken.findOne({ tokenHash: oldTokenHash });

    if (!existingRecord) {
      throw new UnauthorizedError('Refresh token session not found');
    }

    // Token Reuse Detection: If revoked token is used again, revoke the whole family!
    if (existingRecord.isRevoked) {
      await RefreshToken.updateMany({ familyId: existingRecord.familyId }, { isRevoked: true });
      throw new ForbiddenError(
        'Security breach detected: Refresh token reuse detected. All sessions in this family revoked.',
        'TOKEN_FAMILY_REVOKED'
      );
    }

    // Revoke old token
    existingRecord.isRevoked = true;
    await existingRecord.save();

    // Fetch user
    const user = await User.findById(existingRecord.userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedError('User account not found or suspended');
    }

    // Issue new pair
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId ? user.tenantId.toString() : undefined,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken({
      ...tokenPayload,
      jti: crypto.randomUUID(),
    });

    // Save rotated token in same family
    await RefreshToken.create({
      userId: user._id,
      tenantId: user.tenantId,
      tokenHash: hashToken(newRefreshToken),
      familyId: existingRecord.familyId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent,
      ipAddress,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshTokenStr: string) {
    if (!refreshTokenStr) return;
    const tokenH = hashToken(refreshTokenStr);
    await RefreshToken.updateOne({ tokenHash: tokenH }, { isRevoked: true });
  }

  async getCurrentUser(userId: string) {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) throw new NotFoundError('User not found');

    let tenant = null;
    if (user.tenantId) {
      tenant = await Tenant.findById(user.tenantId);
    }

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId?.toString(),
        avatarUrl: user.avatarUrl,
      },
      tenant: tenant
        ? {
            id: tenant._id.toString(),
            name: tenant.name,
            slug: tenant.slug,
            primaryColor: tenant.primaryColor,
            status: tenant.status,
          }
        : null,
    };
  }
}

export const authService = new AuthService();
