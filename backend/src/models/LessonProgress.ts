import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILessonProgress extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  lessonId: Types.ObjectId;
  isCompleted: boolean;
  secondsWatched?: number;
  completedAt?: Date;
}

const LessonProgressSchema = new Schema<ILessonProgress>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true },
    isCompleted: { type: Boolean, default: false },
    secondsWatched: { type: Number, default: 0 },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

LessonProgressSchema.index({ tenantId: 1, studentId: 1, lessonId: 1 }, { unique: true });
LessonProgressSchema.index({ tenantId: 1, studentId: 1, courseId: 1 });

export const LessonProgress = mongoose.model<ILessonProgress>('LessonProgress', LessonProgressSchema);
