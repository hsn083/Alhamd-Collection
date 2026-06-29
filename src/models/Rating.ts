import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRating extends Document {
  product: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  rating: number;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>(
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
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    sessionId: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
RatingSchema.index({ product: 1, user: 1 }, { unique: true });
RatingSchema.index({ product: 1, sessionId: 1 }, { unique: true, sparse: true });

const Rating: Model<IRating> = mongoose.models.Rating || mongoose.model<IRating>('Rating', RatingSchema);

export default Rating;
