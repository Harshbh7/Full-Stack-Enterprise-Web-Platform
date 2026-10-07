import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILesson extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  courseId: Types.ObjectId;
  moduleId: Types.ObjectId;
  title: string;
  order: number;
  contentType: 'VIDEO' | 'MARKDOWN' | 'PDF' | 'AUDIO';
  contentUrl?: string;
  textContent?: string;
  durationSeconds: number;
  isFreePreview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true, index: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true, default: 1 },
    contentType: {
      type: String,
      enum: ['VIDEO', 'MARKDOWN', 'PDF', 'AUDIO'],
      default: 'VIDEO',
    },
    contentUrl: { type: String },
    textContent: { type: String },
    durationSeconds: { type: Number, default: 600 },
    isFreePreview: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

LessonSchema.index({ tenantId: 1, moduleId: 1, order: 1 });
LessonSchema.index({ tenantId: 1, courseId: 1 });

export const Lesson = mongoose.model<ILesson>('Lesson', LessonSchema);
