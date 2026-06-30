import type { Metadata } from "next";
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Categories from '@/components/Categories';
import FeaturedProducts from '@/components/FeaturedProducts';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';
import { BreadcrumbSchema } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Home - Premium Pakistani Clothing & Shoes',
  description: 'Welcome to ALHAMD COLLECTION - Your premier destination for premium Pakistani clothing, shoes, and fashion accessories. Shop the latest trends in men\'s and women\'s fashion with nationwide delivery.',
  keywords: 'Pakistani clothing store, online fashion Pakistan, men\'s clothing, women\'s clothing, shoes Pakistan, fashion accessories, ALHAMD COLLECTION home',
  openGraph: {
    title: 'ALHAMD COLLECTION - Premium Pakistani Clothing & Shoes',
    description: 'Discover the latest fashion trends at ALHAMD COLLECTION. Shop premium clothing, shoes, and accessories with nationwide delivery across Pakistan.',
    url: '/',
  },
};

export default function Home() {
  const breadcrumbItems = [
    { name: 'Home', item: '/' },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <Header />
      <main>
        <Hero />
        <Features />
        <Categories />
        <FeaturedProducts />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
