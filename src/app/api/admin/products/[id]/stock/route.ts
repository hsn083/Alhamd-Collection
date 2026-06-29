import { NextRequest, NextResponse } from 'next/server';
import { updateProductStock } from '@/lib/stock-helpers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { quantity, changeType, reason, performedBy } = body;

    if (quantity === undefined || quantity === null || quantity < 0) {
      return NextResponse.json(
        { success: false, error: 'Valid quantity is required' },
        { status: 400 }
      );
    }

    if (!changeType || !['in', 'out', 'adjustment', 'sale', 'return'].includes(changeType)) {
      return NextResponse.json(
        { success: false, error: 'Valid change type is required (in, out, adjustment, sale, return)' },
        { status: 400 }
      );
    }

    if (!reason) {
      return NextResponse.json(
        { success: false, error: 'Reason is required' },
        { status: 400 }
      );
    }

    const result = await updateProductStock(
      params.id,
      quantity,
      changeType,
      reason,
      performedBy
    );

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Stock updated successfully' });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error updating product stock:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update stock' },
      { status: 500 }
    );
  }
}
