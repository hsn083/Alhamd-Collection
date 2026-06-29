import path from 'path';
import { readFile, writeFile } from 'fs/promises';

const DATA_DIR = path.join(process.cwd() as string, 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

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

// Helper function to read settings from JSON file (server-only)
export async function readSettings(): Promise<AllSettings> {
  try {
    const data = await readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading settings:', error);
    // Return default settings if file doesn't exist
    return getDefaultSettings();
  }
}

// Helper function to write settings to JSON file (server-only)
export async function writeSettings(settings: AllSettings): Promise<void> {
  try {
    settings.updatedAt = new Date().toISOString();
    await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing settings:', error);
    throw error;
  }
}

// Get default settings
function getDefaultSettings(): AllSettings {
  return {
    general: {
      siteName: 'AlhamdCollection',
      siteTagline: 'Premium Clothing & Shoes Collection',
      siteLogo: '/Logo.jpeg',
      favicon: '/favicon.ico',
      contactEmail: 'info@alhamdcollection.pk',
      phoneNumber: '+92 300 1234567',
      whatsappNumber: '+92 300 1234567',
      companyAddress: 'Lahore, Pakistan',
      footerInfo: '© 2024 AlhamdCollection. All rights reserved.',
      currency: 'PKR',
      currencySymbol: '₨',
      timezone: 'Asia/Karachi',
      language: 'en',
      storeStatus: 'active',
      maintenanceMode: false,
      maintenanceMessage: 'We are currently performing maintenance. Please check back soon.',
    },
    seo: {
      metaTitle: 'AlhamdCollection | Premium Clothing & Shoes',
      metaDescription: 'Shop premium clothing, shoes, and fashion accessories at AlhamdCollection. Style meets comfort.',
      metaKeywords: 'clothing, shoes, fashion, sneakers, apparel, Pakistan',
      ogTitle: 'AlhamdCollection - Premium Fashion',
      ogDescription: 'Discover the latest fashion trends at AlhamdCollection',
      ogImage: '/images/og-image.jpg',
      twitterCard: 'summary_large_image',
      twitterTitle: 'AlhamdCollection',
      twitterDescription: 'Premium fashion collection',
      twitterImage: '/images/twitter-image.jpg',
      robots: 'index, follow',
      canonicalUrl: 'https://alhamdcollection.pk',
      structuredData: {
        organization: {
          name: 'AlhamdCollection',
          url: 'https://alhamdcollection.pk',
          logo: '/Logo.jpeg',
          contactPoint: {
            telephone: '+92 300 1234567',
            contactType: 'customer service'
          }
        }
      }
    },
    shipping: {
      freeShippingThreshold: 5000,
      standardShippingCost: 150,
      expressShippingCost: 300,
      deliveryTime: '3-5 business days',
      shippingStatus: 'active',
      shippingRules: 'Free shipping on orders above PKR 5000'
    },
    provinces: {
      'Punjab': { standard: 250, express: 500, codAvailable: true, status: 'active' },
      'Sindh': { standard: 300, express: 600, codAvailable: true, status: 'active' },
      'Khyber Pakhtunkhwa (KPK)': { standard: 350, express: 700, codAvailable: true, status: 'active' },
      'Balochistan': { standard: 450, express: 900, codAvailable: false, status: 'active' },
      'Islamabad Capital Territory (ICT)': { standard: 200, express: 400, codAvailable: true, status: 'active' },
      'Azad Jammu & Kashmir (AJK)': { standard: 400, express: 800, codAvailable: true, status: 'active' },
      'Gilgit Baltistan (GB)': { standard: 500, express: 1000, codAvailable: false, status: 'active' }
    },
    payments: {
      cashOnDelivery: {
        enabled: true,
        displayName: 'Cash on Delivery',
        instructions: 'Pay cash when your order arrives at your doorstep.',
        order: 1
      },
      bankTransfer: {
        enabled: true,
        displayName: 'Bank Transfer',
        instructions: 'Transfer payment to our bank account. Account details will be provided after order confirmation.',
        accountTitle: 'AlhamdCollection',
        accountNumber: '1234567890',
        bankName: 'HBL',
        iban: 'PK36HABB0000123456789012',
        order: 2
      },
      jazzcash: {
        enabled: true,
        displayName: 'JazzCash',
        instructions: 'Send payment to our JazzCash account.',
        accountNumber: '03001234567',
        accountName: 'AlhamdCollection',
        order: 3
      },
      easypaisa: {
        enabled: true,
        displayName: 'EasyPaisa',
        instructions: 'Send payment to our EasyPaisa account.',
        accountNumber: '03001234567',
        accountName: 'AlhamdCollection',
        order: 4
      },
      stripe: {
        enabled: false,
        displayName: 'Credit/Debit Card',
        instructions: 'Pay securely with your credit or debit card.',
        order: 5
      },
      paypal: {
        enabled: false,
        displayName: 'PayPal',
        instructions: 'Pay securely with PayPal.',
        order: 6
      }
    },
    socialMedia: {
      facebook: { enabled: true, url: 'https://facebook.com/alhamdcollection', handle: '@alhamdcollection' },
      instagram: { enabled: true, url: 'https://instagram.com/alhamdcollection', handle: '@alhamdcollection' },
      tiktok: { enabled: false, url: '', handle: '' },
      youtube: { enabled: true, url: 'https://youtube.com/@alhamdcollection', handle: '@alhamdcollection' },
      linkedin: { enabled: false, url: '', handle: '' },
      twitter: { enabled: true, url: 'https://twitter.com/alhamdcollection', handle: '@alhamdcollection' },
      whatsapp: { enabled: true, url: 'https://wa.me+923001234567', number: '+92 300 1234567', handle: '@alhamdcollection' }
    },
    updatedAt: new Date().toISOString()
  };
}

// Initialize settings file if it doesn't exist
export async function initializeSettings(): Promise<void> {
  try {
    await readFile(SETTINGS_FILE, 'utf-8');
  } catch (error) {
    console.log('[SETTINGS] Initializing default settings...');
    await writeSettings(getDefaultSettings());
  }
}
