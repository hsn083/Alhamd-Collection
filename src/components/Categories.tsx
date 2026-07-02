'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Category } from '@/types';

// Fashion category emojis as fallback
const categoryEmojis: Record<string, string> = {
  'mens-clothing': '👔',
  'womens-clothing': '👗',
  'shoes': '👟',
  'sneakers': '👠',
  'formal-wear': '🎩',
  'casual-wear': '🧢',
  'sportswear': '🏃',
  'accessories': '👜',
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?status=active&updateCounts=true');
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories.slice(0, 8));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <>
      <div className="text-center mb-12">
        <span className="text-sm font-semibold text-emerald-600 tracking-widest uppercase">Collections</span>
        <h2 className="text-3xl font-bold mt-2 mb-4 text-gray-900">Shop by Category</h2>
        <p className="text-muted-foreground">Browse our premium fashion collections</p>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading collections...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-emerald-200">
                <div className="aspect-square bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center relative overflow-hidden">
                  {category.image ? (
                    <Image 
                      src={category.image} 
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-6xl mb-4">
                      {categoryEmojis[category.slug] || '👗'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1 group-hover:text-emerald-700 transition-colors text-gray-800">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{category.description}</p>
                  <div className="flex items-center text-sm text-emerald-600 font-medium">
                    <span>{category.productCount} Products</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
