import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHeroBannerSettings extends Document {
  // General
  enabled: boolean;
  
  // Auto Play
  autoPlay: boolean;
  autoPlayDelay: number;
  
  // Animation
  transitionSpeed: number;
  animationDuration: number;
  animationType: 'slide' | 'fade' | 'zoom' | 'flip' | 'cube' | 'coverflow';
  animationEasing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  
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
  arrowSize: number;
  arrowBorderRadius: number;
  arrowBackgroundColor: string;
  arrowIconColor: string;
  arrowHoverBackgroundColor: string;
  arrowHoverIconColor: string;
  
  // Dots
  showDots: boolean;
  dotSize: number;
  dotColor: string;
  activeDotColor: string;
  dotSpacing: number;
  
  // Progress
  showProgressBar: boolean;
  progressColor: string;
  progressHeight: number;
  
  // Responsive - Desktop
  desktopHeight: number;
  desktopHeadingFontSize: number;
  desktopSubheadingFontSize: number;
  desktopDescriptionFontSize: number;
  desktopButtonFontSize: number;
  desktopContentPosition: 'left' | 'center' | 'right';
  desktopVerticalPosition: 'top' | 'center' | 'bottom';
  
  // Responsive - Tablet
  tabletHeight: number;
  tabletHeadingFontSize: number;
  tabletSubheadingFontSize: number;
  tabletDescriptionFontSize: number;
  tabletButtonFontSize: number;
  tabletContentPosition: 'left' | 'center' | 'right';
  tabletVerticalPosition: 'top' | 'center' | 'bottom';
  
  // Responsive - Mobile
  mobileHeight: number;
  mobileHeadingFontSize: number;
  mobileSubheadingFontSize: number;
  mobileDescriptionFontSize: number;
  mobileButtonFontSize: number;
  mobileContentPosition: 'left' | 'center' | 'right';
  mobileVerticalPosition: 'top' | 'center' | 'bottom';
  
  // Performance
  lazyLoadImages: boolean;
  imageQuality: number;
  preloadFirstSlide: boolean;
  enableImageOptimization: boolean;
  
  // Overlay Settings
  overlayColor: string;
  overlayOpacity: number;
  
  // Text Colors
  headingColor: string;
  subheadingColor: string;
  descriptionColor: string;
  
  // Primary Button Colors
  buttonBackgroundColor: string;
  buttonTextColor: string;
  buttonHoverBackgroundColor: string;
  buttonHoverTextColor: string;
  buttonBorderColor: string;
  buttonBorderRadius: number;
  
  // Secondary Button Colors
  secondaryButtonBackgroundColor: string;
  secondaryButtonTextColor: string;
  secondaryButtonHoverBackgroundColor: string;
  secondaryButtonHoverTextColor: string;
  secondaryButtonBorderColor: string;
  secondaryButtonBorderRadius: number;
  
  // Slider Background
  sliderBackgroundColor: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const HeroBannerSettingsSchema = new Schema<IHeroBannerSettings>(
  {
    // General
    enabled: {
      type: Boolean,
      default: true,
    },
    
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
    animationEasing: {
      type: String,
      enum: ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'],
      default: 'ease-in-out',
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
    arrowSize: {
      type: Number,
      default: 40,
      min: 20,
      max: 80,
    },
    arrowBorderRadius: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
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
    dotSize: {
      type: Number,
      default: 12,
      min: 8,
      max: 24,
    },
    dotColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.5)',
    },
    activeDotColor: {
      type: String,
      default: '#ffffff',
    },
    dotSpacing: {
      type: Number,
      default: 8,
      min: 4,
      max: 20,
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
    progressHeight: {
      type: Number,
      default: 4,
      min: 2,
      max: 10,
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
    desktopSubheadingFontSize: {
      type: Number,
      default: 32,
      min: 16,
      max: 64,
    },
    desktopDescriptionFontSize: {
      type: Number,
      default: 24,
      min: 12,
      max: 48,
    },
    desktopButtonFontSize: {
      type: Number,
      default: 18,
      min: 12,
      max: 32,
    },
    desktopContentPosition: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'left',
    },
    desktopVerticalPosition: {
      type: String,
      enum: ['top', 'center', 'bottom'],
      default: 'center',
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
    tabletSubheadingFontSize: {
      type: Number,
      default: 26,
      min: 14,
      max: 52,
    },
    tabletDescriptionFontSize: {
      type: Number,
      default: 20,
      min: 10,
      max: 40,
    },
    tabletButtonFontSize: {
      type: Number,
      default: 16,
      min: 12,
      max: 28,
    },
    tabletContentPosition: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'left',
    },
    tabletVerticalPosition: {
      type: String,
      enum: ['top', 'center', 'bottom'],
      default: 'center',
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
    mobileSubheadingFontSize: {
      type: Number,
      default: 20,
      min: 12,
      max: 40,
    },
    mobileDescriptionFontSize: {
      type: Number,
      default: 16,
      min: 10,
      max: 32,
    },
    mobileButtonFontSize: {
      type: Number,
      default: 14,
      min: 10,
      max: 24,
    },
    mobileContentPosition: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'left',
    },
    mobileVerticalPosition: {
      type: String,
      enum: ['top', 'center', 'bottom'],
      default: 'center',
    },
    
    // Performance
    lazyLoadImages: {
      type: Boolean,
      default: true,
    },
    imageQuality: {
      type: Number,
      default: 85,
      min: 1,
      max: 100,
    },
    preloadFirstSlide: {
      type: Boolean,
      default: true,
    },
    enableImageOptimization: {
      type: Boolean,
      default: true,
    },
    
    // Overlay Settings
    overlayColor: {
      type: String,
      default: '#000000',
    },
    overlayOpacity: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    
    // Text Colors
    headingColor: {
      type: String,
      default: '#ffffff',
    },
    subheadingColor: {
      type: String,
      default: '#ffffff',
    },
    descriptionColor: {
      type: String,
      default: '#ffffff',
    },
    
    // Primary Button Colors
    buttonBackgroundColor: {
      type: String,
      default: '#10b981',
    },
    buttonTextColor: {
      type: String,
      default: '#ffffff',
    },
    buttonHoverBackgroundColor: {
      type: String,
      default: '#059669',
    },
    buttonHoverTextColor: {
      type: String,
      default: '#ffffff',
    },
    buttonBorderColor: {
      type: String,
      default: 'transparent',
    },
    buttonBorderRadius: {
      type: Number,
      default: 8,
      min: 0,
      max: 50,
    },
    
    // Secondary Button Colors
    secondaryButtonBackgroundColor: {
      type: String,
      default: '#ffffff',
    },
    secondaryButtonTextColor: {
      type: String,
      default: '#000000',
    },
    secondaryButtonHoverBackgroundColor: {
      type: String,
      default: '#f3f4f6',
    },
    secondaryButtonHoverTextColor: {
      type: String,
      default: '#000000',
    },
    secondaryButtonBorderColor: {
      type: String,
      default: '#e5e7eb',
    },
    secondaryButtonBorderRadius: {
      type: Number,
      default: 8,
      min: 0,
      max: 50,
    },
    
    // Slider Background
    sliderBackgroundColor: {
      type: String,
      default: '#f3f4f6',
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
