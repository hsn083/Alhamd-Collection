'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Package } from 'lucide-react';
import { Category, Product } from '@/types';
import { useProductStore } from '@/store/productStore';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  
  const { products, refetchProducts, getProductsByCategory } = useProductStore();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?status=active');
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        await refetchProducts();
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [refetchProducts]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50/50">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 py-16 border-b border-emerald-100 text-gray-900">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4 text-emerald-950">All Categories</h1>
            <p className="text-xl text-emerald-800">Browse our premium clothing collections</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {isLoadingCategories ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <>
              {/* Category Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {categories.map((category) => (
                  <Card 
                    key={category.id} 
                    className="overflow-hidden hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer group border border-emerald-100 bg-white hover:-translate-y-1"
                    onClick={() => window.location.href = `/category/${category.slug}`}
                  >
                    <div className="aspect-video bg-gradient-to-br from-emerald-500/5 to-teal-600/5 flex items-center justify-center group-hover:from-emerald-500/10 group-hover:to-teal-600/10 transition-colors relative">
                      {category.image ? (
                        <Image 
                          src={category.image} 
                          alt={category.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                          {category.slug === 'mens-clothing' ? '👔' : category.slug === 'womens-clothing' ? '👗' : '🛍️'}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-bold text-lg text-emerald-950 mb-1 group-hover:text-emerald-600 transition-colors">{category.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 h-10">{category.description}</p>
                      <Badge className="mt-4 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs font-semibold">{category.productCount || 0} Products</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Featured Products by Category */}
              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              ) : (
                <div className="space-y-12">
                  {categories.map((category) => {
                    const categoryProducts = getProductsByCategory(category.id, category.slug).slice(0, 4);
                    if (categoryProducts.length === 0) return null;
                    
                    return (
                      <div key={category.id}>
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-2xl font-bold text-emerald-950">{category.name}</h2>
                          <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800" onClick={() => window.location.href = `/category/${category.slug}`}>
                            View All
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          {categoryProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {categories.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50 text-emerald-600" />
                      <p>No categories available</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
