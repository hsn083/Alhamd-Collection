'use client';

import { useEffect } from 'react';

interface StructuredDataProps {
  data: Record<string, any>;
}

export default function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    // Add JSON-LD to head
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    script.id = `structured-data-${data['@type']}`;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById(`structured-data-${data['@type']}`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [data]);

  return null;
}

// Organization Schema
export function OrganizationSchema() {
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ALHAMD COLLECTION',
    alternateName: 'AlhamdCollection',
    url: 'https://alhamdcollection.pk',
    logo: 'https://alhamdcollection.pk/Logo.jpeg',
    description: 'Premium Pakistani clothing and shoes online store offering the latest fashion trends for men and women with nationwide delivery.',
    foundingDate: '2024',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PK',
      addressRegion: 'Pakistan',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+92-XXX-XXXXXXX',
      contactType: 'customer service',
      availableLanguage: 'English',
      areaServed: 'PK',
    },
    sameAs: [
      'https://www.facebook.com/alhamdcollection',
      'https://www.instagram.com/alhamdcollection',
      'https://www.tiktok.com/@alhamdcollection',
    ],
  };

  return <StructuredData data={organizationData} />;
}

// Website Schema
export function WebsiteSchema() {
  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ALHAMD COLLECTION',
    alternateName: 'AlhamdCollection',
    url: 'https://alhamdcollection.pk',
    description: 'Premium Pakistani clothing and shoes online store',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://alhamdcollection.pk/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ALHAMD COLLECTION',
      url: 'https://alhamdcollection.pk',
    },
  };

  return <StructuredData data={websiteData} />;
}

// Online Store Schema
export function OnlineStoreSchema() {
  const storeData = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'ALHAMD COLLECTION',
    image: 'https://alhamdcollection.pk/Logo.jpeg',
    description: 'Premium Pakistani clothing and shoes online store offering the latest fashion trends for men and women.',
    url: 'https://alhamdcollection.pk',
    telephone: '+92-XXX-XXXXXXX',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PK',
      addressRegion: 'Pakistan',
    },
    priceRange: 'PKR',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '00:00',
      closes: '23:59',
    },
    acceptsReservations: false,
  };

  return <StructuredData data={storeData} />;
}

// Breadcrumb Schema
export function BreadcrumbSchema({ items }: { items: Array<{ name: string; item: string }> }) {
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://alhamdcollection.pk${item.item}`,
    })),
  };

  return <StructuredData data={breadcrumbData} />;
}

// Product Schema (for individual products)
export function ProductSchema({
  name,
  description,
  image,
  price,
  currency = 'PKR',
  availability = 'InStock',
  brand = 'ALHAMD COLLECTION',
}: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  availability?: string;
  brand?: string;
}) {
  const productData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      url: `https://alhamdcollection.pk/product/${name.toLowerCase().replace(/\s+/g, '-')}`,
      seller: {
        '@type': 'Organization',
        name: 'ALHAMD COLLECTION',
      },
    },
  };

  return <StructuredData data={productData} />;
}
