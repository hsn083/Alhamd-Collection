import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');

function readOrders(): any[] {
  try {
    if (fs.existsSync(ordersFilePath)) {
      const data = fs.readFileSync(ordersFilePath, 'utf-8');
      return JSON.parse(data) || [];
    }
    return [];
  } catch (error) {
    console.error('Error reading orders:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, email, phone } = body;

    // Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Phone number is now required for verification
    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required for verification' },
        { status: 400 }
      );
    }

    const orders = readOrders();
    const order = orders.find((o: any) => o.id === orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Security validation: Verify order ownership via phone number
    const orderPhone = order.address?.phone?.replace(/[^0-9]/g, '');
    const providedPhone = phone?.replace(/[^0-9]/g, '');

    // Normalize and compare phone numbers
    const phoneMatch = orderPhone === providedPhone;

    if (!phoneMatch) {
      return NextResponse.json(
        { success: false, error: 'Phone number does not match this order.' },
        { status: 403 }
      );
    }

    // Return order data for tracking
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        statusHistory: order.statusHistory || [],
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        lastUpdated: order.lastUpdated,
        shipping: {
          courier: order.shipping?.courier,
          trackingNumber: order.shipping?.trackingNumber,
          estimatedDelivery: order.shipping?.estimatedDelivery,
          deliveryNotes: order.shipping?.deliveryNotes,
          method: order.shipping?.method,
        },
        items: order.items?.map((item: any) => ({
          product: {
            name: item.product?.name,
            brand: item.product?.brand,
            images: item.product?.images,
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
          fullName: order.address?.fullName,
          city: order.address?.city,
          province: order.address?.province,
        },
      },
    });
  } catch (error: any) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to track order' },
      { status: 500 }
    );
  }
}
