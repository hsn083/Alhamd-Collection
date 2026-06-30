import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Helper function to delete image files from Cloudinary
async function deleteImageFiles(imageUrls: string[]): Promise<void> {
  for (const imageUrl of imageUrls) {
    try {
      // Extract public_id from Cloudinary URL
      const publicId = extractPublicIdFromUrl(imageUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
        console.log('Deleted image from Cloudinary:', publicId);
      }
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', imageUrl, error);
    }
  }
}

// Extract public_id from Cloudinary URL
function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.ext
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // Find the index of 'upload' or 'image/upload'
    const uploadIndex = pathParts.findIndex(part => part === 'upload' || part === 'image');
    if (uploadIndex !== -1 && uploadIndex < pathParts.length - 1) {
      // Everything after 'upload' is the folder/public_id
      const publicIdWithVersion = pathParts.slice(uploadIndex + 1).join('/');
      // Remove version number if present (starts with v followed by digits)
      const publicId = publicIdWithVersion.replace(/^v\d+\//, '');
      // Remove file extension
      return publicId.replace(/\.[^/.]+$/, '');
    }
  } catch (error) {
    console.error('Error extracting public_id from URL:', url, error);
  }
  return null;
}

// GET - Fetch a single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const product = await Product.findById(params.id).populate('category', 'name slug');

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Transform product to match frontend type expectations
    const productObj = product.toObject();
    const transformedProduct = {
      ...productObj,
      id: product._id.toString(),
      categoryId: (productObj.category as any)?._id?.toString() || productObj.category?.toString() || '',
      category: (productObj.category as any)?.name || '',
      reviews: productObj.reviewCount || 0,
      reviewCount: productObj.reviewCount || 0,
      stockQuantity: productObj.stock,
      stockStatus: productObj.stock > 10 ? 'in_stock' : productObj.stock > 0 ? 'low_stock' : 'out_of_stock',
      specifications: {},
      features: [],
    };

    return NextResponse.json({
      success: true,
      product: transformedProduct
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT - Update a product by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if SKU already exists (excluding current product)
    if (body.sku && body.sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku: body.sku, _id: { $ne: params.id } });
      if (existingProduct) {
        return NextResponse.json(
          { success: false, error: 'Product with this SKU already exists' },
          { status: 400 }
        );
      }
    }

    // Check if slug already exists (excluding current product)
    if (body.name || body.slug) {
      const newSlug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (newSlug !== product.slug) {
        const existingSlug = await Product.findOne({ slug: newSlug, _id: { $ne: params.id } });
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
    else if (body.name) updateData.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
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
    if (body.isNew !== undefined) updateData.isNew = body.isNew;
    if (body.isBestSeller !== undefined) updateData.isBestSeller = body.isBestSeller;
    if (body.status !== undefined) updateData.status = body.status;

    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    // Update category product count if category changed
    if (body.category && body.category !== product.category.toString()) {
      await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });
      await Category.findByIdAndUpdate(body.category, { $inc: { productCount: 1 } });
    }

    // Transform product to match frontend type expectations
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
      categoryId: (updatedProductObj.category as any)?._id?.toString() || updatedProductObj.category?.toString() || '',
      category: (updatedProductObj.category as any)?.name || '',
      reviews: updatedProductObj.reviewCount || 0,
      reviewCount: updatedProductObj.reviewCount || 0,
      stockQuantity: updatedProductObj.stock,
      stockStatus: updatedProductObj.stock > 10 ? 'in_stock' : updatedProductObj.stock > 0 ? 'low_stock' : 'out_of_stock',
      specifications: {},
      features: [],
    };

    return NextResponse.json({
      success: true,
      data: transformedProduct,
      product: transformedProduct,
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

// DELETE - Delete a product by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete associated image files
    if (product.images && product.images.length > 0) {
      await deleteImageFiles(product.images);
    }

    // Update category product count
    await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });

    // Delete product
    await Product.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
