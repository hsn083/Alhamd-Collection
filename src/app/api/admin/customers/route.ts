import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - List all customers with filters and search
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const verified = searchParams.get('verified') || '';
    const hasOrders = searchParams.get('hasOrders') || '';

    // Build query - get all users except admins, include users without role
    const query: any = {
      role: { $ne: 'admin' },
      isDeleted: { $ne: true }
    };

    // Status filter
    if (status === 'blocked') {
      query.isBlocked = true;
    } else if (status === 'active') {
      query.isBlocked = false;
    }

    // Verified filter
    if (verified === 'verified') {
      query.isEmailVerified = true;
    } else if (verified === 'unverified') {
      query.isEmailVerified = false;
    }

    // Search
    let customers;
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      customers = await User.find({
        ...query,
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
        ],
      }).sort({ createdAt: -1 });
    } else {
      customers = await User.find(query).sort({ createdAt: -1 });
    }

    // Calculate customer stats from orders
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({ customer: customer._id });
        const totalOrders = orders.length;
        const totalSpending = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
        
        // Ensure createdAt has a value with fallback to ObjectId timestamp
        let createdAt = customer.createdAt;
        if (!createdAt) {
          createdAt = customer._id.getTimestamp();
        }
        
        return {
          ...customer.toObject(),
          id: customer._id.toString(),
          customerId: customer.customerId,
          fullName: customer.name,
          emailVerified: customer.isEmailVerified,
          password: undefined,
          totalOrders,
          totalSpending,
          createdAt: createdAt,
          joinedDate: createdAt,
          isBlocked: customer.isBlocked || false,
          isDeleted: customer.isDeleted || false,
        };
      })
    );

    // Also get unique customers from orders who might not be in Users collection
    const allOrders = await Order.find().select('customer customerName customerEmail customerPhone');
    const orderCustomersMap = new Map();
    
    allOrders.forEach((order: any) => {
      if (order.customerEmail && !orderCustomersMap.has(order.customerEmail.toLowerCase())) {
        // Ensure createdAt has a value with fallback to ObjectId timestamp
        let createdAt = order.createdAt;
        if (!createdAt) {
          createdAt = order._id.getTimestamp();
        }
        
        orderCustomersMap.set(order.customerEmail.toLowerCase(), {
          id: order.customer?.toString() || `guest-${order.customerEmail}`,
          fullName: order.customerName || order.customerEmail.split('@')[0],
          email: order.customerEmail,
          phone: order.customerPhone,
          role: 'customer',
          emailVerified: true,
          createdAt: createdAt,
          joinedDate: createdAt,
          totalOrders: 0,
          totalSpending: 0,
          isBlocked: false,
          isDeleted: false,
          isGuest: true, // Mark as guest customer
        });
      }
    });

    // Merge users from Users collection with order customers
    const mergedCustomers = [...customersWithStats];
    const existingEmails = new Set(customersWithStats.map((c: any) => c.email.toLowerCase()));
    
    orderCustomersMap.forEach((orderCustomer, email) => {
      if (!existingEmails.has(email)) {
        // Calculate orders for this guest customer
        const guestOrders = allOrders.filter((o: any) => o.customerEmail?.toLowerCase() === email);
        orderCustomer.totalOrders = guestOrders.length;
        orderCustomer.totalSpending = guestOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
        mergedCustomers.push(orderCustomer);
      }
    });

    // Has orders filter
    let filteredCustomers = mergedCustomers;
    if (hasOrders === 'yes') {
      filteredCustomers = filteredCustomers.filter((c: any) => c.totalOrders > 0);
    } else if (hasOrders === 'no') {
      filteredCustomers = filteredCustomers.filter((c: any) => c.totalOrders === 0);
    }

    // Calculate statistics from the merged customers
    const totalCustomers = mergedCustomers.length;
    const activeCustomers = mergedCustomers.filter((c: any) => !c.isBlocked && !c.isDeleted).length;
    const blockedCustomers = mergedCustomers.filter((c: any) => c.isBlocked).length;
    
    // Calculate new customers today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newToday = mergedCustomers.filter((c: any) => {
      const createdAt = new Date(c.createdAt);
      return createdAt >= today;
    }).length;

    return NextResponse.json({
      success: true,
      customers: filteredCustomers,
      total: filteredCustomers.length,
      stats: {
        totalCustomers,
        activeCustomers,
        blockedCustomers,
        newToday,
      },
    });
  } catch (error: any) {
    console.error('[CUSTOMERS] Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST - Update customer (block, unblock, verify, etc.)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { customerId, action, data } = body;

    console.log('[CUSTOMER_POST] Request received:', { customerId, action });

    if (!customerId || !action) {
      return NextResponse.json(
        { success: false, error: 'Customer ID and action are required' },
        { status: 400 }
      );
    }

    // Check if this is a guest customer (guest customers cannot be blocked/deleted)
    if (customerId.startsWith('guest-')) {
      console.log('[CUSTOMER_POST] Guest customer detected, cannot modify');
      return NextResponse.json(
        { success: false, error: 'Guest customers cannot be modified. They do not have an account.' },
        { status: 400 }
      );
    }

    // Find customer by either _id or customerId
    let customer = null;
    let lookupMethod = '';
    
    // Check if it's a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(customerId)) {
      console.log('[CUSTOMER_POST] ID is valid ObjectId, trying findById');
      customer = await User.findById(customerId);
      lookupMethod = 'ObjectId';
    }
    
    // If not found by ObjectId, try by customerId field
    if (!customer) {
      console.log('[CUSTOMER_POST] Not found by ObjectId, trying customerId field');
      customer = await User.findOne({ customerId: customerId });
      lookupMethod = 'customerId';
    }
    
    // If still not found, try by email
    if (!customer) {
      console.log('[CUSTOMER_POST] Not found by customerId, trying email');
      customer = await User.findOne({ email: customerId });
      lookupMethod = 'email';
    }

    if (!customer) {
      console.log('[CUSTOMER_POST] Customer NOT found with ID:', customerId);
      return NextResponse.json(
        { success: false, error: 'Customer not found in database' },
        { status: 404 }
      );
    }

    console.log('[CUSTOMER_POST] Customer found using method:', lookupMethod, 'MongoDB _id:', customer._id.toString());

    switch (action) {
      case 'block':
        customer.isBlocked = true;
        break;

      case 'unblock':
        customer.isBlocked = false;
        break;

      case 'verify':
        customer.isEmailVerified = true;
        break;

      case 'unverify':
        customer.isEmailVerified = false;
        break;

      case 'update':
        if (data.name) customer.name = data.name;
        if (data.email) customer.email = data.email;
        if (data.phone) customer.phone = data.phone;
        break;

      case 'resetPassword':
        if (!data.newPassword) {
          return NextResponse.json(
            { success: false, error: 'New password is required' },
            { status: 400 }
          );
        }
        customer.password = await bcrypt.hash(data.newPassword, 10);
        break;

      case 'softDelete':
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

    // Return customer without password
    const customerObj = customer.toObject();
    const { password, ...customerWithoutPassword } = customerObj;

    return NextResponse.json({
      success: true,
      customer: {
        ...customerWithoutPassword,
        id: customer._id.toString(),
        fullName: customer.name,
        emailVerified: customer.isEmailVerified,
      },
      message: `Customer ${action} successful`,
    });
  } catch (error: any) {
    console.error('[CUSTOMERS] Error updating customer:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE - Permanently delete customer
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('[CUSTOMER_DELETE] Request received with ID:', id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Check if this is a guest customer (guest customers cannot be blocked/deleted)
    if (id.startsWith('guest-')) {
      console.log('[CUSTOMER_DELETE] Guest customer detected, cannot delete');
      return NextResponse.json(
        { success: false, error: 'Guest customers cannot be deleted. They do not have an account.' },
        { status: 400 }
      );
    }

    // Find customer by either _id or customerId
    let customer = null;
    let lookupMethod = '';
    
    // Check if it's a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      console.log('[CUSTOMER_DELETE] ID is valid ObjectId, trying findById');
      customer = await User.findById(id);
      lookupMethod = 'ObjectId';
    }
    
    // If not found by ObjectId, try by customerId field
    if (!customer) {
      console.log('[CUSTOMER_DELETE] Not found by ObjectId, trying customerId field');
      customer = await User.findOne({ customerId: id });
      lookupMethod = 'customerId';
    }
    
    // If still not found, try by email
    if (!customer) {
      console.log('[CUSTOMER_DELETE] Not found by customerId, trying email');
      customer = await User.findOne({ email: id });
      lookupMethod = 'email';
    }

    if (!customer) {
      console.log('[CUSTOMER_DELETE] Customer NOT found with ID:', id);
      return NextResponse.json(
        { success: false, error: 'Customer not found in database' },
        { status: 404 }
      );
    }

    console.log('[CUSTOMER_DELETE] Customer found using method:', lookupMethod, 'MongoDB _id:', customer._id.toString());

    await User.deleteOne({ _id: customer._id });
    console.log('[CUSTOMER_DELETE] Customer deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error: any) {
    console.error('[CUSTOMERS] Error deleting customer:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
