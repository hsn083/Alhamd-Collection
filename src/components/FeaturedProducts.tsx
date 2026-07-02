'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { Loader2, Package, ShoppingBag } from 'lucide-react';
import { Product } from '@/types';
import { useProductStore } from '@/store/productStore';

export default function FeaturedProducts() {
  const [isLoading, setIsLoading] = useState(true);
  
  const { products, refetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      await refetchProducts();
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 8);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
  const newArrivals = products.filter(p => p.newArrival).slice(0, 4);

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        </div>
      </section>
    );
  }

  const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-gray-900">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
        View All
      </Button>
    </div>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <ShoppingBag className="h-8 w-8 text-gray-400" />
      </div>
      <p className="text-muted-foreground mb-4">No products available at the moment.</p>
      <Link href="/shop">
        <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
          Continue Shopping
        </Button>
      </Link>
    </div>
  );

  return (
    <>
      {/* Best Sellers */}
      <div className="mb-16">
        <SectionHeader title="Best Sellers" subtitle="Top-selling fashion favourites" />
        {bestSellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState message="No best sellers available" />
        )}
      </div>

      {/* Trending Collection */}
      <div className="mb-16">
        <SectionHeader title="Trending Collection" subtitle="Our most-loved fashion picks" />
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState message="No featured products available" />
        )}
      </div>

      {/* New Arrivals */}
      <div>
        <SectionHeader title="New Arrivals" subtitle="Fresh styles just dropped" />
        {newArrivals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
        ) : (
          <EmptyState message="No new arrivals yet" />
        )}
      </div>
    </>
  );
}
