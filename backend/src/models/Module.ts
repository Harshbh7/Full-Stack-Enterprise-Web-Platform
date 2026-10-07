import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IModule extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  courseId: Types.ObjectId;
  title: string;
  order: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ModuleSchema = new Schema<IModule>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true, default: 1 },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

ModuleSchema.index({ tenantId: 1, courseId: 1, order: 1 });

export const Module = mongoose.model<IModule>('Module', ModuleSchema);
