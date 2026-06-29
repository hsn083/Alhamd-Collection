import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Return from '@/models/Return';
import Order from '@/models/Order';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - List all return requests with filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // Build query
    const query: any = {};

    // Status filter
    if (status) {
      query.status = status;
    }

    // Search
    let returns;
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      returns = await Return.find({
        ...query,
        $or: [
          { returnNumber: searchRegex },
          { orderNumber: searchRegex },
          { customerName: searchRegex },
          { customerEmail: searchRegex },
        ],
      })
        .populate('order')
        .populate('customer')
        .sort({ createdAt: -1 });
    } else {
      returns = await Return.find(query)
        .populate('order')
        .populate('customer')
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({
      success: true,
      returns,
      total: returns.length,
    });
  } catch (error: any) {
    console.error('[ADMIN-RETURNS] Error fetching returns:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch returns' },
      { status: 500 }
    );
  }
}

// POST - Update return request status
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { returnId, action, data } = body;

    if (!returnId || !action) {
      return NextResponse.json(
        { success: false, error: 'Return ID and action are required' },
        { status: 400 }
      );
    }

    const returnRequest = await Return.findById(returnId);

    if (!returnRequest) {
      return NextResponse.json(
        { success: false, error: 'Return request not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'approve':
        returnRequest.status = 'approved';
        break;

      case 'reject':
        returnRequest.status = 'rejected';
        break;

      case 'process':
        returnRequest.status = 'processing';
        break;

      case 'complete':
        returnRequest.status = 'completed';
        break;

      case 'cancel':
        returnRequest.status = 'cancelled';
        break;

      case 'update':
        if (data.adminNotes) returnRequest.adminNotes = data.adminNotes;
        if (data.refundMethod) returnRequest.refundMethod = data.refundMethod;
        if (data.refundAmount !== undefined) returnRequest.refundAmount = data.refundAmount;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Add status history
    returnRequest.statusHistory.push({
      status: returnRequest.status,
      comment: data.note || `Return ${action}`,
      updatedAt: new Date(),
    });

    await returnRequest.save();

    return NextResponse.json({
      success: true,
      returnRequest,
      message: `Return ${action} successful`,
    });
  } catch (error: any) {
    console.error('[ADMIN-RETURNS] Error updating return:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update return' },
      { status: 500 }
    );
  }
}
