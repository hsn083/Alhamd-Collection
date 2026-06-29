import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Category from '@/models/Category';
import User from '@/models/User';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    console.log('[STATS] Fetching dashboard statistics at:', new Date().toISOString());

    // Calculate total revenue from orders
    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const totalOrders = revenueResult[0]?.totalOrders || 0;

    // Count total customers (exclude admins and deleted users)
    const totalCustomers = await User.countDocuments({ 
      role: { $ne: 'admin' },
      isDeleted: { $ne: true }
    });

    // Count total products
    const totalProducts = await Product.countDocuments();

    // Count total and active categories
    const totalCategories = await Category.countDocuments();
    const activeCategories = await Category.countDocuments({ status: 'active' });

    // Calculate total inventory
    const inventoryResult = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalInventory: { $sum: '$stock' },
        },
      },
    ]);
    const totalInventory = inventoryResult[0]?.totalInventory || 0;

    // Calculate recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Calculate order status breakdown
    const orderStatuses = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    const orderStatusMap = orderStatuses.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Calculate payment status breakdown
    const paymentStatuses = await Order.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
        },
      },
    ]);
    const paymentStatusMap = paymentStatuses.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Calculate top selling products
    const topProductsResult = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: {
            $sum: { $multiply: ['$items.quantity', '$items.price'] },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          sales: '$totalSold',
          revenue: '$totalRevenue',
        },
      },
    ]);

    // Calculate recent orders for display
    const recentOrdersList = await Order.find()
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentOrdersFormatted = recentOrdersList.map((order: any) => ({
      id: order._id,
      orderNumber: order.orderNumber,
      customer: order.customer?.name || order.customerName || 'Unknown',
      total: `PKR ${(order.total || 0).toLocaleString()}`,
      status: order.status,
      date: new Date(order.createdAt).toISOString().split('T')[0],
      items: order.items?.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
      })) || [],
    }));

    // Calculate analytics data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRevenueResult = await Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);
    const todayRevenue = todayRevenueResult[0]?.totalRevenue || 0;
    const todayOrdersCount = todayRevenueResult[0]?.totalOrders || 0;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekRevenueResult = await Order.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);
    const weekRevenue = weekRevenueResult[0]?.totalRevenue || 0;
    const weekOrdersCount = weekRevenueResult[0]?.totalOrders || 0;

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthRevenueResult = await Order.aggregate([
      { $match: { createdAt: { $gte: monthAgo } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);
    const monthRevenue = monthRevenueResult[0]?.totalRevenue || 0;
    const monthOrdersCount = monthRevenueResult[0]?.totalOrders || 0;

    const statistics = {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      totalCategories,
      activeCategories,
      totalInventory,
      ordersByStatus: orderStatusMap,
      paymentStatuses: paymentStatusMap,
      topProducts: topProductsResult,
      recentOrders: recentOrdersFormatted,
      analytics: {
        todayRevenue,
        todayOrders: todayOrdersCount,
        weekRevenue,
        weekOrders: weekOrdersCount,
        monthRevenue,
        monthOrders: monthOrdersCount,
      },
    };

    console.log('[STATS] Statistics calculated successfully');
    return NextResponse.json({
      success: true,
      statistics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[STATS] Error fetching statistics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch statistics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
