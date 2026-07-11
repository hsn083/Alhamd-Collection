import { Metadata } from 'next';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonical?: string;
  noIndex?: boolean;
  jsonLd?: any;
}

export function generateMetadata({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  canonical,
  noIndex = false,
  jsonLd,
}: SEOProps): Metadata {
  const siteName = 'Alhamd Collection';
  const defaultTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = description || 'Discover the latest fashion and lifestyle products at Alhamd Collection. Quality products at affordable prices with fast delivery across Pakistan.';
  const defaultImage = ogImage || '/og-image.jpg';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alhamdcollection.com';

  const metadata: Metadata = {
    title: defaultTitle,
    description: defaultDescription,
    keywords: keywords?.join(', '),
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: ogType,
      locale: 'en_US',
      url: canonical,
      title: defaultTitle,
      description: defaultDescription,
      siteName,
      images: [
        {
          url: defaultImage,
          width: 1200,
          height: 630,
          alt: title || siteName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description: defaultDescription,
      images: [defaultImage],
      creator: '@alhamdcollection',
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    },
  };

  if (canonical) {
    metadata.alternates = {
      canonical: canonical,
    };
  }

  if (jsonLd) {
    metadata.other = {
      'application/ld+json': JSON.stringify(jsonLd),
    };
  }

  return metadata;
}

export function generateProductJsonLd(product: any) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product._id,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`,
      priceCurrency: 'PKR',
      price: product.discountPrice || product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    } : undefined,
  };
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Alhamd Collection',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
    description: 'Your one-stop shop for fashion and lifestyle products in Pakistan',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+923457791198',
      contactType: 'customer service',
      email: 'alhamdcollection518@gmail.com',
    },
    sameAs: [
      'https://www.facebook.com/alhamdcollection',
      'https://www.instagram.com/alhamdcollection',
      'https://www.twitter.com/alhamdcollection',
    ],
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    name: 'Alhamd Collection',
    description: 'Discover the latest fashion and lifestyle products at Alhamd Collection',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}
