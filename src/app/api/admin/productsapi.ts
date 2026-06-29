import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { productSchema } from '@/lib/schemas';
import { updateCategoryProductCounts } from '@/lib/categories';

const DATA_DIR = join(process.cwd(), 'data');
const PRODUCTS_FILE = join(DATA_DIR, 'products.json');

interface StoredProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  brand: string;
  stock: number;
  images: string[];
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

interface ProductsData {
  products: StoredProduct[];
}

const SEED_PRODUCTS: StoredProduct[] = [
  {
    id: '1',
    name: 'Razer DeathAdder V2 Gaming Mouse',
    slug: 'razer-deathadder-v2-gaming-mouse',
    description: 'The Razer DeathAdder V2 features the fastest optical sensor on the market, designed for gaming precision.',
    price: 8999,
    discountPrice: 7999,
    category: "Men's Clothing",
    brand: 'Razer',
    stock: 25,
    images: ['/images/products/razer-mouse-1.jpg', '/images/products/razer-mouse-2.jpg', '/images/products/razer-mouse-3.jpg'],
    warranty: '2 Years',
    rating: 4.8,
    reviews: 234,
    isNew: false,
    isFeatured: true,
    isBestSeller: true,
    tags: ['gaming', 'mouse', 'razer', 'rgb'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-05-20T00:00:00Z',
  },
  {
    id: '2',
    name: 'Logitech G Pro X Mechanical Keyboard',
    slug: 'logitech-g-pro-x-mechanical-keyboard',
    description: 'Pro-grade mechanical gaming keyboard with swappable switches for complete customization.',
    price: 15999,
    discountPrice: 13999,
    category: "Men's Clothing",
    brand: 'Logitech',
    stock: 18,
    images: ['/images/products/logitech-keyboard-1.jpg', '/images/products/logitech-keyboard-2.jpg'],
    warranty: '2 Years',
    rating: 4.9,
    reviews: 189,
    isNew: false,
    isFeatured: true,
    isBestSeller: true,
    tags: ['gaming', 'keyboard', 'logitech', 'mechanical'],
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-05-18T00:00:00Z',
  },
  {
    id: '3',
    name: 'Corsair K70 RGB MK.2 Mechanical Keyboard',
    slug: 'corsair-k70-rgb-mk2-mechanical-keyboard',
    description: 'High-performance mechanical gaming keyboard with per-key RGB backlighting and aircraft-grade aluminum frame.',
    price: 18999,
    category: "Men's Clothing",
    brand: 'Corsair',
    stock: 12,
    images: ['/images/products/corsair-keyboard-1.jpg', '/images/products/corsair-keyboard-2.jpg'],
    warranty: '2 Years',
    rating: 4.7,
    reviews: 156,
    isNew: false,
    isFeatured: true,
    isBestSeller: false,
    tags: ['gaming', 'keyboard', 'corsair', 'rgb'],
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-05-15T00:00:00Z',
  },
  {
    id: '4',
    name: 'SteelSeries Arctis 7 Gaming Headset',
    slug: 'steelseries-arctis-7-gaming-headset',
    description: 'Wireless gaming headset with premium sound, ClearCast microphone, and 24-hour battery life.',
    price: 14999,
    discountPrice: 12999,
    category: "Men's Clothing",
    brand: 'SteelSeries',
    stock: 20,
    images: ['/images/products/steelseries-headset-1.jpg', '/images/products/steelseries-headset-2.jpg'],
    warranty: '2 Years',
    rating: 4.6,
    reviews: 198,
    isNew: false,
    isFeatured: true,
    isBestSeller: true,
    tags: ['gaming', 'headset', 'steelseries', 'wireless'],
    createdAt: '2024-02-05T00:00:00Z',
    updatedAt: '2024-05-22T00:00:00Z',
  },
  {
    id: '5',
    name: 'Anker PowerCore 10000 Portable Charger',
    slug: 'anker-powercore-10000-portable-charger',
    description: 'Ultra-compact 10000mAh power bank with fast charging for all your devices.',
    price: 3499,
    category: 'Mobile Accessories',
    brand: 'Anker',
    stock: 45,
    images: ['/images/products/anker-powerbank-1.jpg', '/images/products/anker-powerbank-2.jpg'],
    warranty: '18 Months',
    rating: 4.5,
    reviews: 312,
    isNew: false,
    isFeatured: false,
    isBestSeller: true,
    tags: ['mobile', 'powerbank', 'anker', 'charging'],
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-05-10T00:00:00Z',
  },
  {
    id: '6',
    name: 'Redragon K552 Mechanical Keyboard',
    slug: 'redragon-k552-mechanical-keyboard',
    description: 'Budget-friendly mechanical gaming keyboard with RGB lighting and durable construction.',
    price: 5999,
    discountPrice: 4999,
    category: "Men's Clothing",
    brand: 'Redragon',
    stock: 35,
    images: ['/images/products/redragon-keyboard-1.jpg', '/images/products/redragon-keyboard-2.jpg'],
    warranty: '1 Year',
    rating: 4.3,
    reviews: 267,
    isNew: true,
    isFeatured: false,
    isBestSeller: false,
    tags: ['gaming', 'keyboard', 'redragon', 'budget'],
    createdAt: '2024-05-01T00:00:00Z',
    updatedAt: '2024-05-25T00:00:00Z',
  },
  {
    id: '7',
    name: 'HyperX Cloud II Gaming Headset',
    slug: 'hyperx-cloud-ii-gaming-headset',
    description: 'Award-winning gaming headset with virtual 7.1 surround sound and superior comfort.',
    price: 11999,
    discountPrice: 9999,
    category: "Men's Clothing",
    brand: 'HyperX',
    stock: 22,
    images: ['/images/products/hyperx-headset-1.jpg', '/images/products/hyperx-headset-2.jpg'],
    warranty: '2 Years',
    rating: 4.7,
    reviews: 423,
    isNew: false,
    isFeatured: true,
    isBestSeller: true,
    tags: ['gaming', 'headset', 'hyperx', 'wired'],
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: '2024-05-20T00:00:00Z',
  },
  {
    id: '8',
    name: 'ASUS ROG Strix RTX 3060 Graphics Card',
    slug: 'asus-rog-strix-rtx-3060-graphics-card',
    description: 'High-performance graphics card with 12GB GDDR6 memory and advanced cooling.',
    price: 54999,
    discountPrice: 49999,
    category: 'PC Accessories',
    brand: 'ASUS',
    stock: 8,
    images: ['/images/products/asus-gpu-1.jpg', '/images/products/asus-gpu-2.jpg'],
    warranty: '3 Years',
    rating: 4.8,
    reviews: 89,
    isNew: false,
    isFeatured: true,
    isBestSeller: false,
    tags: ['pc', 'gpu', 'asus', 'nvidia'],
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-05-18T00:00:00Z',
  },
];

async function ensureDataDirectory() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
    console.log('Data directory created:', DATA_DIR);
  }
}

