'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { EmptyState } from './EmptyState';

interface ProductRecommendationsProps {
  productId: string;
}

export function ProductRecommendations({ productId }: ProductRecommendationsProps) {
  const [related, setRelated] = useState<any[]>([]);
  const [frequentlyBoughtTogether, setFrequentlyBoughtTogether] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch(`/api/products/${productId}/recommendations`);
        const data = await response.json();
        
        if (data.success) {
          setRelated(data.related || []);
          setFrequentlyBoughtTogether(data.frequentlyBoughtTogether || []);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [productId]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Frequently Bought Together</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">Related Products</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {frequentlyBoughtTogether.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4">Frequently Bought Together</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {frequentlyBoughtTogether.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4">Related Products</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {!frequentlyBoughtTogether.length && !related.length && (
        <EmptyState type="products" title="No recommendations found" />
      )}
    </div>
  );
}
