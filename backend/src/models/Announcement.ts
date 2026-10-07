import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAnnouncement extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  courseId?: Types.ObjectId;
  authorId: Types.ObjectId;
  title: string;
  content: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    priority: {
      type: String,
      enum: ['LOW', 'NORMAL', 'HIGH'],
      default: 'NORMAL',
    },
  },
  {
    timestamps: true,
  }
);

AnnouncementSchema.index({ tenantId: 1, courseId: 1, createdAt: -1 });

export const Announcement = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
