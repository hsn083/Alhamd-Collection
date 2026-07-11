'use client';

import { useEffect, useState } from 'react';

const RECENTLY_VIEWED_KEY = 'recently_viewed_products';
const MAX_RECENTLY_VIEWED = 10;

export interface RecentlyViewedProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  images: string[];
  brand?: string;
  category?: string;
  viewedAt: string;
}

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);

  useEffect(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recently viewed products:', error);
    }
  }, []);

  const addToRecentlyViewed = (product: any) => {
    const newProduct: RecentlyViewedProduct = {
      _id: product._id?.toString() || product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      discountPrice: product.discountPrice,
      images: product.images || [],
      brand: product.brand,
      category: product.category?.name || product.category,
      viewedAt: new Date().toISOString(),
    };

    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(p => p._id !== newProduct._id);
      
      // Add to beginning
      const updated = [newProduct, ...filtered];
      
      // Keep only the most recent
      const limited = updated.slice(0, MAX_RECENTLY_VIEWED);
      
      // Save to localStorage
      try {
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(limited));
      } catch (error) {
        console.error('Error saving recently viewed products:', error);
      }
      
      return limited;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    try {
      localStorage.removeItem(RECENTLY_VIEWED_KEY);
    } catch (error) {
      console.error('Error clearing recently viewed products:', error);
    }
  };

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed,
  };
}
