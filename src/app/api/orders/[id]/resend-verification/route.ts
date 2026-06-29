import { NextRequest, NextResponse } from 'next/server';
import { sendOrderVerificationEmail } from '@/lib/email';
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

// Generate unique verification token
function generateVerificationToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orders = readOrders();
    const orderIndex = orders.findIndex((o: any) => o.id === params.id);

    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orders[orderIndex];

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Update order with new token
    order.verificationToken = verificationToken;
    order.verificationExpires = verificationExpires;
    order.updatedAt = new Date().toISOString();

    orders[orderIndex] = order;
    writeOrders(orders);

    // Send verification email
    if (order.user?.email) {
      const emailSent = await sendOrderVerificationEmail(
        order.user.email,
        order.user.name || 'Customer',
        order.id,
        verificationToken
      );

      if (!emailSent) {
        return NextResponse.json(
          { success: false, error: 'Failed to send verification email' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email resent successfully',
    });
  } catch (error) {
    console.error('Error resending verification email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
