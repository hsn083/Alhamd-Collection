'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { Loader2, Package } from 'lucide-react';
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
  const newArrivals = products.filter(p => p.isNew).slice(0, 4);

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
    <div className="text-center py-12 text-muted-foreground">
      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>{message}</p>
    </div>
  );

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* New Arrivals */}
        <div className="mb-16">
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

        {/* Featured Products */}
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

        {/* Best Sellers */}
        <div>
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
      </div>
    </section>
  );
}
