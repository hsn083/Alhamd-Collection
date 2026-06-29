import { NextRequest, NextResponse } from 'next/server';
import { getLowStockProducts, getStockSummary } from '@/lib/stock-helpers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let products = await getLowStockProducts();

    // Filter by category
    if (category) {
      products = products.filter((p: any) => p.category?.toString() === category);
    }

    // Filter by status
    if (status) {
      products = products.filter((p: any) => p.stockStatus === status);
    }

    // Search by name or SKU
    if (search) {
      const searchTerm = search.toLowerCase();
      products = products.filter((p: any) =>
        p.name?.toLowerCase().includes(searchTerm) ||
        p.sku?.toLowerCase().includes(searchTerm)
      );
    }

    // Get summary stats from database
    const summary = await getStockSummary();

    return NextResponse.json({
      success: true,
      products,
      summary,
    });
  } catch (error: any) {
    console.error('Error fetching low stock products:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch low stock products' },
      { status: 500 }
    );
  }
}
