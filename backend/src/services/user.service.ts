import { userRepository } from '../repositories/user.repository.js';
import { IUser, User } from '../models/User.js';
import { hashPassword } from '../utils/password.util.js';
import { BadRequestError, ForbiddenError, ConflictError, NotFoundError } from '../utils/errors.util.js';
import { PaginationOptions, PaginatedResult } from '../repositories/base.repository.js';

export interface InviteUserInput {
  firstName: string;
  lastName: string;
  email: string;
  role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  tenantId?: string;
  password?: string;
}

export class UserService {
  async listUsers(
    tenantId: string | undefined,
    isSuperAdmin: boolean,
    search?: string,
    role?: string,
    options: PaginationOptions = { page: 1, limit: 10, skip: 0 }
  ): Promise<PaginatedResult<IUser>> {
    return userRepository.searchUsers(search, role, tenantId, isSuperAdmin, options);
  }

  async getUserById(
    userId: string,
    tenantId: string | undefined,
    isSuperAdmin: boolean
  ): Promise<IUser> {
    const user = await userRepository.findById(userId, tenantId, isSuperAdmin);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async inviteUser(
    input: InviteUserInput,
    currentUser: { userId: string; role: string; tenantId?: string }
  ): Promise<Partial<IUser>> {
    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

    // Privilege escalation protection: only SUPER_ADMIN can assign SUPER_ADMIN role
    if (input.role === 'SUPER_ADMIN' && !isSuperAdmin) {
      throw new ForbiddenError(
        'Only Super Admins can provision Super Admin accounts',
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    // Determine target tenant
    const targetTenantId = isSuperAdmin
      ? input.tenantId || (input.role === 'SUPER_ADMIN' ? undefined : currentUser.tenantId)
      : currentUser.tenantId;

    if (!isSuperAdmin && !targetTenantId) {
      throw new BadRequestError('Tenant context is required to invite user');
    }

    // Check if user already exists
    const existing = await userRepository.findByEmail(input.email, targetTenantId, isSuperAdmin);
    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const initialPassword = input.password || 'Password123!';
    const passwordHash = await hashPassword(initialPassword);

    const newUser = await userRepository.create({
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.toLowerCase().trim(),
      passwordHash,
      role: input.role || 'STUDENT',
      tenantId: targetTenantId as any,
      status: 'ACTIVE',
    });

    const sanitized = newUser.toObject();
    delete (sanitized as any).passwordHash;
    delete (sanitized as any).password;

    return sanitized;
  }

  async resetPassword(
    targetEmail: string,
    currentUser: { userId: string; email: string; role: string; tenantId?: string },
    newPassword?: string
  ): Promise<{ success: boolean; message: string }> {
    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

    // Find the target user
    const targetUser = await userRepository.findByEmail(targetEmail, currentUser.tenantId, isSuperAdmin);
    if (!targetUser) {
      throw new NotFoundError(`User with email "${targetEmail}" not found in this organization`);
    }

    const isSelf = targetUser.email.toLowerCase() === currentUser.email.toLowerCase();

    // STRICT RBAC & PERMISSION BOUNDARY:
    // Instructors can ONLY reset their own password or a STUDENT's password
    if (currentUser.role === 'INSTRUCTOR') {
      if (!isSelf && targetUser.role !== 'STUDENT') {
        throw new ForbiddenError(
          'Instructors are only authorized to reset passwords for themselves or their students',
          'UNAUTHORIZED_PASSWORD_RESET'
        );
      }
    }

    // Tenant Admin cannot reset Super Admin
    if (currentUser.role === 'TENANT_ADMIN') {
      if (targetUser.role === 'SUPER_ADMIN') {
        throw new ForbiddenError(
          'Tenant Admins cannot reset Super Admin passwords',
          'UNAUTHORIZED_PASSWORD_RESET'
        );
      }
    }

    // Students can only reset their own password
    if (currentUser.role === 'STUDENT' && !isSelf) {
      throw new ForbiddenError(
        'Students can only reset their own password',
        'UNAUTHORIZED_PASSWORD_RESET'
      );
    }

    const passwordToSet = newPassword || 'Password123!';
    const passwordHash = await hashPassword(passwordToSet);

    await userRepository.update(targetUser._id.toString(), { passwordHash }, currentUser.tenantId, isSuperAdmin);

    return {
      success: true,
      message: `Password reset link dispatched and credentials updated for ${targetUser.email}`,
    };
  }

  async deleteUser(
    userIdOrEmail: string,
    currentUser: { userId: string; role: string; tenantId?: string }
  ): Promise<boolean> {
    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
    let user = await userRepository.findById(userIdOrEmail, currentUser.tenantId, isSuperAdmin);
    if (!user) {
      user = await userRepository.findByEmail(userIdOrEmail, currentUser.tenantId, isSuperAdmin);
    }
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user._id.toString() === currentUser.userId) {
      throw new BadRequestError('Cannot delete your own active administrator account');
    }

    if (user.role === 'SUPER_ADMIN' && !isSuperAdmin) {
      throw new ForbiddenError('Cannot delete a Super Admin account');
    }

    return userRepository.delete(user._id.toString(), currentUser.tenantId, isSuperAdmin);
  }

  async getPendingVerifications(currentUser: { userId: string; role: string; tenantId?: string }): Promise<IUser[]> {
    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

    if (isSuperAdmin) {
      // Super Admin reviews all pending College Administrators
      return User.find({
        status: 'PENDING_VERIFICATION',
        $or: [{ requestedRole: 'TENANT_ADMIN' }, { verifierRole: 'SUPER_ADMIN' }],
      })
        .populate('tenantId', 'name slug domain')
        .sort({ createdAt: -1 })
        .exec();
    }

    if (currentUser.role === 'TENANT_ADMIN') {
      // College Admin reviews pending Instructors for their college
      if (!currentUser.tenantId) return [];
      return User.find({
        tenantId: currentUser.tenantId,
        status: 'PENDING_VERIFICATION',
        $or: [{ requestedRole: 'INSTRUCTOR' }, { verifierRole: 'TENANT_ADMIN' }],
      })
        .populate('tenantId', 'name slug domain')
        .sort({ createdAt: -1 })
        .exec();
    }

    if (currentUser.role === 'INSTRUCTOR') {
      // Teachers review pending Students for their college
      if (!currentUser.tenantId) return [];
      return User.find({
        tenantId: currentUser.tenantId,
        status: 'PENDING_VERIFICATION',
        $or: [{ requestedRole: 'STUDENT' }, { verifierRole: 'INSTRUCTOR' }],
      })
        .populate('tenantId', 'name slug domain')
        .sort({ createdAt: -1 })
        .exec();
    }

    return [];
  }

  async approveUser(
    targetIdOrEmail: string,
    currentUser: { userId: string; role: string; tenantId?: string }
  ): Promise<IUser> {
    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
    let target = await User.findById(targetIdOrEmail).exec();
    if (!target) {
      target = await User.findOne({ email: targetIdOrEmail.toLowerCase().trim() }).exec();
    }
    if (!target) {
      throw new NotFoundError('Target user for verification not found');
    }

    // Security Gate: Self-approval prohibited
    if (currentUser.userId && target._id.toString() === currentUser.userId) {
      throw new ForbiddenError('Users are not permitted to authorize their own accounts', 'SELF_APPROVAL_PROHIBITED');
    }

    // Security Gate: Cross-tenant isolation enforcement
    if (!isSuperAdmin) {
      if (!currentUser.tenantId || !target.tenantId || target.tenantId.toString() !== currentUser.tenantId.toString()) {
        throw new ForbiddenError(
          'Cross-tenant authorization prohibited: You can only verify users within your institution',
          'CROSS_TENANT_VIOLATION'
        );
      }
    }

    // Check verification authorization
    const targetRole = target.requestedRole || target.role;
    if (targetRole === 'TENANT_ADMIN' && !isSuperAdmin) {
      throw new ForbiddenError('Only Global Super Admin can approve College Administrators');
    }
    if (targetRole === 'INSTRUCTOR' && currentUser.role !== 'TENANT_ADMIN' && !isSuperAdmin) {
      throw new ForbiddenError('Only College Administrators can approve Instructors');
    }
    if (targetRole === 'STUDENT' && currentUser.role !== 'INSTRUCTOR' && currentUser.role !== 'TENANT_ADMIN' && !isSuperAdmin) {
      throw new ForbiddenError('Only Instructors or College Administrators can approve Students');
    }

    target.status = 'ACTIVE';
    target.role = targetRole;
    await target.save();
    return target;
  }

  async rejectUser(
    targetIdOrEmail: string,
    currentUser: { userId: string; role: string; tenantId?: string }
  ): Promise<IUser> {
    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
    let target = await User.findById(targetIdOrEmail).exec();
    if (!target) {
      target = await User.findOne({ email: targetIdOrEmail.toLowerCase().trim() }).exec();
    }
    if (!target) {
      throw new NotFoundError('Target user for verification not found');
    }

    // Security Gate: Self-rejection prohibited
    if (currentUser.userId && target._id.toString() === currentUser.userId) {
      throw new ForbiddenError('Users cannot reject their own account', 'SELF_REJECTION_PROHIBITED');
    }

    // Security Gate: Cross-tenant isolation enforcement
    if (!isSuperAdmin) {
      if (!currentUser.tenantId || !target.tenantId || target.tenantId.toString() !== currentUser.tenantId.toString()) {
        throw new ForbiddenError(
          'Cross-tenant authorization prohibited: You can only reject users within your institution',
          'CROSS_TENANT_VIOLATION'
        );
      }
    }

    // Hierarchical authority check for rejection
    const targetRole = target.requestedRole || target.role;
    if (targetRole === 'TENANT_ADMIN' && !isSuperAdmin) {
      throw new ForbiddenError('Only Global Super Admin can reject College Administrators');
    }
    if (targetRole === 'INSTRUCTOR' && currentUser.role !== 'TENANT_ADMIN' && !isSuperAdmin) {
      throw new ForbiddenError('Only College Administrators can reject Instructors');
    }
    if (targetRole === 'STUDENT' && currentUser.role !== 'INSTRUCTOR' && currentUser.role !== 'TENANT_ADMIN' && !isSuperAdmin) {
      throw new ForbiddenError('Only Instructors or College Administrators can reject Students');
    }

    target.status = 'REJECTED';
    await target.save();
    return target;
  }
}

export const userService = new UserService();
