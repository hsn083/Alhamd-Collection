import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { fuzzySearchProducts } from '@/lib/fuzzy-search';

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

    // Get all active products for fuzzy search
    let products = await Product.find({ status: 'active' })
      .populate('category', 'name slug')
      .lean();

    // Apply category filter if specified
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        products = products.filter(p => 
          p.category && p.category._id.toString() === categoryDoc._id.toString()
        );
      }
    }

    // Apply price range filter
    if (minPrice || maxPrice) {
      products = products.filter(p => {
        const price = p.discountPrice || p.price;
        if (minPrice && price < parseFloat(minPrice)) return false;
        if (maxPrice && price > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    // Apply rating filter
    if (minRating) {
      products = products.filter(p => p.rating >= parseFloat(minRating));
    }

    // Use fuzzy search with type casting
    const fuzzyResults = fuzzySearchProducts(products as any, searchTerm, 1000);

    // Sort results
    let sortedProducts = [...fuzzyResults];
    switch (sortBy) {
      case 'price_low':
        sortedProducts.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price_high':
        sortedProducts.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'rating':
        sortedProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        sortedProducts.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'popular':
        sortedProducts.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        // Relevance is already handled by fuzzy search
        break;
    }

    const total = sortedProducts.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginatedProducts = sortedProducts.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      products: paginatedProducts,
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
