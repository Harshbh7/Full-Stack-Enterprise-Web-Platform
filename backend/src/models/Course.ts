import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICourse extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  instructorId: Types.ObjectId;
  title: string;
  slug: string;
  code: string;
  description: string;
  thumbnailUrl?: string;
  category: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  price: number;
  enrolledCount: number;
  ratingAverage: number;
  ratingCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    thumbnailUrl: { type: String },
    category: { type: String, required: true, index: true },
    level: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      default: 'INTERMEDIATE',
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'PUBLISHED',
      index: true,
    },
    price: { type: Number, default: 0 },
    enrolledCount: { type: Number, default: 0, index: true },
    ratingAverage: { type: Number, default: 4.8 },
    ratingCount: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for tenant isolation and catalog queries
CourseSchema.index({ tenantId: 1, slug: 1 }, { unique: true });
CourseSchema.index({ tenantId: 1, status: 1, category: 1 });
CourseSchema.index({ tenantId: 1, enrolledCount: -1 });

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
