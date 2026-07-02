import type { Metadata } from "next";
import Header from '@/components/Header';
import HeroSlider from '@/components/HeroSlider';
import Categories from '@/components/Categories';
import FeaturedProducts from '@/components/FeaturedProducts';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';
import { BreadcrumbSchema } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Home - Premium Pakistani Clothing & Shoes',
  description:
    "Welcome to ALHAMD COLLECTION - Your premier destination for premium Pakistani clothing, shoes, and fashion accessories.",
  keywords:
    "Pakistani clothing store, online fashion Pakistan, men's clothing, women's clothing",
  openGraph: {
    title: 'ALHAMD COLLECTION - Premium Pakistani Clothing & Shoes',
    description:
      'Discover the latest fashion trends at ALHAMD COLLECTION.',
    url: '/',
  },
};

export default function Home() {
  const breadcrumbItems = [{ name: 'Home', item: '/' }];

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <BreadcrumbSchema items={breadcrumbItems} />

          <Header />
      <main>
         <HeroSlider />
        <Categories />
        <FeaturedProducts />
        
      </main>
      <Footer />
    </div>
  );
}