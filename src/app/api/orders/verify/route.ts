import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email';
import fs from 'fs';
import path from 'path';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');

function readOrders() {
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

function writeOrders(orders: any[]) {
  try {
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing orders:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 400 }
      );
    }

    const orders = readOrders();
    const orderIndex = orders.findIndex((o: any) => o.verificationToken === token);

    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification token' },
        { status: 404 }
      );
    }

    const order = orders[orderIndex];

    // Check if already verified
    if (order.verified) {
      return NextResponse.json({
        success: true,
        message: 'Order already verified',
        orderId: order.id,
      });
    }

    // Check if token expired
    if (order.verificationExpires && new Date(order.verificationExpires) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Token expired' },
        { status: 400 }
      );
    }

    // Verify the order
    order.verified = true;
    order.status = 'confirmed';
    order.verificationToken = null;
    order.verificationExpires = null;
    order.updatedAt = new Date().toISOString();

    orders[orderIndex] = order;
    writeOrders(orders);

    // Send confirmation email
    if (order.user?.email) {
      await sendOrderConfirmationEmail(
        order.user.email,
        order.user.name || 'Customer',
        order.id,
        order
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order verified successfully',
      orderId: order.id,
    });
  } catch (error) {
    console.error('Error verifying order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify order' },
      { status: 500 }
    );
  }
}
