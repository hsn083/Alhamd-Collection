import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHeroSlide extends Document {
  title: string;
  subtitle: string;
  description?: string;
  imageDesktop: string;
  imageMobile: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const HeroSlideSchema = new Schema<IHeroSlide>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      required: [true, 'Subtitle is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageDesktop: {
      type: String,
      required: [true, 'Desktop image is required'],
    },
    imageMobile: {
      type: String,
      required: [true, 'Mobile image is required'],
    },
    buttonText: {
      type: String,
      required: [true, 'Button text is required'],
      trim: true,
    },
    buttonLink: {
      type: String,
      required: [true, 'Button link is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
HeroSlideSchema.index({ isActive: 1, order: 1 });

const HeroSlide: Model<IHeroSlide> = mongoose.models.HeroSlide || mongoose.model<IHeroSlide>('HeroSlide', HeroSlideSchema);

export default HeroSlide;
