import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { productSchema } from '@/lib/schemas';

const DATA_DIR = join(process.cwd(), 'data');
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

interface ProductsData {
  products: StoredProduct[];
}

async function ensureDataDirectory() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
    console.log('Data directory created:', DATA_DIR);
  }
}

async function loadProducts(): Promise<StoredProduct[]> {
  try {
    await ensureDataDirectory();
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

// All route handlers
export async function GET() {
  try {
    console.log('GET /api/admin/productsapi called');
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
    console.log('POST /api/admin/productsapi called');
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

    const skuExists = products.some(p => p.sku === formData.sku);
    if (skuExists) {
      console.error('SKU already exists:', formData.sku);
      return NextResponse.json(
        { success: false, error: 'Product with this SKU already exists' },
        { status: 409 }
      );
    }

    const newProduct: StoredProduct = {
      id: String(Math.max(...products.map(p => parseInt(p.id) || 0), 0) + 1),
      name: formData.name,
      slug: generateSlug(formData.name),
      sku: formData.sku,
      description: formData.description,
      price: formData.price,
      discountPrice: formData.discountPrice || undefined,
      category: formData.category,
      brand: formData.brand,
      stock: formData.stock,
      images: formData.images || [],
      specifications: {},
      features: formData.features || [],
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

    console.log('Product created successfully:', newProduct.id);
    return NextResponse.json(
      {
        success: true,
        data: newProduct,
        message: 'Product created successfully',
      },
      { status: 201 }
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
    console.log('PUT /api/admin/productsapi called');
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

    const skuExists = products.some(p => p.sku === formData.sku && p.id !== body.id);
    if (skuExists) {
      console.error('SKU already exists:', formData.sku);
      return NextResponse.json(
        { success: false, error: 'Product with this SKU already exists' },
        { status: 409 }
      );
    }

    const updatedProduct: StoredProduct = {
      ...products[productIndex],
      name: formData.name,
      slug: generateSlug(formData.name),
      sku: formData.sku,
      description: formData.description,
      price: formData.price,
      discountPrice: formData.discountPrice || undefined,
      category: formData.category,
      brand: formData.brand,
      stock: formData.stock,
      images: formData.images || [],
      features: formData.features || [],
      warranty: formData.warranty || '',
      isNew: formData.isNew || false,
      isFeatured: formData.isFeatured || false,
      isBestSeller: formData.isBestSeller || false,
      tags: formData.tags || [],
      updatedAt: new Date().toISOString(),
    };

    products[productIndex] = updatedProduct;
    await saveProducts(products);

    console.log('Product updated successfully:', body.id);
    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully',
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
    console.log('DELETE /api/admin/productsapi called');
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

    console.log('Product deleted successfully:', id);
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
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
