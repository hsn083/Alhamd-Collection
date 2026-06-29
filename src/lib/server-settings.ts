import connectDB from '@/lib/db';
import Settings from '@/models/Settings';

export interface GeneralSettings {
  siteName: string;
  siteTagline: string;
  siteLogo: string;
  favicon: string;
  contactEmail: string;
  phoneNumber: string;
  whatsappNumber: string;
  companyAddress: string;
  footerInfo: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  language: string;
  storeStatus: 'active' | 'inactive';
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  robots: string;
  canonicalUrl: string;
  structuredData: {
    organization: {
      name: string;
      url: string;
      logo: string;
      contactPoint: {
        telephone: string;
        contactType: string;
      };
    };
  };
}

export interface ShippingSettings {
  freeShippingThreshold: number;
  standardShippingCost: number;
  expressShippingCost: number;
  deliveryTime: string;
  shippingStatus: 'active' | 'inactive';
  shippingRules: string;
}

export interface ProvinceSettings {
  [province: string]: {
    standard: number;
    express: number;
    codAvailable: boolean;
    status: 'active' | 'inactive';
  };
}

export interface PaymentMethod {
  enabled: boolean;
  displayName: string;
  instructions: string;
  accountTitle?: string;
  accountNumber?: string;
  bankName?: string;
  iban?: string;
  accountName?: string;
  publicKey?: string;
  secretKey?: string;
  clientId?: string;
  clientSecret?: string;
  order: number;
}

export interface PaymentSettings {
  cashOnDelivery: PaymentMethod;
  bankTransfer: PaymentMethod;
  jazzcash: PaymentMethod;
  easypaisa: PaymentMethod;
  stripe: PaymentMethod;
  paypal: PaymentMethod;
}

export interface SocialMediaPlatform {
  enabled: boolean;
  url: string;
  handle: string;
  number?: string;
}

export interface SocialMediaSettings {
  facebook: SocialMediaPlatform;
  instagram: SocialMediaPlatform;
  tiktok: SocialMediaPlatform;
  youtube: SocialMediaPlatform;
  linkedin: SocialMediaPlatform;
  twitter: SocialMediaPlatform;
  whatsapp: SocialMediaPlatform;
}

export interface AllSettings {
  general: GeneralSettings;
  seo: SEOSettings;
  shipping: ShippingSettings;
  provinces: ProvinceSettings;
  payments: PaymentSettings;
  socialMedia: SocialMediaSettings;
  updatedAt: string;
}

// Helper function to read settings from MongoDB (server-only)
export async function readSettings(): Promise<AllSettings> {
  try {
    await connectDB();
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({});
    }
    
    const settingsObj = settings.toObject();
    
    // Convert Map to object for provinces
    const provinces: ProvinceSettings = {};
    if (settingsObj.provinces instanceof Map) {
      settingsObj.provinces.forEach((value: any, key: string) => {
        provinces[key] = value;
      });
    } else {
      Object.assign(provinces, settingsObj.provinces);
    }
    
    return {
      ...settingsObj,
      provinces,
      updatedAt: settingsObj.updatedAt ? settingsObj.updatedAt.toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error reading settings:', error);
    throw error;
  }
}

// Helper function to write settings to MongoDB (server-only)
export async function writeSettings(settings: AllSettings): Promise<void> {
  try {
    await connectDB();
    
    const updateData = {
      ...settings,
      provinces: settings.provinces,
      updatedAt: new Date(),
    };
    
    await Settings.findOneAndUpdate({}, updateData, { upsert: true, new: true });
  } catch (error) {
    console.error('Error writing settings:', error);
    throw error;
  }
}

// Initialize settings in MongoDB if they don't exist
export async function initializeSettings(): Promise<void> {
  try {
    await connectDB();
    
    const existingSettings = await Settings.findOne();
    
    if (!existingSettings) {
      console.log('[SETTINGS] Initializing default settings in MongoDB...');
      await Settings.create({});
    }
  } catch (error) {
    console.error('Error initializing settings:', error);
    throw error;
  }
}
