import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface IQuestion extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  quizId: Types.ObjectId;
  prompt: string;
  questionType: 'MULTIPLE_CHOICE' | 'MULTI_SELECT' | 'TRUE_FALSE';
  options: IOption[];
  explanation?: string;
  points: number;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    prompt: { type: String, required: true },
    questionType: {
      type: String,
      enum: ['MULTIPLE_CHOICE', 'MULTI_SELECT', 'TRUE_FALSE'],
      default: 'MULTIPLE_CHOICE',
    },
    options: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
        isCorrect: { type: Boolean, required: true, default: false },
      },
    ],
    explanation: { type: String },
    points: { type: Number, default: 10 },
  },
  {
    timestamps: true,
  }
);

QuestionSchema.index({ tenantId: 1, quizId: 1 });

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema);
