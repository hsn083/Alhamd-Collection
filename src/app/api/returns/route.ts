import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Return from '@/models/Return';
import Order from '@/models/Order';
import Notification from '@/models/Notification';
import { extractOrderNumber } from '@/lib/order-number';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Generate unique return number
function generateReturnNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RET-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { orderNumber, email, reason, description } = body;

    // Validate required fields
    if (!orderNumber || !email || !reason) {
      return NextResponse.json(
        { success: false, error: 'Order number, email, and reason are required' },
        { status: 400 }
      );
    }

    // Find the order - try numeric order number first, then displayOrderNumber
    let order;
    const numericOrderNumber = extractOrderNumber(orderNumber);
    if (numericOrderNumber !== null) {
      order = await Order.findOne({ orderNumber: numericOrderNumber });
    } else {
      order = await Order.findOne({ displayOrderNumber: orderNumber });
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify email matches order
    if (order.customerEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Email does not match order email' },
        { status: 400 }
      );
    }

    // Check if return already exists for this order
    const existingReturn = await Return.findOne({ order: order._id, status: { $ne: 'cancelled' } });
    if (existingReturn) {
      return NextResponse.json(
        { success: false, error: 'A return request already exists for this order' },
        { status: 400 }
      );
    }

    // Calculate refund amount (total order amount)
    const refundAmount = order.total;

    // Create return request
    const newReturn = await Return.create({
      returnNumber: generateReturnNumber(),
      order: order._id,
      orderNumber: order.displayOrderNumber,
      customer: order.customer,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      items: order.items.map((item: any) => ({
        productId: item.product,
        productName: item.name,
        productImage: item.image,
        quantity: item.quantity,
        price: item.price,
        reason: reason,
      })),
      reason,
      description,
      status: 'pending',
      refundMethod: 'original',
      refundAmount,
      statusHistory: [{
        status: 'pending',
        comment: 'Return request submitted',
        updatedAt: new Date(),
      }],
    });

    // Create admin notification
    try {
      await Notification.create({
  recipientType: 'admin',
  type: 'system',
  title: 'New Return Request',
  message: `Return request #${newReturn.returnNumber} for order ${order.displayOrderNumber}`,
  link: `/admin/returns/${newReturn._id}`,
});
    } catch (notifError) {
      console.error('Failed to create admin notification:', notifError);
    }

    console.log('[RETURNS] Return request created:', newReturn.returnNumber);

    return NextResponse.json({
      success: true,
      returnRequest: {
        id: newReturn._id.toString(),
        returnNumber: newReturn.returnNumber,
        orderNumber: newReturn.orderNumber,
        status: newReturn.status,
      },
      message: 'Return request submitted successfully',
    });
  } catch (error: any) {
    console.error('[RETURNS] Error creating return request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit return request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const returnId = searchParams.get('returnId');

    if (returnId) {
      const returnRequest = await Return.findById(returnId).populate('order').populate('customer');
      if (!returnRequest) {
        return NextResponse.json(
          { success: false, error: 'Return request not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, returnRequest });
    }

    if (customerId) {
      const returns = await Return.find({ customer: customerId })
        .populate('order')
        .sort({ createdAt: -1 });
      return NextResponse.json({ success: true, returns });
    }

    return NextResponse.json(
      { success: false, error: 'Customer ID or Return ID is required' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[RETURNS] Error fetching return requests:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch return requests' },
      { status: 500 }
    );
  }
}
