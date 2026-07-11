'use client';

import { Badge } from '@/components/ui/badge';
import { Sparkles, Flame, Award, TrendingUp } from 'lucide-react';

export type ProductBadgeType = 'new' | 'sale' | 'best_seller' | 'featured' | 'low_stock' | 'out_of_stock';

interface ProductBadgeProps {
  type: ProductBadgeType;
  discount?: number;
}

const badgeConfig: Record<ProductBadgeType, { label: string; icon: any; className: string }> = {
  new: {
    label: 'New',
    icon: Sparkles,
    className: 'bg-emerald-500 text-white hover:bg-emerald-600',
  },
  sale: {
    label: 'Sale',
    icon: Flame,
    className: 'bg-red-500 text-white hover:bg-red-600',
  },
  best_seller: {
    label: 'Best Seller',
    icon: Award,
    className: 'bg-amber-500 text-white hover:bg-amber-600',
  },
  featured: {
    label: 'Featured',
    icon: TrendingUp,
    className: 'bg-blue-500 text-white hover:bg-blue-600',
  },
  low_stock: {
    label: 'Low Stock',
    icon: null,
    className: 'bg-orange-500 text-white hover:bg-orange-600',
  },
  out_of_stock: {
    label: 'Out of Stock',
    icon: null,
    className: 'bg-gray-500 text-white hover:bg-gray-600',
  },
};

export function ProductBadge({ type, discount }: ProductBadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.icon;

  if (type === 'sale' && discount) {
    return (
      <Badge className={`${config.className} text-xs font-semibold`}>
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {discount}% OFF
      </Badge>
    );
  }

  return (
    <Badge className={`${config.className} text-xs font-semibold`}>
      {Icon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
}

interface ProductBadgesProps {
  product: {
    newArrival?: boolean;
    discountPrice?: number;
    price: number;
    isBestSeller?: boolean;
    isFeatured?: boolean;
    stock?: number;
    status?: string;
  };
}

export function ProductBadges({ product }: ProductBadgesProps) {
  const badges: ProductBadgeType[] = [];

  // Check for out of stock
  if (product.status === 'inactive' || product.stock === 0) {
    badges.push('out_of_stock');
    return <ProductBadge type="out_of_stock" />;
  }

  // Check for low stock
  if (product.stock && product.stock > 0 && product.stock <= 5) {
    badges.push('low_stock');
  }

  // Check for new arrival
  if (product.newArrival) {
    badges.push('new');
  }

  // Check for sale
  if (product.discountPrice && product.discountPrice < product.price) {
    const discount = Math.round(((product.price - product.discountPrice) / product.price) * 100);
    badges.push('sale');
    return <ProductBadge type="sale" discount={discount} />;
  }

  // Check for best seller
  if (product.isBestSeller) {
    badges.push('best_seller');
  }

  // Check for featured
  if (product.isFeatured) {
    badges.push('featured');
  }

  // Return the first badge (priority order)
  if (badges.length > 0) {
    return <ProductBadge type={badges[0]} />;
  }

  return null;
}
