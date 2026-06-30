import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import mongoose from 'mongoose';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Helper function to build base query - get all users except admins
    const buildBaseQuery = (additionalFilters: any = {}) => {
      return {
        role: { $ne: 'admin' },
        isDeleted: { $ne: true },
        ...additionalFilters,
      };
    };

    // Calculate statistics from Users collection
    const totalCustomers = await User.countDocuments(buildBaseQuery());
    const activeCustomers = await User.countDocuments(buildBaseQuery({ isBlocked: false }));
    const blockedCustomers = await User.countDocuments(buildBaseQuery({ isBlocked: true }));
    const verifiedCustomers = await User.countDocuments(buildBaseQuery({ isEmailVerified: true }));
    const unverifiedCustomers = await User.countDocuments(buildBaseQuery({ isEmailVerified: false }));

    // Calculate new customers today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newCustomersToday = await User.countDocuments(buildBaseQuery({ createdAt: { $gte: today } }));

    // Calculate new customers this month
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const newCustomersMonth = await User.countDocuments(buildBaseQuery({ createdAt: { $gte: monthAgo } }));

    // Also get unique customers from orders who might not be in Users collection
    const allOrders = await Order.find().select('customer customerEmail');
    const orderCustomerEmails = new Set();
    
    allOrders.forEach((order: any) => {
      if (order.customerEmail) {
        orderCustomerEmails.add(order.customerEmail.toLowerCase());
      }
    });

    // Get all user emails to avoid double counting
    const allUsers = await User.find(buildBaseQuery()).select('email');
    const userEmails = new Set(allUsers.map((u: any) => u.email.toLowerCase()));

    // Count unique order customers not in Users collection
    let guestCustomersCount = 0;
    orderCustomerEmails.forEach((email) => {
      if (!userEmails.has(email)) {
        guestCustomersCount++;
      }
    });

    // Add guest customers to total
    const totalUniqueCustomers = totalCustomers + guestCustomersCount;

    // Calculate customer spending from orders
    const orders = await Order.find();
    const customerSpending: { [customerId: string]: number } = {};
    const customerOrderCounts: { [customerId: string]: number } = {};

    orders.forEach((order) => {
      const customerId = order.customer?.toString();
      // Only process valid Mongo ObjectIds (ignore "guest", "", null, undefined)
      if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
        if (!customerSpending[customerId]) {
          customerSpending[customerId] = 0;
          customerOrderCounts[customerId] = 0;
        }
        customerSpending[customerId] += order.total || 0;
        customerOrderCounts[customerId]++;
      }
    });

    // Get all customers for top buyers and recent customers
    const allCustomers = await User.find(buildBaseQuery())
      .sort({ createdAt: -1 })
      .limit(50);

    // Get top buyers
    const topBuyers = allCustomers
      .map((customer) => ({
        ...customer.toObject(),
        id: customer._id.toString(),
        fullName: customer.name,
        emailVerified: customer.isEmailVerified,
        password: undefined,
        totalSpending: customerSpending[customer._id.toString()] || 0,
        totalOrders: customerOrderCounts[customer._id.toString()] || 0,
      }))
      .sort((a, b) => b.totalSpending - a.totalSpending)
      .slice(0, 10);

    // Get recent customers
    const recentCustomers = allCustomers
      .map((customer) => ({
        ...customer.toObject(),
        id: customer._id.toString(),
        fullName: customer.name,
        emailVerified: customer.isEmailVerified,
        password: undefined,
        totalOrders: customerOrderCounts[customer._id.toString()] || 0,
        totalSpending: customerSpending[customer._id.toString()] || 0,
      }))
      .slice(0, 5);

    // Calculate customers with orders - filter valid ObjectIds only
    const validCustomerIds = Object.keys(customerSpending).filter(id => 
      mongoose.Types.ObjectId.isValid(id)
    );
    const customersWithOrders = await User.countDocuments({
      role: 'customer',
      isDeleted: false,
      _id: { $in: validCustomerIds },
    });

    const customersWithoutOrders = totalUniqueCustomers - customersWithOrders;

    const statistics = {
      totalCustomers: totalUniqueCustomers,
      activeCustomers,
      blockedCustomers,
      verifiedCustomers,
      unverifiedCustomers,
      newCustomersToday,
      newCustomersMonth,
      customersWithOrders,
      customersWithoutOrders,
      topBuyers,
      recentCustomers,
    };

    return NextResponse.json({
      success: true,
      statistics,
    });
  } catch (error: any) {
    console.error('[CUSTOMERS-STATS] Error fetching statistics:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch customer statistics' },
      { status: 500 }
    );
  }
}
