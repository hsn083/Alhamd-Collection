'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Check, Star } from 'lucide-react';
import Image from 'next/image';
import { useProductComparison } from '@/hooks/useProductComparison';

export function ProductComparison() {
  const { comparisonList, removeFromComparison, clearComparison } = useProductComparison();

  if (comparisonList.length === 0) {
    return null;
  }

  const comparisonFeatures = [
    { key: 'price', label: 'Price', format: (value: any) => `PKR ${value?.toLocaleString() || 0}` },
    { key: 'brand', label: 'Brand', format: (value: any) => value || 'N/A' },
    { key: 'category', label: 'Category', format: (value: any) => value?.name || value || 'N/A' },
    { key: 'stock', label: 'Stock', format: (value: any) => value > 0 ? `${value} available` : 'Out of Stock' },
    { key: 'rating', label: 'Rating', format: (value: any) => (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span>{value || 0}</span>
      </div>
    )},
    { key: 'reviewCount', label: 'Reviews', format: (value: any) => value || 0 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Compare Products ({comparisonList.length}/4)</h3>
            <p className="text-sm text-gray-500">Select up to 4 products to compare</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearComparison}>
              Clear All
            </Button>
            <Button size="sm" onClick={() => window.location.href = '/compare'}>
              Compare Now
            </Button>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {comparisonList.map((product) => (
            <Card key={product._id || product.id} className="min-w-[200px] flex-shrink-0 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 bg-white/80 hover:bg-white"
                onClick={() => removeFromComparison(product._id || product.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardContent className="p-4">
                <div className="relative w-full h-32 mb-3 bg-gray-100 rounded-lg overflow-hidden">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🎮
                    </div>
                  )}
                </div>
                <h4 className="font-medium text-sm truncate">{product.name}</h4>
                <p className="text-sm text-gray-500">
                  PKR {(product.discountPrice || product.price)?.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FullProductComparison() {
  const { comparisonList, clearComparison } = useProductComparison();

  if (comparisonList.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 mb-4">No products selected for comparison</p>
            <Button onClick={() => window.location.href = '/shop'}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const comparisonFeatures = [
    { key: 'price', label: 'Price', format: (value: any) => `PKR ${value?.toLocaleString() || 0}` },
    { key: 'discountPrice', label: 'Sale Price', format: (value: any, product: any) => 
      value ? `PKR ${value.toLocaleString()}` : '-' 
    },
    { key: 'brand', label: 'Brand', format: (value: any) => value || 'N/A' },
    { key: 'category', label: 'Category', format: (value: any) => value?.name || value || 'N/A' },
    { key: 'stock', label: 'Stock', format: (value: any) => value > 0 ? `${value} available` : 'Out of Stock' },
    { key: 'rating', label: 'Rating', format: (value: any) => (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span>{value || 0}</span>
      </div>
    )},
    { key: 'reviewCount', label: 'Reviews', format: (value: any) => value || 0 },
    { key: 'description', label: 'Description', format: (value: any) => value?.substring(0, 100) + '...' || 'N/A' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Product Comparison</h1>
        <Button variant="outline" onClick={clearComparison}>
          Clear Comparison
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-4 text-left bg-gray-50 border-b min-w-[200px]">Feature</th>
              {comparisonList.map((product) => (
                <th key={product._id || product.id} className="p-4 text-center bg-gray-50 border-b min-w-[250px]">
                  <div className="relative w-full h-40 mx-auto mb-3 bg-gray-100 rounded-lg overflow-hidden">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🎮
                      </div>
                    )}
                  </div>
                  <p className="font-medium text-sm">{product.name}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonFeatures.map((feature) => (
              <tr key={feature.key}>
                <td className="p-4 font-medium bg-gray-50 border-b">{feature.label}</td>
                {comparisonList.map((product) => (
                  <td key={product._id || product.id} className="p-4 text-center border-b">
                    {feature.format(product[feature.key], product)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="p-4 font-medium bg-gray-50 border-b">Actions</td>
              {comparisonList.map((product) => (
                <td key={product._id || product.id} className="p-4 text-center border-b">
                  <Button
                    size="sm"
                    onClick={() => window.location.href = `/product/${product.slug}`}
                  >
                    View Details
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
