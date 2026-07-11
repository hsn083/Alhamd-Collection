import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { fuzzySearchProducts, fuzzySearchCategories, fuzzySearchBrands } from '@/lib/fuzzy-search';

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

    // Get all active products for fuzzy search
    const allProducts = await Product.find({ status: 'active' })
      .populate('category', 'name slug')
      .lean();

    // Get all active categories for fuzzy search
    const allCategories = await Category.find({ status: 'active' }).lean();

    // Use fuzzy search for products with type casting
    const products = fuzzySearchProducts(allProducts as any, searchTerm, 5);

    // Use fuzzy search for categories with type casting
    const categories = fuzzySearchCategories(allCategories as any, searchTerm, 3);

    // Use fuzzy search for brands with type casting
    const brands = fuzzySearchBrands(allProducts as any, searchTerm, 3);

    // Count total matching products using fuzzy search
    const totalProducts = fuzzySearchProducts(allProducts as any, searchTerm, 1000).length;

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
