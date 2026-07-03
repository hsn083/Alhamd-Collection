import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHeroSliderSettings extends Document {
  // General
  enabled: boolean;
  autoPlay: boolean;
  autoPlayDelay: number;
  infiniteLoop: boolean;
  pauseOnHover: boolean;
  keyboardNavigation: boolean;
  touchSwipe: boolean;
  
  // Animation
  animationType: 'slide' | 'fade' | 'zoom' | 'flip' | 'cube' | 'coverflow';
  
  // Navigation
  showArrows: boolean;
  arrowColor: string;
  arrowBackground: string;
  showDots: boolean;
  dotColor: string;
  activeDotColor: string;
  
  // Responsive
  desktopHeight: number;
  tabletHeight: number;
  mobileHeight: number;
  
  // Typography
  headingSize: number;
  subheadingSize: number;
  descriptionSize: number;
  buttonSize: number;
  
  // Colors
  headingColor: string;
  subheadingColor: string;
  descriptionColor: string;
  buttonBackground: string;
  buttonTextColor: string;
  overlayColor: string;
  overlayOpacity: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const HeroSliderSettingsSchema = new Schema<IHeroSliderSettings>(
  {
    // General
    enabled: {
      type: Boolean,
      default: true,
    },
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
    infiniteLoop: {
      type: Boolean,
      default: true,
    },
    pauseOnHover: {
      type: Boolean,
      default: true,
    },
    keyboardNavigation: {
      type: Boolean,
      default: true,
    },
    touchSwipe: {
      type: Boolean,
      default: true,
    },
    
    // Animation
    animationType: {
      type: String,
      enum: ['slide', 'fade', 'zoom', 'flip', 'cube', 'coverflow'],
      default: 'slide',
    },
    
    // Navigation
    showArrows: {
      type: Boolean,
      default: true,
    },
    arrowColor: {
      type: String,
      default: '#ffffff',
    },
    arrowBackground: {
      type: String,
      default: 'rgba(0, 0, 0, 0.3)',
    },
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
    
    // Responsive
    desktopHeight: {
      type: Number,
      default: 750,
      min: 300,
      max: 1000,
    },
    tabletHeight: {
      type: Number,
      default: 650,
      min: 300,
      max: 800,
    },
    mobileHeight: {
      type: Number,
      default: 550,
      min: 200,
      max: 600,
    },
    
    // Typography
    headingSize: {
      type: Number,
      default: 60,
      min: 24,
      max: 120,
    },
    subheadingSize: {
      type: Number,
      default: 32,
      min: 16,
      max: 64,
    },
    descriptionSize: {
      type: Number,
      default: 24,
      min: 12,
      max: 48,
    },
    buttonSize: {
      type: Number,
      default: 18,
      min: 12,
      max: 32,
    },
    
    // Colors
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
    buttonBackground: {
      type: String,
      default: '#10b981',
    },
    buttonTextColor: {
      type: String,
      default: '#ffffff',
    },
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
  },
  {
    timestamps: true,
  }
);

// There should only be one settings document
HeroSliderSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const HeroSliderSettings: Model<IHeroSliderSettings> = mongoose.models.HeroSliderSettings || mongoose.model<IHeroSliderSettings>('HeroSliderSettings', HeroSliderSettingsSchema);

export default HeroSliderSettings;
