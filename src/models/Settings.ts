import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  general: {
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
  };
  seo: {
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
  };
  shipping: {
    freeShippingThreshold: number;
    standardShippingCost: number;
    expressShippingCost: number;
    deliveryTime: string;
    shippingStatus: 'active' | 'inactive';
    shippingRules: string;
  };
  provinces: {
    [province: string]: {
      standard: number;
      express: number;
      codAvailable: boolean;
      status: 'active' | 'inactive';
    };
  };
  payments: {
    cashOnDelivery: {
      enabled: boolean;
      displayName: string;
      instructions: string;
      accountTitle?: string;
      accountNumber?: string;
      bankName?: string;
      iban?: string;
      accountName?: string;
      order: number;
    };
    bankTransfer: {
      enabled: boolean;
      displayName: string;
      instructions: string;
      accountTitle?: string;
      accountNumber?: string;
      bankName?: string;
      iban?: string;
      accountName?: string;
      order: number;
    };
    jazzcash: {
      enabled: boolean;
      displayName: string;
      instructions: string;
      accountNumber?: string;
      accountName?: string;
      order: number;
    };
    easypaisa: {
      enabled: boolean;
      displayName: string;
      instructions: string;
      accountNumber?: string;
      accountName?: string;
      order: number;
    };
    stripe: {
      enabled: boolean;
      displayName: string;
      instructions: string;
      publicKey?: string;
      secretKey?: string;
      order: number;
    };
    paypal: {
      enabled: boolean;
      displayName: string;
      instructions: string;
      clientId?: string;
      clientSecret?: string;
      order: number;
    };
  };
  socialMedia: {
    facebook: { enabled: boolean; url: string; handle: string; };
    instagram: { enabled: boolean; url: string; handle: string; };
    tiktok: { enabled: boolean; url: string; handle: string; };
    youtube: { enabled: boolean; url: string; handle: string; };
    linkedin: { enabled: boolean; url: string; handle: string; };
    twitter: { enabled: boolean; url: string; handle: string; };
    whatsapp: { enabled: boolean; url: string; handle: string; number?: string; };
  };
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    general: {
      siteName: { type: String, default: 'AlhamdCollection' },
      siteTagline: { type: String, default: 'Premium Clothing & Shoes Collection' },
      siteLogo: { type: String, default: '/Logo.jpeg' },
      favicon: { type: String, default: '/favicon.ico' },
      contactEmail: { type: String, default: 'info@alhamdcollection.pk' },
      phoneNumber: { type: String, default: '+92 300 1234567' },
      whatsappNumber: { type: String, default: '+92 300 1234567' },
      companyAddress: { type: String, default: 'Lahore, Pakistan' },
      footerInfo: { type: String, default: '© 2024 AlhamdCollection. All rights reserved.' },
      currency: { type: String, default: 'PKR' },
      currencySymbol: { type: String, default: '₨' },
      timezone: { type: String, default: 'Asia/Karachi' },
      language: { type: String, default: 'en' },
      storeStatus: { type: String, enum: ['active', 'inactive'], default: 'active' },
      maintenanceMode: { type: Boolean, default: false },
      maintenanceMessage: { type: String, default: 'We are currently performing maintenance. Please check back soon.' },
    },
    seo: {
      metaTitle: { type: String, default: 'AlhamdCollection | Premium Clothing & Shoes' },
      metaDescription: { type: String, default: 'Shop premium clothing, shoes, and fashion accessories at AlhamdCollection. Style meets comfort.' },
      metaKeywords: { type: String, default: 'clothing, shoes, fashion, sneakers, apparel, Pakistan' },
      ogTitle: { type: String, default: 'AlhamdCollection - Premium Fashion' },
      ogDescription: { type: String, default: 'Discover the latest fashion trends at AlhamdCollection' },
      ogImage: { type: String, default: '/images/og-image.jpg' },
      twitterCard: { type: String, default: 'summary_large_image' },
      twitterTitle: { type: String, default: 'AlhamdCollection' },
      twitterDescription: { type: String, default: 'Premium fashion collection' },
      twitterImage: { type: String, default: '/images/twitter-image.jpg' },
      robots: { type: String, default: 'index, follow' },
      canonicalUrl: { type: String, default: 'https://alhamdcollection.pk' },
      structuredData: {
        organization: {
          name: { type: String, default: 'AlhamdCollection' },
          url: { type: String, default: 'https://alhamdcollection.pk' },
          logo: { type: String, default: '/Logo.jpeg' },
          contactPoint: {
            telephone: { type: String, default: '+92 300 1234567' },
            contactType: { type: String, default: 'customer service' },
          },
        },
      },
    },
    shipping: {
      freeShippingThreshold: { type: Number, default: 5000 },
      standardShippingCost: { type: Number, default: 150 },
      expressShippingCost: { type: Number, default: 300 },
      deliveryTime: { type: String, default: '3-5 business days' },
      shippingStatus: { type: String, enum: ['active', 'inactive'], default: 'active' },
      shippingRules: { type: String, default: 'Free shipping on orders above PKR 5000' },
    },
    provinces: {
      type: Map,
      of: {
        standard: { type: Number, default: 250 },
        express: { type: Number, default: 500 },
        codAvailable: { type: Boolean, default: true },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
      },
      default: {
        'Punjab': { standard: 250, express: 500, codAvailable: true, status: 'active' },
        'Sindh': { standard: 300, express: 600, codAvailable: true, status: 'active' },
        'Khyber Pakhtunkhwa (KPK)': { standard: 350, express: 700, codAvailable: true, status: 'active' },
        'Balochistan': { standard: 450, express: 900, codAvailable: false, status: 'active' },
        'Islamabad Capital Territory (ICT)': { standard: 200, express: 400, codAvailable: true, status: 'active' },
        'Azad Jammu & Kashmir (AJK)': { standard: 400, express: 800, codAvailable: true, status: 'active' },
        'Gilgit Baltistan (GB)': { standard: 500, express: 1000, codAvailable: false, status: 'active' },
      },
    },
    payments: {
      cashOnDelivery: {
        enabled: { type: Boolean, default: true },
        displayName: { type: String, default: 'Cash on Delivery' },
        instructions: { type: String, default: 'Pay cash when your order arrives at your doorstep.' },
        order: { type: Number, default: 1 },
      },
      bankTransfer: {
        enabled: { type: Boolean, default: true },
        displayName: { type: String, default: 'Bank Transfer' },
        instructions: { type: String, default: 'Transfer payment to our bank account. Account details will be provided after order confirmation.' },
        accountTitle: { type: String, default: 'AlhamdCollection' },
        accountNumber: { type: String, default: '1234567890' },
        bankName: { type: String, default: 'HBL' },
        iban: { type: String, default: 'PK36HABB0000123456789012' },
        order: { type: Number, default: 2 },
      },
      jazzcash: {
        enabled: { type: Boolean, default: true },
        displayName: { type: String, default: 'JazzCash' },
        instructions: { type: String, default: 'Send payment to our JazzCash account.' },
        accountNumber: { type: String, default: '03001234567' },
        accountName: { type: String, default: 'AlhamdCollection' },
        order: { type: Number, default: 3 },
      },
      easypaisa: {
        enabled: { type: Boolean, default: true },
        displayName: { type: String, default: 'EasyPaisa' },
        instructions: { type: String, default: 'Send payment to our EasyPaisa account.' },
        accountNumber: { type: String, default: '03001234567' },
        accountName: { type: String, default: 'AlhamdCollection' },
        order: { type: Number, default: 4 },
      },
      stripe: {
        enabled: { type: Boolean, default: false },
        displayName: { type: String, default: 'Credit/Debit Card' },
        instructions: { type: String, default: 'Pay securely with your credit or debit card.' },
        order: { type: Number, default: 5 },
      },
      paypal: {
        enabled: { type: Boolean, default: false },
        displayName: { type: String, default: 'PayPal' },
        instructions: { type: String, default: 'Pay securely with PayPal.' },
        order: { type: Number, default: 6 },
      },
    },
    socialMedia: {
      facebook: { enabled: { type: Boolean, default: true }, url: { type: String, default: 'https://facebook.com/alhamdcollection' }, handle: { type: String, default: '@alhamdcollection' } },
      instagram: { enabled: { type: Boolean, default: true }, url: { type: String, default: 'https://instagram.com/alhamdcollection' }, handle: { type: String, default: '@alhamdcollection' } },
      tiktok: { enabled: { type: Boolean, default: false }, url: { type: String, default: '' }, handle: { type: String, default: '' } },
      youtube: { enabled: { type: Boolean, default: true }, url: { type: String, default: 'https://youtube.com/@alhamdcollection' }, handle: { type: String, default: '@alhamdcollection' } },
      linkedin: { enabled: { type: Boolean, default: false }, url: { type: String, default: '' }, handle: { type: String, default: '' } },
      twitter: { enabled: { type: Boolean, default: true }, url: { type: String, default: 'https://twitter.com/alhamdcollection' }, handle: { type: String, default: '@alhamdcollection' } },
      whatsapp: { enabled: { type: Boolean, default: true }, url: { type: String, default: 'https://wa.me+923001234567' }, handle: { type: String, default: '@alhamdcollection' }, number: { type: String, default: '+92 300 1234567' } },
    },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
