import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Generate a unique slug by appending numbers if needed
async function generateUniqueSlug(baseName: string, excludeId?: string): Promise<string> {
  // Convert to slug format
  let slug = baseName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // If slug is empty after cleaning, use a default
  if (!slug) {
    slug = 'product';
  }

  // Check if slug already exists
  let counter = 0;
  let uniqueSlug = slug;
  let maxAttempts = 100;

  while (counter < maxAttempts) {
    const query: any = { slug: uniqueSlug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await Product.findOne(query);
    if (!existing) {
      return uniqueSlug;
    }

    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }

  // Fallback: use timestamp
  uniqueSlug = `${slug}-${Date.now()}`;
  return uniqueSlug;
}

// GET - Fetch all products (admin view - includes inactive)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: any = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    // Build sort options
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    // Transform products to match frontend type expectations
    const transformedProducts = products.map(product => {
      const productObj = product.toObject();
      const category = productObj.category as any;
      return {
        ...productObj,
        id: product._id.toString(),
        categoryId: category?._id?.toString() || category?.toString() || '',
        category: category?.name || '',
        reviews: product.reviewCount || 0,
        reviewCount: product.reviewCount || 0,
        stockQuantity: product.stock,
        stockStatus: product.stock > 10 ? 'in_stock' : product.stock > 0 ? 'low_stock' : 'out_of_stock',
        specifications: {},
        features: [],
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedProducts,
      products: transformedProducts,
      count: transformedProducts.length,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    console.log('POST /api/admin/products called with body:', body);

    // Validate required fields
    const requiredFields = ['name', 'category', 'price', 'stock', 'description'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await Category.findById(body.category);
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(body.name);

    // Create new product
    const newProduct = await Product.create({
      name: body.name,
      slug,
      description: body.description,
      price: Number(body.price),
      discountPrice: body.discountPrice ? Number(body.discountPrice) : undefined,
      category: body.category,
      brand: body.brand,
      stock: Number(body.stock),
      lowStockThreshold: body.lowStockThreshold || 10,
      images: body.images || [],
      thumbnail: body.thumbnail,
      sizes: body.sizes || [],
      colors: body.colors || [],
      warranty: body.warranty,
      tags: body.tags || [],
      isFeatured: body.isFeatured || false,
      newArrival: body.isNew || false,
      isBestSeller: body.isBestSeller || false,
      status: body.status || 'active',
    });

    // Update category product count
    await Category.findByIdAndUpdate(body.category, {
      $inc: { productCount: 1 }
    });

    // Transform product to match frontend type expectations
    const transformedProduct = {
      ...newProduct.toObject(),
      id: newProduct._id.toString(),
      categoryId: newProduct.category?.toString() || '',
      category: category.name || '',
      reviews: newProduct.reviewCount || 0,
      reviewCount: newProduct.reviewCount || 0,
      stockQuantity: newProduct.stock,
      stockStatus: newProduct.stock > 10 ? 'in_stock' : newProduct.stock > 0 ? 'low_stock' : 'out_of_stock',
      specifications: {},
      features: [],
    };

    console.log('Product created successfully:', transformedProduct.id);
    return NextResponse.json({
      success: true,
      data: transformedProduct,
      product: transformedProduct,
      message: 'Product created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

// PUT - Update a product
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    console.log('PUT /api/admin/products called with body:', body);

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = await Product.findById(body.id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (body.name) product.name = body.name;
    if (body.description) product.description = body.description;
    if (body.price !== undefined) product.price = Number(body.price);
    if (body.discountPrice !== undefined) product.discountPrice = body.discountPrice ? Number(body.discountPrice) : undefined;
    if (body.category) {
      const category = await Category.findById(body.category);
      if (category) {
        product.category = body.category;
      }
    }
    if (body.brand !== undefined) product.brand = body.brand;
    if (body.stock !== undefined) product.stock = Number(body.stock);
    if (body.lowStockThreshold !== undefined) product.lowStockThreshold = body.lowStockThreshold;
    if (body.images) product.images = body.images;
    if (body.thumbnail !== undefined) product.thumbnail = body.thumbnail;
    if (body.sizes) product.sizes = body.sizes;
    if (body.colors) product.colors = body.colors;
    if (body.warranty !== undefined) product.warranty = body.warranty;
    if (body.tags) product.tags = body.tags;
    if (body.isFeatured !== undefined) product.isFeatured = body.isFeatured;
    if (body.isNew !== undefined) product.newArrival = body.isNew;
    if (body.isBestSeller !== undefined) product.isBestSeller = body.isBestSeller;
    if (body.status !== undefined) product.status = body.status;

    // Update slug if name changed
    if (body.name) {
      const newSlug = body.slug || await generateUniqueSlug(body.name, body.id);
      product.slug = newSlug;
    }

    await product.save();

    // Transform product to match frontend type expectations
    const category = await Category.findById(product.category);
    const transformedProduct = {
      ...product.toObject(),
      id: product._id.toString(),
      categoryId: product.category?.toString() || '',
      category: category?.name || '',
      reviews: product.reviewCount || 0,
      reviewCount: product.reviewCount || 0,
      stockQuantity: product.stock,
      stockStatus: product.stock > 10 ? 'in_stock' : product.stock > 0 ? 'low_stock' : 'out_of_stock',
      specifications: {},
      features: [],
    };

    console.log('Product updated successfully:', transformedProduct.id);
    return NextResponse.json({
      success: true,
      data: transformedProduct,
      product: transformedProduct,
      message: 'Product updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000 && error.keyPattern?.slug) {
      return NextResponse.json(
        { success: false, error: 'A product with this slug already exists. Please use a different name.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update category product count
    await Category.findByIdAndUpdate(product.category, {
      $inc: { productCount: -1 }
    });

    await Product.findByIdAndDelete(id);

    console.log('Product deleted successfully:', id);
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
