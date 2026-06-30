'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star, Zap } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { addItem, clearCart } = useCartStore();
  const [imageError, setImageError] = useState(false);
  const discount = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    clearCart();
    addItem(product);
    window.location.href = '/checkout';
  };

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border border-gray-100 bg-white hover:border-emerald-200">
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-emerald-50/30 flex items-center justify-center overflow-hidden">
          {product.images && product.images.length > 0 && !imageError ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
              onError={() => {
                console.error('ProductCard image failed to load:', product.images[0]);
                setImageError(true);
              }}
            />
          ) : null}
          <div className="w-full h-full flex items-center justify-center text-6xl group-hover:scale-110 transition-transform" style={{ display: (product.images && product.images.length > 0 && !imageError) ? 'none' : 'flex' }}>
            👗
          </div>
          
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 z-10 text-white">
              -{discount}%
            </Badge>
          )}
          
          {product.isNew && (
            <Badge className="absolute top-2 right-10 bg-gradient-to-r from-emerald-500 to-teal-600 z-10 text-white">
              New
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white shadow-sm z-10"
            onClick={(e) => {
              e.preventDefault();
              toggleItem(product.id);
            }}
          >
            <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </Button>
        </div>
      </Link>
      
      <CardContent className="p-4">
        {product.brand && (
          <p className="text-xs text-emerald-600 font-medium mb-1 uppercase tracking-wide">{product.brand}</p>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors text-gray-800">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center space-x-1 mb-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-gray-700">{product.rating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">({product.reviewCount || product.reviews})</span>
        </div>
        
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
      </CardContent>
      
      <CardFooter className="p-4 pt-0 space-y-2">
        <Button 
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold" 
          size="sm"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
        <Button 
          className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold" 
          size="sm"
          variant="outline"
          onClick={handleBuyNow}
        >
          <Zap className="mr-2 h-4 w-4" />
          Buy Now
        </Button>
      </CardFooter>
    </Card>
  );
}
