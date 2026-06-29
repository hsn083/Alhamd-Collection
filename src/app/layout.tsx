import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/Analytics";
import SettingsProvider from "@/components/SettingsProvider";
import { ToastContainer } from "@/components/ui/toast";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800"],
  variable: '--font-poppins'
});

async function getSettings() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/settings`, {
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
  
  const siteName = settings?.general?.siteName || 'AlhamdCollection';
  const metaTitle = settings?.seo?.metaTitle || 'AlhamdCollection | Premium Clothing & Shoes';
  const metaDescription = settings?.seo?.metaDescription || 'Shop premium clothing, shoes, and fashion accessories at AlhamdCollection. Style meets comfort.';
  const metaKeywords = settings?.seo?.metaKeywords || 'clothing, shoes, fashion, sneakers, apparel, men\'s fashion, women\'s fashion, footwear, AlhamdCollection';
  const ogImage = settings?.seo?.ogImage || '/images/og-image.jpg';
  const canonicalUrl = settings?.seo?.canonicalUrl || 'https://alhamdcollection.pk';

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    openGraph: {
      title: settings?.seo?.ogTitle || metaTitle,
      description: settings?.seo?.ogDescription || metaDescription,
      url: canonicalUrl,
      siteName: siteName,
      locale: "en_PK",
      type: "website",
      images: [
        {
          url: ogImage,
        }
      ]
    },
    twitter: {
      card: settings?.seo?.twitterCard || "summary_large_image",
      title: settings?.seo?.twitterTitle || metaTitle,
      description: settings?.seo?.twitterDescription || metaDescription,
      images: [settings?.seo?.twitterImage || ogImage],
    },
    robots: {
      index: settings?.seo?.robots === 'index, follow',
      follow: settings?.seo?.robots === 'index, follow',
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}

        <SpeedInsights />

      </body>
    </html>
  );
}
