import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWishlist extends Document {
  user?: mongoose.Types.ObjectId;
  sessionId: string;
  products: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    sessionId: {
      type: String,
      required: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
WishlistSchema.index({ user: 1 }, { unique: true, sparse: true });
WishlistSchema.index({ sessionId: 1 }, { unique: true, sparse: true });

const Wishlist: Model<IWishlist> = mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);

export default Wishlist;
