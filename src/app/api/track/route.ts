import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import { normalizePhoneNumber, isPhoneNumber, isEmail, isObjectId } from '@/lib/utils';
import { extractOrderNumber } from '@/lib/order-number';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { orderId, email, phone } = body;

    console.log('[TRACKING] Order lookup request:', { 
      orderId, 
      email, 
      phone: phone ? '***' : 'not provided' 
    });

    // Validate that at least one search parameter is provided
    if (!orderId && !email && !phone) {
      console.log('[TRACKING] Validation failed: At least one search parameter is required');
      return NextResponse.json(
        { success: false, error: 'Please provide Order ID, Email, or Phone Number' },
        { status: 400 }
      );
    }

    // Normalize search values
    const normalizedSearch = (orderId || email || phone || '').trim();
    const normalizedPhone = phone ? normalizePhoneNumber(phone) : '';
    
    console.log('[TRACKING] Normalized search value:', normalizedSearch);
    console.log('[TRACKING] Normalized phone:', normalizedPhone ? '***' : 'not provided');

    // Auto-detect input type and build query
    const query: any = {};
    let searchType = '';
    
    // Priority 1: Check if it's a numeric order number (e.g., 100001 or Order# (100001))
    const extractedOrderNumber = extractOrderNumber(normalizedSearch);
    if (extractedOrderNumber !== null) {
      query.orderNumber = extractedOrderNumber;
      searchType = 'orderNumber';
      console.log('[TRACKING] Detected Numeric Order Number:', extractedOrderNumber);
    }
    // Priority 2: Check if it's a MongoDB ObjectId
    else if (isObjectId(normalizedSearch)) {
      query._id = normalizedSearch;
      searchType = 'objectId';
      console.log('[TRACKING] Detected MongoDB ObjectId');
    }
    // Priority 3: Check if it's a phone number
    else if (isPhoneNumber(normalizedSearch)) {
      const normalizedSearchPhone = normalizePhoneNumber(normalizedSearch);
      // Search by normalized phone number (new field) with fallback to original field
      query.$or = [
        { customerPhoneNormalized: normalizedSearchPhone },
        { customerPhone: normalizedSearchPhone },
        { 'shippingAddress.phone': normalizedSearchPhone },
      ];
      searchType = 'phoneNumber';
      console.log('[TRACKING] Detected Phone Number');
    }
    // Priority 4: Check if it's an email
    else if (isEmail(normalizedSearch)) {
      query.customerEmail = normalizedSearch.toLowerCase();
      searchType = 'email';
      console.log('[TRACKING] Detected Email');
    }
    // Priority 5: Fallback - search multiple fields
    else {
      const upperSearch = normalizedSearch.toUpperCase();
      query.$or = [
        { displayOrderNumber: upperSearch },
        { trackingNumber: upperSearch },
        { paymentId: upperSearch },
      ];
      searchType = 'fallback';
      console.log('[TRACKING] Using fallback search');
    }

    console.log('[TRACKING] Search type:', searchType);
    console.log('[TRACKING] Executing query:', JSON.stringify(query));
    
    // Find order in MongoDB
    const order = await Order.findOne(query);

    if (!order) {
      console.log('[TRACKING] Order not found in database');
      return NextResponse.json(
        { success: false, error: 'Order not found. Please check your information and try again.' },
        { status: 404 }
      );
    }

    console.log('[TRACKING] Order found:', order.displayOrderNumber);

    // Security validation: If phone was provided, verify it matches the order
    if (phone) {
      const orderPhoneNormalized = order.customerPhoneNormalized || normalizePhoneNumber(order.customerPhone);
      const providedPhoneNormalized = normalizedPhone;

      console.log('[TRACKING] Phone validation:', { 
        orderPhone: orderPhoneNormalized ? '***' : 'missing', 
        providedPhone: providedPhoneNormalized ? '***' : 'missing',
        match: orderPhoneNormalized === providedPhoneNormalized 
      });

      if (orderPhoneNormalized && orderPhoneNormalized !== providedPhoneNormalized) {
        console.log('[TRACKING] Phone validation failed');
        return NextResponse.json(
          { success: false, error: 'Phone number does not match this order. Please check and try again.' },
          { status: 403 }
        );
      }
    }

    // Get payment information
    const payment = await Payment.findOne({ order: order._id });

    // Return order data for tracking
    console.log('[TRACKING] Returning order data successfully');
    return NextResponse.json({
      success: true,
      order: {
        id: order.displayOrderNumber,
        _id: order._id.toString(),
        status: order.status,
        statusHistory: order.statusHistory || [],
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        shipping: {
          courier: 'TCS Courier',
          trackingNumber: order.trackingNumber,
          estimatedDelivery: null,
          deliveryNotes: order.notes,
          method: 'standard',
        },
        items: order.items?.map((item: any) => ({
          product: {
            name: item.name,
            brand: 'AlhamdCollection',
            images: item.image ? [item.image] : [],
          },
          quantity: item.quantity,
          price: item.price,
        })),
        total: order.total,
        subtotal: order.subtotal,
        discount: order.discount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        address: {
          fullName: order.customerName,
          city: order.shippingAddress?.city,
          province: order.shippingAddress?.state,
          phone: order.shippingAddress?.phone,
        },
      },
    });
  } catch (error: any) {
    console.error('[TRACKING] Error tracking order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to track order. Please try again later.' },
      { status: 500 }
    );
  }
}