async function initializeProducts() {
  try {
    if (!existsSync(PRODUCTS_FILE)) {
      console.log('Initializing products.json with seed data...');
      const data: ProductsData = { products: SEED_PRODUCTS };
      await writeFile(PRODUCTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
      console.log('Products initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing products:', error);
  }
}

async function loadProducts(): Promise<StoredProduct[]> {
  try {
    await ensureDataDirectory();
    await initializeProducts();
    
    if (!existsSync(PRODUCTS_FILE)) {
      console.log('Products file does not exist, returning empty array');
      return [];
    }
    const data = await readFile(PRODUCTS_FILE, 'utf-8');
    const parsed = JSON.parse(data) as ProductsData;
    console.log('Loaded', parsed.products.length, 'products from file');
    return parsed.products;
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

async function saveProducts(products: StoredProduct[]): Promise<void> {
  try {
    await ensureDataDirectory();
    const data: ProductsData = { products };
    await writeFile(PRODUCTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log('Saved', products.length, 'products to file');
  } catch (error) {
    console.error('Error saving products:', error);
    throw error;
  }
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/-+/g, '-');
}

export async function GET() {
  try {
    console.log('GET /api/admin/products called');
    const products = await loadProducts();
    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/admin/products called');
    const body = await request.json();
    console.log('Request body:', body);

    const validationResult = productSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation errors:', validationResult.error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          errors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const formData = validationResult.data;
    const products = await loadProducts();

    const newProduct: StoredProduct = {
      id: String(Math.max(...products.map(p => parseInt(p.id) || 0), 0) + 1),
      name: formData.name,
      slug: generateSlug(formData.name),
      description: formData.description,
      price: formData.price,
      discountPrice: formData.discountPrice || undefined,
      category: formData.category,
      brand: formData.brand,
      stock: formData.stock,
      images: formData.images || [],
      warranty: formData.warranty || '',
      rating: 0,
      reviews: 0,
      isNew: formData.isNew || false,
      isFeatured: formData.isFeatured || false,
      isBestSeller: formData.isBestSeller || false,
      tags: formData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    products.push(newProduct);
    await saveProducts(products);

    // Update category product counts
    await updateCategoryProductCounts();

    console.log('Product created successfully:', newProduct.id);
    return NextResponse.json(
      {
        success: true,
        data: newProduct,
        message: 'Product created successfully',
      },
      { 
        status: 201,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create product' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/admin/products called');
    const body = await request.json();
    console.log('Request body:', body);

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const validationResult = productSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation errors:', validationResult.error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          errors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const formData = validationResult.data;
    const products = await loadProducts();

    const productIndex = products.findIndex(p => p.id === body.id);
    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const updatedProduct: StoredProduct = {
      ...products[productIndex],
      name: formData.name,
      slug: generateSlug(formData.name),
      description: formData.description,
      price: formData.price,
      discountPrice: formData.discountPrice || undefined,
      category: formData.category,
      brand: formData.brand,
      stock: formData.stock,
      images: formData.images || [],
      warranty: formData.warranty || '',
      isNew: formData.isNew || false,
      isFeatured: formData.isFeatured || false,
      isBestSeller: formData.isBestSeller || false,
      tags: formData.tags || [],
      updatedAt: new Date().toISOString(),
    };

    products[productIndex] = updatedProduct;
    await saveProducts(products);

    // Update category product counts
    await updateCategoryProductCounts();

    console.log('Product updated successfully:', body.id);
    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully',
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update product' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE /api/admin/products called');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const products = await loadProducts();
    const initialLength = products.length;
    const filtered = products.filter(p => p.id !== id);

    if (filtered.length === initialLength) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    await saveProducts(filtered);

    // Update category product counts
    await updateCategoryProductCounts();

    console.log('Product deleted successfully:', id);
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete product' 
      },
      { status: 500 }
    );
  }
}
