import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IColorTheme extends Document {
  name: string;
  description?: string;
  
  // Text Colors
  headingColor: string;
  subHeadingColor: string;
  descriptionColor: string;
  buttonTextColor: string;
  
  // Button Colors
  buttonBackgroundColor: string;
  buttonHoverBackgroundColor: string;
  buttonHoverTextColor: string;
  buttonBorderColor: string;
  buttonHoverBorderColor: string;
  
  // Overlay
  overlayColor: string;
  overlayOpacity: number;
  
  // Background
  bannerBackgroundColor: string;
  contentBoxBackgroundColor?: string;
  contentBoxOpacity?: number;
  
  // Content
  badgeColor?: string;
  badgeTextColor?: string;
  dividerColor?: string;
  
  // Navigation
  sliderArrowBackgroundColor: string;
  sliderArrowIconColor: string;
  sliderArrowHoverBackgroundColor: string;
  sliderArrowHoverIconColor: string;
  navigationDotColor: string;
  activeNavigationDotColor: string;
  
  // Effects
  textShadowColor?: string;
  buttonShadowColor?: string;
  contentBoxShadowColor?: string;
  
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ColorThemeSchema = new Schema<IColorTheme>(
  {
    name: {
      type: String,
      required: [true, 'Theme name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
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
    buttonTextColor: {
      type: String,
      default: '#ffffff',
    },
    
    // Button Colors
    buttonBackgroundColor: {
      type: String,
      default: '#10b981',
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
      default: '#10b981',
    },
    buttonHoverBorderColor: {
      type: String,
      default: '#059669',
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
    
    // Content
    badgeColor: {
      type: String,
    },
    badgeTextColor: {
      type: String,
    },
    dividerColor: {
      type: String,
    },
    
    // Navigation
    sliderArrowBackgroundColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.2)',
    },
    sliderArrowIconColor: {
      type: String,
      default: '#ffffff',
    },
    sliderArrowHoverBackgroundColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.4)',
    },
    sliderArrowHoverIconColor: {
      type: String,
      default: '#ffffff',
    },
    navigationDotColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.5)',
    },
    activeNavigationDotColor: {
      type: String,
      default: '#ffffff',
    },
    
    // Effects
    textShadowColor: {
      type: String,
    },
    buttonShadowColor: {
      type: String,
    },
    contentBoxShadowColor: {
      type: String,
    },
    
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ColorThemeSchema.index({ name: 1 }, { unique: true });
ColorThemeSchema.index({ isDefault: 1 });

interface ColorThemeModel extends Model<IColorTheme> {
  getDefaultTheme(): Promise<IColorTheme | null>;
  setDefaultTheme(themeId: string): Promise<IColorTheme | null>;
}

// Static method to get default theme
ColorThemeSchema.statics.getDefaultTheme = async function() {
  return await this.findOne({ isDefault: true });
};

// Static method to set default theme
ColorThemeSchema.statics.setDefaultTheme = async function(themeId: string) {
  await this.updateMany({}, { isDefault: false });
  return await this.findByIdAndUpdate(themeId, { isDefault: true });
};

const ColorTheme: ColorThemeModel = (mongoose.models.ColorTheme as ColorThemeModel) || mongoose.model<IColorTheme, ColorThemeModel>('ColorTheme', ColorThemeSchema);

export default ColorTheme;
