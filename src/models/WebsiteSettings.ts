import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWebsiteSettings extends Document {
  siteName: string;
  siteDescription?: string;
  logo?: string;
  favicon?: string;
  contactEmail: string;
  contactPhone?: string;
  contactAddress?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  currency: string;
  taxRate: number;
  enableRegistration: boolean;
  enableGuestCheckout: boolean;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  seoSettings?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WebsiteSettingsSchema = new Schema<IWebsiteSettings>(
  {
    siteName: {
      type: String,
      required: [true, 'Site name is required'],
      trim: true,
    },
    siteDescription: {
      type: String,
      trim: true,
    },
    logo: String,
    favicon: String,
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    contactAddress: {
      type: String,
      trim: true,
    },
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
      youtube: String,
    },
    currency: {
      type: String,
      default: 'PKR',
    },
    taxRate: {
      type: Number,
      default: 0,
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100'],
    },
    enableRegistration: {
      type: Boolean,
      default: true,
    },
    enableGuestCheckout: {
      type: Boolean,
      default: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: String,
    seoSettings: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: String,
    },
  },
  {
    timestamps: true,
  }
);

const WebsiteSettings: Model<IWebsiteSettings> = mongoose.models.WebsiteSettings || mongoose.model<IWebsiteSettings>('WebsiteSettings', WebsiteSettingsSchema);

export default WebsiteSettings;
