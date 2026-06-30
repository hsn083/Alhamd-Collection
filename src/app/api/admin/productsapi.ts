import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import mongoose from 'mongoose';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';

    const query: any = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .lean();

    const transformedProducts = products.map(product => ({
      ...product,
      id: product._id.toString(),
      categoryId: (product.category as any)?._id?.toString() || product.category?.toString() || '',
      category: (product.category as any)?.name || '',
      reviews: product.reviewCount || 0,
      stockQuantity: product.stock,
      stockStatus: product.stock > 10 ? 'in_stock' : product.stock > 0 ? 'low_stock' : 'out_of_stock',
    }));

    return NextResponse.json({
      success: true,
      data: transformedProducts,
      count: transformedProducts.length,
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success:false, error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();

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

    // Generate slug
    const slug = body.slug || generateSlug(body.name);

    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    if (body.sku) {
      const existingSku = await Product.findOne({ sku: body.sku });
      if (existingSku) {
        return NextResponse.json(
          { success: false, error: 'Product with this SKU already exists' },
          { status: 400 }
        );
      }
    }

    // Create new product
    const newProduct = await Product.create({
      name: body.name,
      slug,
      sku: body.sku,
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
      stockQuantity: newProduct.stock,
      stockStatus: newProduct.stock > 10 ? 'in_stock' : newProduct.stock > 0 ? 'low_stock' : 'out_of_stock',
    };

    return NextResponse.json({
      success: true,
      data: transformedProduct,
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

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();

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

    // Check if SKU already exists (excluding current product)
    if (body.sku && body.sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku: body.sku, _id: { $ne: body.id } });
      if (existingProduct) {
        return NextResponse.json(
          { success: false, error: 'Product with this SKU already exists' },
          { status: 400 }
        );
      }
    }

    // Check if slug already exists (excluding current product)
    if (body.name || body.slug) {
      const newSlug = body.slug || generateSlug(body.name);
      if (newSlug !== product.slug) {
        const existingSlug = await Product.findOne({ slug: newSlug, _id: { $ne: body.id } });
        if (existingSlug) {
          return NextResponse.json(
            { success: false, error: 'Product with this slug already exists' },
            { status: 400 }
          );
        }
      }
    }

    // Update product
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.slug) updateData.slug = body.slug;
    else if (body.name) updateData.slug = generateSlug(body.name);
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.description) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.discountPrice !== undefined) updateData.discountPrice = body.discountPrice ? Number(body.discountPrice) : null;
    if (body.category) updateData.category = body.category;
    if (body.brand !== undefined) updateData.brand = body.brand;
    if (body.stock !== undefined) updateData.stock = Number(body.stock);
    if (body.lowStockThreshold !== undefined) updateData.lowStockThreshold = Number(body.lowStockThreshold);
    if (body.images !== undefined) updateData.images = body.images;
    if (body.thumbnail !== undefined) updateData.thumbnail = body.thumbnail;
    if (body.sizes !== undefined) updateData.sizes = body.sizes;
    if (body.colors !== undefined) updateData.colors = body.colors;
    if (body.warranty !== undefined) updateData.warranty = body.warranty;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.newArrival !== undefined) updateData.newArrival = body.newArrival;
    if (body.isBestSeller !== undefined) updateData.isBestSeller = body.isBestSeller;
    if (body.status !== undefined) updateData.status = body.status;

    const updatedProduct = await Product.findByIdAndUpdate(
      body.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    // Update category product count if category changed
    if (body.category && body.category !== product.category.toString()) {
      await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });
      await Category.findByIdAndUpdate(body.category, { $inc: { productCount: 1 } });
    }

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: 'Failed to update product' },
        { status: 500 }
      );
    }

    const updatedProductObj = updatedProduct.toObject();
    const transformedProduct = {
      ...updatedProductObj,
      id: updatedProduct._id.toString(),
      categoryId: (updatedProductObj.category as any)?._id.toString() || updatedProductObj.category?.toString() || '',
      category: (updatedProductObj.category as any)?.name || '',
      reviews: updatedProductObj.reviewCount || 0,
      stockQuantity: updatedProductObj.stock,
      stockStatus: updatedProductObj.stock > 10 ? 'in_stock' : updatedProductObj.stock > 0 ? 'low_stock' : 'out_of_stock',
    };

    return NextResponse.json({
      success: true,
      data: transformedProduct,
      message: 'Product updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

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
    await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });

    // Delete product
    await Product.findByIdAndDelete(id);

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
