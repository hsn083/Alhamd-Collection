import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const product = await Product.findById(params.id).populate('category');
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get related products from same category
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      status: 'active',
    })
      .populate('category', 'name slug')
      .limit(8)
      .lean();

    // Get frequently bought together (same price range + category)
    const priceRange = 0.3; // 30% price range
    const minPrice = product.price * (1 - priceRange);
    const maxPrice = product.price * (1 + priceRange);

    const frequentlyBoughtTogether = await Product.find({
      _id: { $ne: product._id },
      status: 'active',
      price: { $gte: minPrice, $lte: maxPrice },
    })
      .populate('category', 'name slug')
      .limit(4)
      .lean();

    // Get similar products (based on tags and brand)
    const similarProducts = await Product.find({
      _id: { $ne: product._id },
      status: 'active',
      $or: [
        { brand: product.brand },
        { tags: { $in: product.tags || [] } },
      ],
    })
      .populate('category', 'name slug')
      .limit(6)
      .lean();

    return NextResponse.json({
      success: true,
      related: relatedProducts,
      frequentlyBoughtTogether: frequentlyBoughtTogether,
      similar: similarProducts,
    });
  } catch (error: any) {
    console.error('Error getting product recommendations:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
