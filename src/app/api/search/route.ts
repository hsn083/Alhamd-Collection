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
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('minRating');
    const sortBy = searchParams.get('sort') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || !query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }

    const searchTerm = query.trim();
    const skip = (page - 1) * limit;

    // Build MongoDB query
    const queryObj: any = {
      status: 'active',
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { sku: { $regex: searchTerm, $options: 'i' } },
      ],
    };

    // Apply category filter if specified
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        queryObj.category = categoryDoc._id;
      }
    }

    // Apply price range filter
    if (minPrice || maxPrice) {
      queryObj.$and = queryObj.$and || [];
      const priceFilter: any = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      queryObj.$and.push({ price: priceFilter });
    }

    // Apply rating filter
    if (minRating) {
      queryObj.rating = { $gte: parseFloat(minRating) };
    }

    // Build sort options
    let sortObj: any = {};
    switch (sortBy) {
      case 'price_low':
        sortObj = { price: 1 };
        break;
      case 'price_high':
        sortObj = { price: -1 };
        break;
      case 'rating':
        sortObj = { rating: -1 };
        break;
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'popular':
        sortObj = { reviewCount: -1 };
        break;
      default:
        // Relevance: use text score if available, otherwise sort by name match
        sortObj = { name: 1 };
    }

    // Execute query with pagination
    const [products, total] = await Promise.all([
      Product.find(queryObj)
        .populate('category', 'name slug')
        .populate('brand', 'name slug')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(queryObj),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        category,
        minPrice,
        maxPrice,
        minRating,
        sortBy,
      },
    });
  } catch (error: any) {
    console.error('Error searching products:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to search products' },
      { status: 500 }
    );
  }
}
