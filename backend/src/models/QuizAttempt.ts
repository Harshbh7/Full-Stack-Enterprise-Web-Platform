import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IQuizAttemptAnswer {
  questionId: Types.ObjectId;
  selectedOptionIds: string[];
}

export interface IQuizAttempt extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  quizId: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  answers: IQuizAttemptAnswer[];
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  startedAt: Date;
  submittedAt: Date;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
        selectedOptionIds: [{ type: String }],
      },
    ],
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

QuizAttemptSchema.index({ tenantId: 1, studentId: 1, quizId: 1 });

export const QuizAttempt = mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
