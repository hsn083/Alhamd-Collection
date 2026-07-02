import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHeroBannerSettings extends Document {
  // Auto Play
  autoPlay: boolean;
  autoPlayDelay: number;
  
  // Animation
  transitionSpeed: number;
  animationDuration: number;
  animationType: 'slide' | 'fade' | 'zoom' | 'flip' | 'cube' | 'coverflow';
  
  // Loop & Pause
  infiniteLoop: boolean;
  pauseOnHover: boolean;
  pauseOnTabHidden: boolean;
  
  // Navigation
  touchSwipe: boolean;
  keyboardNavigation: boolean;
  mouseWheelNavigation: boolean;
  
  // Arrows
  showArrows: boolean;
  arrowBackgroundColor: string;
  arrowIconColor: string;
  arrowHoverBackgroundColor: string;
  arrowHoverIconColor: string;
  
  // Dots
  showDots: boolean;
  dotColor: string;
  activeDotColor: string;
  dotSize: number;
  
  // Progress
  showProgressBar: boolean;
  progressColor: string;
  
  // Responsive - Desktop
  desktopHeight: number;
  desktopHeadingFontSize: number;
  desktopDescriptionFontSize: number;
  desktopContentPosition: 'left' | 'center' | 'right';
  
  // Responsive - Tablet
  tabletHeight: number;
  tabletHeadingFontSize: number;
  tabletDescriptionFontSize: number;
  tabletContentPosition: 'left' | 'center' | 'right';
  
  // Responsive - Mobile
  mobileHeight: number;
  mobileHeadingFontSize: number;
  mobileDescriptionFontSize: number;
  mobileContentPosition: 'left' | 'center' | 'right';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const HeroBannerSettingsSchema = new Schema<IHeroBannerSettings>(
  {
    // Auto Play
    autoPlay: {
      type: Boolean,
      default: true,
    },
    autoPlayDelay: {
      type: Number,
      default: 5000,
      min: 1000,
      max: 30000,
    },
    
    // Animation
    transitionSpeed: {
      type: Number,
      default: 500,
      min: 100,
      max: 2000,
    },
    animationDuration: {
      type: Number,
      default: 500,
      min: 100,
      max: 2000,
    },
    animationType: {
      type: String,
      enum: ['slide', 'fade', 'zoom', 'flip', 'cube', 'coverflow'],
      default: 'slide',
    },
    
    // Loop & Pause
    infiniteLoop: {
      type: Boolean,
      default: true,
    },
    pauseOnHover: {
      type: Boolean,
      default: true,
    },
    pauseOnTabHidden: {
      type: Boolean,
      default: false,
    },
    
    // Navigation
    touchSwipe: {
      type: Boolean,
      default: true,
    },
    keyboardNavigation: {
      type: Boolean,
      default: true,
    },
    mouseWheelNavigation: {
      type: Boolean,
      default: false,
    },
    
    // Arrows
    showArrows: {
      type: Boolean,
      default: true,
    },
    arrowBackgroundColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.2)',
    },
    arrowIconColor: {
      type: String,
      default: '#ffffff',
    },
    arrowHoverBackgroundColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.4)',
    },
    arrowHoverIconColor: {
      type: String,
      default: '#ffffff',
    },
    
    // Dots
    showDots: {
      type: Boolean,
      default: true,
    },
    dotColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.5)',
    },
    activeDotColor: {
      type: String,
      default: '#ffffff',
    },
    dotSize: {
      type: Number,
      default: 12,
      min: 8,
      max: 24,
    },
    
    // Progress
    showProgressBar: {
      type: Boolean,
      default: false,
    },
    progressColor: {
      type: String,
      default: '#10b981',
    },
    
    // Responsive - Desktop
    desktopHeight: {
      type: Number,
      default: 750,
      min: 300,
      max: 1000,
    },
    desktopHeadingFontSize: {
      type: Number,
      default: 60,
      min: 24,
      max: 120,
    },
    desktopDescriptionFontSize: {
      type: Number,
      default: 24,
      min: 12,
      max: 48,
    },
    desktopContentPosition: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'left',
    },
    
    // Responsive - Tablet
    tabletHeight: {
      type: Number,
      default: 650,
      min: 300,
      max: 800,
    },
    tabletHeadingFontSize: {
      type: Number,
      default: 48,
      min: 20,
      max: 96,
    },
    tabletDescriptionFontSize: {
      type: Number,
      default: 20,
      min: 10,
      max: 40,
    },
    tabletContentPosition: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'left',
    },
    
    // Responsive - Mobile
    mobileHeight: {
      type: Number,
      default: 550,
      min: 200,
      max: 600,
    },
    mobileHeadingFontSize: {
      type: Number,
      default: 36,
      min: 16,
      max: 72,
    },
    mobileDescriptionFontSize: {
      type: Number,
      default: 16,
      min: 10,
      max: 32,
    },
    mobileContentPosition: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'left',
    },
  },
  {
    timestamps: true,
  }
);

// There should only be one settings document
HeroBannerSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const HeroBannerSettings: Model<IHeroBannerSettings> = mongoose.models.HeroBannerSettings || mongoose.model<IHeroBannerSettings>('HeroBannerSettings', HeroBannerSettingsSchema);

export default HeroBannerSettings;
