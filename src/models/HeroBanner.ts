import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHeroBanner extends Document {
  // Images
  desktopImage: string;
  mobileImage: string;
  
  // Content
  heading: string;
  subHeading: string;
  description?: string;
  buttonText: string;
  buttonUrl: string;
  
  // Layout
  textAlignment: 'left' | 'center' | 'right';
  verticalAlignment: 'top' | 'center' | 'bottom';
  
  // Text Colors
  headingColor: string;
  subHeadingColor: string;
  descriptionColor: string;
  badgeColor?: string;
  badgeTextColor?: string;
  
  // Button Settings
  buttonBackgroundColor: string;
  buttonTextColor: string;
  buttonBorderColor?: string;
  buttonHoverBackgroundColor: string;
  buttonHoverTextColor: string;
  buttonHoverBorderColor?: string;
  buttonBorderRadius: number;
  buttonShadow?: string;
  buttonHoverShadow?: string;
  
  // Background
  bannerBackgroundColor: string;
  contentBoxBackgroundColor?: string;
  contentBoxOpacity?: number;
  overlayColor: string;
  overlayOpacity: number;
  useGradientOverlay?: boolean;
  gradientColors?: string[];
  
  // Typography
  fontFamily?: string;
  headingFontSize?: number;
  subHeadingFontSize?: number;
  descriptionFontSize?: number;
  buttonFontSize?: number;
  fontWeight?: string;
  letterSpacing?: number;
  lineHeight?: number;
  textShadow?: string;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  
  // Content Box
  contentBoxWidth?: number;
  contentBoxPadding?: number;
  contentBoxBorderRadius?: number;
  contentBoxBlur?: number;
  contentBoxShadow?: string;
  contentBoxMaxWidth?: number;
  
  // Status
  isActive: boolean;
  displayOrder: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const HeroBannerSchema = new Schema<IHeroBanner>(
  {
    // Images
    desktopImage: {
      type: String,
      required: [true, 'Desktop image is required'],
    },
    mobileImage: {
      type: String,
      required: [true, 'Mobile image is required'],
    },
    
    // Content
    heading: {
      type: String,
      required: [true, 'Heading is required'],
      trim: true,
    },
    subHeading: {
      type: String,
      required: [true, 'Sub heading is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    buttonText: {
      type: String,
      required: [true, 'Button text is required'],
      trim: true,
    },
    buttonUrl: {
      type: String,
      required: [true, 'Button URL is required'],
      trim: true,
    },
    
    // Layout
    textAlignment: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'left',
    },
    verticalAlignment: {
      type: String,
      enum: ['top', 'center', 'bottom'],
      default: 'center',
    },
    
    // Overlay
    overlayColor: {
      type: String,
      default: '#000000',
    },
    overlayOpacity: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    useGradientOverlay: {
      type: Boolean,
      default: false,
    },
    gradientColors: {
      type: [String],
      default: ['#000000', '#000000'],
    },
    
    // Text Colors
    headingColor: {
      type: String,
      default: '#ffffff',
    },
    subHeadingColor: {
      type: String,
      default: '#ffffff',
    },
    descriptionColor: {
      type: String,
      default: '#ffffff',
    },
    badgeColor: {
      type: String,
    },
    badgeTextColor: {
      type: String,
    },
    
    // Button Settings
    buttonBackgroundColor: {
      type: String,
      default: '#10b981',
    },
    buttonTextColor: {
      type: String,
      default: '#ffffff',
    },
    buttonBorderColor: {
      type: String,
    },
    buttonHoverBackgroundColor: {
      type: String,
      default: '#059669',
    },
    buttonHoverTextColor: {
      type: String,
      default: '#ffffff',
    },
    buttonHoverBorderColor: {
      type: String,
    },
    buttonBorderRadius: {
      type: Number,
      default: 8,
    },
    buttonShadow: {
      type: String,
    },
    buttonHoverShadow: {
      type: String,
    },
    
    // Background
    bannerBackgroundColor: {
      type: String,
      default: '#f3f4f6',
    },
    contentBoxBackgroundColor: {
      type: String,
    },
    contentBoxOpacity: {
      type: Number,
      min: 0,
      max: 100,
    },
    
    // Typography
    fontFamily: {
      type: String,
    },
    headingFontSize: {
      type: Number,
    },
    subHeadingFontSize: {
      type: Number,
    },
    descriptionFontSize: {
      type: Number,
    },
    buttonFontSize: {
      type: Number,
    },
    fontWeight: {
      type: String,
    },
    letterSpacing: {
      type: Number,
    },
    lineHeight: {
      type: Number,
    },
    textShadow: {
      type: String,
    },
    textTransform: {
      type: String,
      enum: ['uppercase', 'lowercase', 'capitalize', 'none'],
      default: 'none',
    },
    
    // Content Box
    contentBoxWidth: {
      type: Number,
    },
    contentBoxPadding: {
      type: Number,
    },
    contentBoxBorderRadius: {
      type: Number,
    },
    contentBoxBlur: {
      type: Number,
    },
    contentBoxShadow: {
      type: String,
    },
    contentBoxMaxWidth: {
      type: Number,
    },
    
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
HeroBannerSchema.index({ isActive: 1, displayOrder: 1 });

const HeroBanner: Model<IHeroBanner> = mongoose.models.HeroBanner || mongoose.model<IHeroBanner>('HeroBanner', HeroBannerSchema);

export default HeroBanner;
