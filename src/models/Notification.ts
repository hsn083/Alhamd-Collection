import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId | string;
  recipientType: 'user' | 'admin';
  type: 'order' | 'payment' | 'review' | 'stock' | 'system' | 'return';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.Mixed,
      required: false,
    },
    recipientType: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    type: {
      type: String,
      enum: ['order', 'payment', 'review', 'stock', 'system','return'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: String,
    isRead: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
NotificationSchema.index({ recipient: 1, recipientType: 1 });
NotificationSchema.index({ isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
