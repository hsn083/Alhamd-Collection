import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';

// Helper function to find customer by ID (handles both ObjectId and customerId)
async function findCustomerById(id: string) {
  await connectDB();
  
  // Try to find by MongoDB ObjectId first
  try {
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      const customer = await User.findById(id);
      if (customer) return customer;
    }
  } catch (error) {
    // Not a valid ObjectId, continue to customerId lookup
  }
  
  // Try to find by customerId field
  const customer = await User.findOne({ customerId: id });
  if (customer) return customer;
  
  // Try to find by email (for guest customers)
  const customerByEmail = await User.findOne({ email: id });
  if (customerByEmail) return customerByEmail;
  
  return null;
}

// GET - Get single customer with details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;
    const customer = await findCustomerById(customerId);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get customer orders
    const orders = await Order.find({ customer: customer._id }).sort({ createdAt: -1 });

    // Calculate total spending
    const totalSpending = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);

    // Return customer without password
    const customerObj = customer.toObject();
    const { password, ...customerWithoutPassword } = customerObj;

    return NextResponse.json({
      success: true,
      customer: {
        ...customerWithoutPassword,
        id: customer._id.toString(),
        customerId: customer.customerId,
        fullName: customer.name,
        emailVerified: customer.isEmailVerified,
        joinedDate: customer.createdAt,
        totalOrders: orders.length,
        totalSpending,
        orders,
      },
    });
  } catch (error: any) {
    console.error('[CUSTOMER] Error fetching customer:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PATCH - Update customer (for verification, blocking, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;
    const body = await request.json();
    const { action } = body;

    const customer = await findCustomerById(customerId);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'verify':
        customer.isEmailVerified = true;
        break;
      case 'revoke-verification':
        customer.isEmailVerified = false;
        break;
      case 'block':
        customer.isBlocked = true;
        break;
      case 'unblock':
        customer.isBlocked = false;
        break;
      case 'delete':
        customer.isDeleted = true;
        customer.deletedAt = new Date();
        break;
      case 'restore':
        customer.isDeleted = false;
        customer.deletedAt = undefined;
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    await customer.save();

    return NextResponse.json({
      success: true,
      customer: {
        id: customer._id.toString(),
        fullName: customer.name,
        emailVerified: customer.isEmailVerified,
        isBlocked: customer.isBlocked,
        isDeleted: customer.isDeleted,
      },
      message: `Customer ${action} successful`,
    });
  } catch (error: any) {
    console.error('[CUSTOMER] Error updating customer:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;
