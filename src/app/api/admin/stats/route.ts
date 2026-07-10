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

    // Run all independent queries in parallel for better performance
    const [
      revenueResult,
      totalCustomers,
      totalProducts,
      totalCategories,
      activeCategories,
      inventoryResult,
      recentOrders,
      orderStatuses,
      paymentStatuses,
      topProductsResult,
      todayRevenueResult,
      weekRevenueResult,
      monthRevenueResult,
    ] = await Promise.all([
      // Calculate total revenue and orders
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
          },
        },
      ]),
      // Count total customers
      User.countDocuments({ 
        role: { $ne: 'admin' },
        isDeleted: { $ne: true }
      }),
      // Count total products
      Product.countDocuments(),
      // Count total categories
      Category.countDocuments(),
      // Count active categories
      Category.countDocuments({ status: 'active' }),
      // Calculate total inventory
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalInventory: { $sum: '$stock' },
          },
        },
      ]),
      // Calculate recent orders (last 7 days)
      Order.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      // Calculate order status breakdown
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      // Calculate payment status breakdown
      Order.aggregate([
        {
          $group: {
            _id: '$paymentStatus',
            count: { $sum: 1 },
          },
        },
      ]),
      // Calculate top selling products
      Order.aggregate([
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
      ]),
      // Today's revenue
      Order.aggregate([
        { $match: { createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
          },
        },
      ]),
      // Week's revenue
      Order.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
          },
        },
      ]),
      // Month's revenue
      Order.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const totalOrders = revenueResult[0]?.totalOrders || 0;
    const totalInventory = inventoryResult[0]?.totalInventory || 0;
    const todayRevenue = todayRevenueResult[0]?.totalRevenue || 0;
    const todayOrdersCount = todayRevenueResult[0]?.totalOrders || 0;
    const weekRevenue = weekRevenueResult[0]?.totalRevenue || 0;
    const weekOrdersCount = weekRevenueResult[0]?.totalOrders || 0;
    const monthRevenue = monthRevenueResult[0]?.totalRevenue || 0;
    const monthOrdersCount = monthRevenueResult[0]?.totalOrders || 0;

    const orderStatusMap = orderStatuses.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const paymentStatusMap = paymentStatuses.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Calculate recent orders for display (separate query to avoid slowing down main stats)
    const recentOrdersList = await Order.find()
      .select('orderNumber customer customerName total status createdAt items')
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
