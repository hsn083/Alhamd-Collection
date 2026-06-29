// Client-only type definitions for settings
// All actual settings operations should go through the API

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
  branchName?: string;
  receiverName?: string;
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
