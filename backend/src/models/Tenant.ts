import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITenant extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  domain?: string;
  logoUrl?: string;
  primaryColor?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
  settings: {
    allowSelfRegistration: boolean;
    maxStudents: number;
    maxCourses: number;
    storageQuotaBytes: number;
    requireMFA: boolean;
  };
  contactEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    domain: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    logoUrl: { type: String },
    primaryColor: { type: String, default: '#2563EB' },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'TRIAL'],
      default: 'ACTIVE',
      index: true,
    },
    settings: {
      allowSelfRegistration: { type: Boolean, default: true },
      maxStudents: { type: Number, default: 5000 },
      maxCourses: { type: Number, default: 200 },
      storageQuotaBytes: { type: Number, default: 107374182400 }, // 100 GB
      requireMFA: { type: Boolean, default: false },
    },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
  },
  {
    timestamps: true,
  }
);

export const Tenant = mongoose.model<ITenant>('Tenant', TenantSchema);
