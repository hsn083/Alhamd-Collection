'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Grid, List, Filter, ArrowLeft, Loader2, Package } from 'lucide-react';
import { Category, Product } from '@/types';
import { useProductStore } from '@/store/productStore';

export default function CategorySlugPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { products, refetchProducts, getProductsByCategory } = useProductStore();

  // Fetch category and products data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryResponse = await fetch('/api/categories');
        const categoryData = await categoryResponse.json();
        
        if (categoryData.success) {
          const foundCategory = categoryData.categories.find((cat: Category) => cat.slug === slug);
          setCategory(foundCategory || null);
          
          // Update document title for SEO
          if (foundCategory) {
            document.title = foundCategory.metaTitle || `${foundCategory.name} - AlhamdCollection`;
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
              metaDescription.setAttribute('content', foundCategory.metaDescription || foundCategory.description);
            }
          }
        }
        
        // Refetch products from store
        await refetchProducts();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [slug, refetchProducts]);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50/50">
          <div className="container mx-auto px-4 py-20">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!category) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50/50">
          <div className="container mx-auto px-4 py-20">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 text-emerald-900">Category Not Found</h1>
              <p className="text-muted-foreground mb-8">The category you're looking for doesn't exist.</p>
              <Button 
                onClick={() => window.location.href = '/categories'}
                className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Categories
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const categoryProducts = getProductsByCategory(category?.id, category?.slug);

  const sortedProducts = [...categoryProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      case 'price-high':
        return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'featured':
      default:
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    }
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50/50">
        {/* Category Header */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 py-16 border-b border-emerald-100 text-gray-900">
          <div className="container mx-auto px-4">
            <Button 
              variant="ghost" 
              className="text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 mb-4"
              onClick={() => window.location.href = '/categories'}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Button>
            <div className="flex items-center space-x-4 mb-4">
              {category.image ? (
                <div className="relative w-20 h-20">
                  <Image 
                    src={category.image} 
                    alt={category.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/5 to-teal-600/5 rounded-lg flex items-center justify-center text-4xl">
                  {category.slug === 'mens-clothing' ? '👔' : category.slug === 'womens-clothing' ? '👗' : '🛍️'}
                </div>
              )}
              <div>
                <h1 className="text-4xl font-bold text-emerald-950">{category.name}</h1>
                <p className="text-emerald-800/80">{category.description}</p>
              </div>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-semibold">{category.productCount} Products</Badge>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filters and Sort */}
          <Card className="mb-6 border border-emerald-100 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-emerald-100 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-gray-800"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          {sortedProducts.length === 0 ? (
            <Card className="border border-emerald-100 bg-white shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">🛍️</div>
                <h3 className="text-xl font-semibold mb-2 text-emerald-950">No products found</h3>
                <p className="text-muted-foreground">There are no products in this category yet.</p>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedProducts.map(product => (
                <Card key={product.id} className="border border-emerald-100 bg-white hover:border-emerald-200 transition-colors shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-teal-600/5 rounded flex items-center justify-center text-4xl">
                        {category.slug === 'mens-clothing' ? '👔' : category.slug === 'womens-clothing' ? '👗' : '🛍️'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1 text-emerald-950">{product.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-emerald-700">
                            PKR {(product.discountPrice || product.price).toLocaleString()}
                          </span>
                          {product.discountPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              PKR {product.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm"
                          className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
                          onClick={() => window.location.href = `/product/${product.slug}`}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
