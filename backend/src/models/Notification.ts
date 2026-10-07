import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  recipientId: Types.ObjectId;
  title: string;
  body: string;
  type: 'COURSE_UPDATE' | 'QUIZ_GRADED' | 'ANNOUNCEMENT' | 'SYSTEM';
  linkUrl?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ['COURSE_UPDATE', 'QUIZ_GRADED', 'ANNOUNCEMENT', 'SYSTEM'],
      default: 'SYSTEM',
    },
    linkUrl: { type: String },
    isRead: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

NotificationSchema.index({ tenantId: 1, recipientId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
