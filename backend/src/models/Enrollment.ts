import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEnrollment extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  progressPercentage: number;
  enrolledAt: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'DROPPED'],
      default: 'ACTIVE',
      index: true,
    },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    lastAccessedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate student enrollments in the same course within a tenant
EnrollmentSchema.index({ tenantId: 1, studentId: 1, courseId: 1 }, { unique: true });
EnrollmentSchema.index({ tenantId: 1, courseId: 1, status: 1 });

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
