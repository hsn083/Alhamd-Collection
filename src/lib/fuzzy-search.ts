import Fuse from 'fuse.js';

export interface SearchableProduct {
  _id: string | { toString: () => string };
  name: string;
  description: string;
  slug: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category?: {
    _id: string | { toString: () => string };
    name: string;
    slug: string;
  };
  brand?: string;
  tags?: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  newArrival: boolean;
  isBestSeller: boolean;
  createdAt?: Date | string;
}

export interface SearchableCategory {
  _id: string | { toString: () => string };
  name: string;
  description: string;
  slug: string;
}

const productFuseOptions: any = {
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'description', weight: 0.3 },
    { name: 'tags', weight: 0.2 },
    { name: 'brand', weight: 0.4 },
  ],
  threshold: 0.4,
  distance: 100,
  minMatchCharLength: 2,
  includeScore: true,
  ignoreLocation: true,
  useExtendedSearch: true,
};

const categoryFuseOptions: any = {
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'description', weight: 0.3 },
  ],
  threshold: 0.4,
  distance: 100,
  minMatchCharLength: 2,
  includeScore: true,
  ignoreLocation: true,
};

export function fuzzySearchProducts(
  products: SearchableProduct[],
  query: string,
  limit: number = 20
): SearchableProduct[] {
  if (!query || !query.trim()) {
    return products.slice(0, limit);
  }

  const fuse = new Fuse(products, productFuseOptions);
  const results = fuse.search(query);

  return results
    .map(result => result.item)
    .slice(0, limit);
}

export function fuzzySearchCategories(
  categories: SearchableCategory[],
  query: string,
  limit: number = 10
): SearchableCategory[] {
  if (!query || !query.trim()) {
    return categories.slice(0, limit);
  }

  const fuse = new Fuse(categories, categoryFuseOptions);
  const results = fuse.search(query);

  return results
    .map(result => result.item)
    .slice(0, limit);
}

export function fuzzySearchBrands(
  products: SearchableProduct[],
  query: string,
  limit: number = 10
): string[] {
  if (!query || !query.trim()) {
    return [];
  }

  const uniqueBrands = Array.from(
    new Set(
      products
        .map(p => p.brand)
        .filter((brand): brand is string => !!brand)
    )
  );

  const fuse = new Fuse(
    uniqueBrands.map(brand => ({ brand })),
    {
      keys: ['brand'],
      threshold: 0.4,
      minMatchCharLength: 2,
      includeScore: true,
    }
  );

  const results = fuse.search(query);
  return results
    .map(result => result.item.brand)
    .slice(0, limit);
}

export function getSearchScore(
  products: SearchableProduct[],
  query: string
): Map<string, number> {
  if (!query || !query.trim()) {
    return new Map();
  }

  const fuse = new Fuse(products, productFuseOptions);
  const results = fuse.search(query);

  const scoreMap = new Map<string, number>();
  results.forEach(result => {
    scoreMap.set(result.item._id.toString(), result.score || 0);
  });

  return scoreMap;
}
