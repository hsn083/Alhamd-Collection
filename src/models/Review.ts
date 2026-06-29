import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  images?: string[];
  variant?: {
    size?: string;
    color?: string;
  };
  isVerifiedPurchase: boolean;
  likes: number;
  helpful: number;
  helpfulUsers: string[];
  status: 'pending' | 'approved' | 'rejected';
  adminReply?: {
    comment: string;
    repliedAt: Date;
    repliedBy: mongoose.Types.ObjectId;
  };
  sellerReply?: {
    reply: string;
    date: string;
    sellerName: string;
  };
  reported?: boolean;
  reportReason?: string;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    images: [
      {
        type: String,
      },
    ],
    variant: {
      size: String,
      color: String,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },
    helpfulUsers: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminReply: {
      comment: String,
      repliedAt: Date,
      repliedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    },
    sellerReply: {
      reply: String,
      date: String,
      sellerName: String,
    },
    reported: {
      type: Boolean,
      default: false,
    },
    reportReason: String,
    sessionId: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
ReviewSchema.index({ product: 1 });
ReviewSchema.index({ user: 1 });
ReviewSchema.index({ status: 1 });
ReviewSchema.index({ rating: -1 });
ReviewSchema.index({ createdAt: -1 });

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
