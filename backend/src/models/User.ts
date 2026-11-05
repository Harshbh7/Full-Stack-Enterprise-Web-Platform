import mongoose, { Schema, Document, Types } from 'mongoose';
import { UserRole } from '../types/index.js';

export interface IUser extends Document {
  _id: Types.ObjectId;
  tenantId?: Types.ObjectId;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: UserRole;
  requestedRole?: UserRole;
  verifierRole?: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'INSTRUCTOR';
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'REJECTED' | 'INACTIVE' | 'SUSPENDED';
  authProvider: 'LOCAL' | 'GOOGLE' | 'GITHUB';
  providerId?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    avatarUrl: { type: String },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR', 'STUDENT'],
      required: true,
      index: true,
    },
    requestedRole: {
      type: String,
      enum: ['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR', 'STUDENT'],
    },
    verifierRole: {
      type: String,
      enum: ['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR'],
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING_VERIFICATION', 'REJECTED', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
      index: true,
    },
    authProvider: {
      type: String,
      enum: ['LOCAL', 'GOOGLE', 'GITHUB'],
      default: 'LOCAL',
    },
    providerId: { type: String },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Compound index guaranteeing email uniqueness within the tenant partition
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export const User = mongoose.model<IUser>('User', UserSchema);
