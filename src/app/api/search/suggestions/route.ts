import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || !query.trim()) {
      return NextResponse.json({
        success: true,
        products: [],
        categories: [],
        brands: [],
      });
    }

    const searchTerm = query.trim();

    // Get matching products
    const products = await Product.find({
      status: 'active',
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ],
    })
      .populate('category', 'name slug')
      .populate('brand', 'name slug')
      .limit(5)
      .lean();

    // Get matching categories
    const categories = await Category.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ],
      status: 'active',
    })
      .limit(3)
      .lean();

    // Get unique brands from matching products
    const brands = await Product.aggregate([
      {
        $match: {
          status: 'active',
          brand: { $ne: null },
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
          ],
        },
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'brand',
          foreignField: '_id',
          as: 'brandInfo',
        },
      },
      {
        $unwind: '$brandInfo',
      },
      {
        $group: {
          _id: '$brand',
          name: { $first: '$brandInfo.name' },
          slug: { $first: '$brandInfo.slug' },
        },
      },
      {
        $limit: 3,
      },
    ]);

    // Count total matching products
    const totalProducts = await Product.countDocuments({
      status: 'active',
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ],
    });

    return NextResponse.json({
      success: true,
      products,
      categories,
      brands,
      totalProducts,
    });
  } catch (error: any) {
    console.error('Error getting search suggestions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get suggestions' },
      { status: 500 }
    );
  }
}
