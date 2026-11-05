import crypto from 'crypto';
import { User, IUser } from '../models/User.js';
import { Tenant } from '../models/Tenant.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { verifyPassword, hashPassword, hashToken } from '../utils/password.util.js';
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

  async loginWithGoogleSso(
    email: string,
    name?: string,
    tenantSlug?: string,
    requestedRole?: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'INSTRUCTOR' | 'STUDENT',
    userAgent?: string,
    ipAddress?: string
  ) {
    let tenantId;
    let tenant;

    const cleanEmail = email.toLowerCase().trim();

    if (tenantSlug && tenantSlug !== 'global') {
      tenant = await Tenant.findOne({ slug: tenantSlug.toLowerCase(), status: 'ACTIVE' });
      if (!tenant) {
        tenant = await Tenant.findOne({ slug: new RegExp(`^${tenantSlug}$`, 'i') });
      }
      if (tenant) {
        tenantId = tenant._id;
      }
    }

    let user = await User.findOne({ email: cleanEmail });

    // STRICT SECURITY GATE:
    // If the account does not exist and no requestedRole is supplied, this is a SIGN-IN attempt.
    // MUST NOT auto-create a user! MUST NOT guess roles! Return 404!
    if (!user) {
      if (!requestedRole) {
        throw new NotFoundError(
          `No registered account found with email "${cleanEmail}". Please register first and select your university and role.`
        );
      }

      // Explicit REGISTRATION request
      const rawName = name || cleanEmail.split('@')[0];
      const nameParts = rawName.split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || 'Account';

      const targetRole = requestedRole;

      // Hierarchical verification rules:
      // - TENANT_ADMIN -> Super Admin verifies
      // - INSTRUCTOR -> College Admin verifies
      // - STUDENT -> Teacher verifies
      let status: 'ACTIVE' | 'PENDING_VERIFICATION' = 'PENDING_VERIFICATION';
      let verifierRole: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'INSTRUCTOR' | undefined;

      if (targetRole === 'SUPER_ADMIN') {
        if (cleanEmail === 'superadmin@edusphere.io') {
          status = 'ACTIVE';
        } else {
          verifierRole = 'SUPER_ADMIN';
        }
      } else if (targetRole === 'TENANT_ADMIN') {
        verifierRole = 'SUPER_ADMIN';
      } else if (targetRole === 'INSTRUCTOR') {
        verifierRole = 'TENANT_ADMIN';
      } else if (targetRole === 'STUDENT') {
        verifierRole = 'INSTRUCTOR';
      }

      const randomPassword = crypto.randomBytes(16).toString('hex') + 'Aa1!';
      user = await User.create({
        email: cleanEmail,
        passwordHash: await hashPassword(randomPassword),
        firstName,
        lastName,
        role: targetRole,
        requestedRole: targetRole,
        verifierRole,
        tenantId: targetRole === 'SUPER_ADMIN' ? undefined : tenantId,
        status,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + '+' + lastName)}&background=3E6B48&color=fff`,
      });
    }

    if (user.status === 'REJECTED') {
      throw new ForbiddenError(`Registration for "${cleanEmail}" was rejected by institutional administration.`);
    }

    if (user.status === 'SUSPENDED') {
      throw new ForbiddenError(`Account "${cleanEmail}" is currently suspended.`);
    }

    if (user.status === 'PENDING_VERIFICATION') {
      return {
        accessToken: null,
        refreshToken: null,
        isPending: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          requestedRole: user.requestedRole || user.role,
          verifierRole: user.verifierRole,
          status: 'PENDING_VERIFICATION',
          tenantId: user.tenantId?.toString(),
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

    user.lastLoginAt = new Date();
    await user.save();

    if (!tenant && user.tenantId) {
      tenant = await Tenant.findById(user.tenantId);
    }

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

    const familyId = crypto.randomUUID();
    const tokenH = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

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
      isPending: false,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
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
