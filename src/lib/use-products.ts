'use client';

import { useState, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  brand: string;
  stock: number;
  images: string[];
  specifications: Record<string, string>;
  features: string[];
  warranty: string;
  rating: number;
  reviews: number;
  isNew: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading products from API...');
      
      const response = await fetch('/api/admin', {
        method: 'GET',
        cache: 'no-store',
      });

      const result = await response.json();
      console.log('Loaded products:', result);

      if (result.success && Array.isArray(result.data)) {
        setProducts(result.data);
      } else {
        console.warn('Failed to load products:', result.error);
        setError(result.error || 'Failed to load products');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return { products, isLoading, error, refetch: loadProducts };
}
