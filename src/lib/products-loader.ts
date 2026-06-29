import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const PUBLIC_DIR = join(process.cwd(), 'public');
const DATA_DIR = join(PUBLIC_DIR, 'data');
const PRODUCTS_FILE = join(DATA_DIR, 'products.json');

interface StoredProduct {
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

export async function loadProductsFromFile(): Promise<StoredProduct[]> {
  try {
    if (!existsSync(PRODUCTS_FILE)) {
      console.log('Products file does not exist');
      return [];
    }
    const data = await readFile(PRODUCTS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    console.log('Loaded', parsed.products.length, 'products from file');
    return parsed.products || [];
  } catch (error) {
    console.error('Error loading products from file:', error);
    return [];
  }
}

// Cache products in memory for the current session
let productsCache: StoredProduct[] | null = null;

export async function getProducts(): Promise<StoredProduct[]> {
  if (productsCache !== null) {
    return productsCache;
  }
  productsCache = await loadProductsFromFile();
  return productsCache;
}

export function invalidateProductsCache(): void {
  productsCache = null;
}
