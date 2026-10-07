import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IQuiz extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  courseId: Types.ObjectId;
  title: string;
  description?: string;
  passingScorePercentage: number;
  timeLimitMinutes: number;
  maxAttempts: number;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema = new Schema<IQuiz>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    passingScorePercentage: { type: Number, default: 70 },
    timeLimitMinutes: { type: Number, default: 20 },
    maxAttempts: { type: Number, default: 3 },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED'],
      default: 'PUBLISHED',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

QuizSchema.index({ tenantId: 1, courseId: 1 });

export const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema);
