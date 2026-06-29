import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHomepageSettings extends Document {
  featuredProducts: mongoose.Types.ObjectId[];
  newArrivals: mongoose.Types.ObjectId[];
  bestSellers: mongoose.Types.ObjectId[];
  showFeatured: boolean;
  showNewArrivals: boolean;
  showBestSellers: boolean;
  customSections?: Array<{
    title: string;
    products: mongoose.Types.ObjectId[];
    displayOrder: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const HomepageSettingsSchema = new Schema<IHomepageSettings>(
  {
    featuredProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    newArrivals: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    bestSellers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    showFeatured: {
      type: Boolean,
      default: true,
    },
    showNewArrivals: {
      type: Boolean,
      default: true,
    },
    showBestSellers: {
      type: Boolean,
      default: true,
    },
    customSections: [
      {
        title: String,
        products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
        displayOrder: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const HomepageSettings: Model<IHomepageSettings> = mongoose.models.HomepageSettings || mongoose.model<IHomepageSettings>('HomepageSettings', HomepageSettingsSchema);

export default HomepageSettings;
