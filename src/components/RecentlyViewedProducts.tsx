'use client';

import { useEffect } from 'react';
import ProductCard from './ProductCard';
import { EmptyState } from './EmptyState';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

export function RecentlyViewedProducts() {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Recently Viewed</h2>
        <button
          onClick={clearRecentlyViewed}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Clear All
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {recentlyViewed.map(product => (
          <ProductCard key={product._id} product={product as any} />
        ))}
      </div>
    </section>
  );
}
