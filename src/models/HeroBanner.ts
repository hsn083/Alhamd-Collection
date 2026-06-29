import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHeroBanner extends Document {
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link?: string;
  buttonText?: string;
  isActive: boolean;
  displayOrder: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const HeroBannerSchema = new Schema<IHeroBanner>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
    mobileImage: String,
    link: String,
    buttonText: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    startDate: Date,
    endDate: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
HeroBannerSchema.index({ isActive: 1 });
HeroBannerSchema.index({ displayOrder: 1 });

const HeroBanner: Model<IHeroBanner> = mongoose.models.HeroBanner || mongoose.model<IHeroBanner>('HeroBanner', HeroBannerSchema);

export default HeroBanner;
