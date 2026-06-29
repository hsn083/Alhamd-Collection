import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const stockHistoryPath = path.join(process.cwd(), 'data', 'stock-history.json');

function readStockHistory(): any[] {
  try {
    if (fs.existsSync(stockHistoryPath)) {
      const data = fs.readFileSync(stockHistoryPath, 'utf-8');
      return JSON.parse(data) || [];
    }
    return [];
  } catch (error) {
    console.error('Error reading stock history:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '50');

    let history = readStockHistory();

    // Filter by product ID if specified
    if (productId) {
      history = history.filter((h: any) => h.productId === productId);
    }

    // Limit results
    history = history.slice(0, limit);

    return NextResponse.json({
      success: true,
      history,
      total: history.length,
    });
  } catch (error: any) {
    console.error('Error fetching stock history:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch stock history' },
      { status: 500 }
    );
  }
}
