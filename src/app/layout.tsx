import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/Analytics";
import SettingsProvider from "@/components/SettingsProvider";
import { ToastContainer } from "@/components/ui/toast";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { OrganizationSchema, WebsiteSchema, OnlineStoreSchema } from "@/components/StructuredData";

// Force dynamic rendering to avoid build-time fetch issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800"],
  variable: '--font-poppins'
});

async function getSettings() {
  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const response = await fetch(`${baseUrl}/api/settings`, {
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      return data.settings;
    }
  } catch (error) {
    console.error('Failed to fetch settings:', error);
  }
  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  
  const siteName = settings?.general?.siteName || 'ALHAMD COLLECTION';
  const metaTitle = settings?.seo?.metaTitle || 'ALHAMD COLLECTION | Premium Pakistani Clothing & Shoes Online Store';
  const metaDescription = settings?.seo?.metaDescription || 'Shop premium Pakistani clothing, shoes, and fashion accessories at ALHAMD COLLECTION. Discover the latest trends in men\'s and women\'s fashion with nationwide delivery across Pakistan. Quality meets affordability.';
  const metaKeywords = settings?.seo?.metaKeywords || 'Pakistani clothing, online clothing store Pakistan, men\'s fashion Pakistan, women\'s fashion Pakistan, shoes Pakistan, sneakers, apparel, formal wear, casual wear, traditional clothing, ALHAMD COLLECTION, fashion online Pakistan, clothing brand Pakistan';
  const ogImage = settings?.seo?.ogImage || '/Logo.jpeg';
  const canonicalUrl = settings?.seo?.canonicalUrl || 'https://alhamdcollection.pk';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alhamdcollection.pk';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: metaTitle,
      template: '%s | ALHAMD COLLECTION'
    },
    description: metaDescription,
    keywords: metaKeywords,
    authors: [{ name: 'ALHAMD COLLECTION' }],
    creator: 'ALHAMD COLLECTION',
    publisher: 'ALHAMD COLLECTION',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: settings?.seo?.ogTitle || metaTitle,
      description: settings?.seo?.ogDescription || metaDescription,
      url: canonicalUrl,
      siteName: siteName,
      locale: 'en_PK',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${siteName} - Premium Pakistani Clothing & Shoes`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: settings?.seo?.twitterTitle || metaTitle,
      description: settings?.seo?.twitterDescription || metaDescription,
      images: [settings?.seo?.twitterImage || ogImage],
      creator: '@alhamdcollection',
      site: '@alhamdcollection',
    },
    robots: {
      index: settings?.seo?.robots !== 'noindex',
      follow: settings?.seo?.robots !== 'nofollow',
      googleBot: {
        index: settings?.seo?.robots !== 'noindex',
        follow: settings?.seo?.robots !== 'nofollow',
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    },
    category: 'ecommerce',
    other: {
      'theme-color': '#0F766E',
      'msapplication-TileColor': '#0F766E',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': 'ALHAMD COLLECTION',
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body className={`${inter.variable} ${poppins.variable}`}>
        <OrganizationSchema />
        <WebsiteSchema />
        <OnlineStoreSchema />
        <SettingsProvider>
          {children}
        </SettingsProvider>

        <SpeedInsights />

      </body>
    </html>
  );
}
