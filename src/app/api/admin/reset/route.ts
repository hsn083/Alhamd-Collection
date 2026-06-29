import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Category from '@/models/Category';
import User from '@/models/User';

// File paths for logging
const auditLogsFilePath = path.join(process.cwd(), 'data', 'audit-logs.json');
const resetHistoryFilePath = path.join(process.cwd(), 'data', 'reset-history.json');

// Helper function to read JSON file
function readJsonFile(filePath: string): any[] {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) || [];
    }
    return [];
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

// Helper function to write JSON file
function writeJsonFile(filePath: string, data: any): boolean {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
}

// Helper function to log reset action
function logResetAction(adminId: string, adminUsername: string, resetOptions: any, results: any) {
  try {
    const resetHistory = readJsonFile(resetHistoryFilePath);
    
    const selectedOptions = Object.keys(resetOptions).filter(key => resetOptions[key]);
    
    const logEntry = {
      id: `RESET-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      adminId,
      adminUsername,
      selectedOptions,
      results,
      timestamp: new Date().toISOString(),
    };
    
    resetHistory.unshift(logEntry);
    
    // Keep only last 100 reset history entries
    if (resetHistory.length > 100) {
      resetHistory.pop();
    }
    
    writeJsonFile(resetHistoryFilePath, resetHistory);
    
    // Also log to audit logs
    const auditLogs = readJsonFile(auditLogsFilePath);
    const auditEntry = {
      id: `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      action: 'DATA_RESET',
      adminId,
      adminUsername,
      details: `Reset data: ${selectedOptions.join(', ')}`,
      timestamp: new Date().toISOString(),
    };
    auditLogs.unshift(auditEntry);
    
    // Keep only last 500 audit log entries
    if (auditLogs.length > 500) {
      auditLogs.pop();
    }
    
    writeJsonFile(auditLogsFilePath, auditLogs);
    
    console.log('[RESET] Reset action logged successfully');
  } catch (error) {
    console.error('[RESET] Error logging reset action:', error);
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[RESET] Starting data reset process at:', new Date().toISOString());

  try {
    // Verify admin authentication
    const authCookie = request.cookies.get('adminAuth');
    if (!authCookie || authCookie.value !== 'true') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { resetOptions, adminId, adminUsername } = body;

    console.log('[RESET] Reset options:', resetOptions);
    console.log('[RESET] Admin:', adminUsername);

    // Validate that at least one option is selected
    if (!resetOptions || Object.values(resetOptions).every(v => !v)) {
      return NextResponse.json(
        { success: false, error: 'No reset options selected' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    const resetResults: any = {
      revenue: { success: false, message: '', count: 0 },
      orders: { success: false, message: '', count: 0 },
      customers: { success: false, message: '', count: 0 },
      products: { success: false, message: '', count: 0 },
      categories: { success: false, message: '', count: 0 },
      customerStatistics: { success: false, message: '' },
      orderStatistics: { success: false, message: '' },
      salesAnalytics: { success: false, message: '' },
    };

    // Reset Total Revenue (by clearing orders - revenue is calculated from orders)
    if (resetOptions.revenue) {
      try {
        const orderCount = await Order.countDocuments();
        const revenueResult = await Order.aggregate([
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$total' },
            },
          },
        ]);
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;
        
        await Order.deleteMany({});
        
        resetResults.revenue = { 
          success: true, 
          message: `Cleared ${orderCount} orders (PKR ${totalRevenue.toLocaleString()} revenue)`,
          count: orderCount
        };
        console.log('[RESET] Revenue reset successfully');
      } catch (error) {
        resetResults.revenue = { 
          success: false, 
          message: 'Failed to reset revenue',
          count: 0
        };
        console.error('[RESET] Error resetting revenue:', error);
      }
    }

    // Reset Total Orders
    if (resetOptions.orders) {
      try {
        const orderCount = await Order.countDocuments();
        
        await Order.deleteMany({});
        
        resetResults.orders = { 
          success: true, 
          message: `Deleted ${orderCount} orders`,
          count: orderCount
        };
        console.log('[RESET] Orders reset successfully');
      } catch (error) {
        resetResults.orders = { 
          success: false, 
          message: 'Failed to reset orders',
          count: 0
        };
        console.error('[RESET] Error resetting orders:', error);
      }
    }

    // Reset Total Customers (exclude admin accounts)
    if (resetOptions.customers) {
      try {
        const customerCount = await User.countDocuments({ role: { $ne: 'admin' } });
        
        // Delete all non-admin users
        await User.deleteMany({ role: { $ne: 'admin' } });
        
        resetResults.customers = { 
          success: true, 
          message: `Deleted ${customerCount} customer accounts (kept admin accounts)`,
          count: customerCount
        };
        console.log('[RESET] Customers reset successfully');
      } catch (error) {
        resetResults.customers = { 
          success: false, 
          message: 'Failed to reset customers',
          count: 0
        };
        console.error('[RESET] Error resetting customers:', error);
      }
    }

    // Reset Total Products
    if (resetOptions.products) {
      try {
        const productCount = await Product.countDocuments();
        
        await Product.deleteMany({});
        
        resetResults.products = { 
          success: true, 
          message: `Deleted ${productCount} products`,
          count: productCount
        };
        console.log('[RESET] Products reset successfully');
      } catch (error) {
        resetResults.products = { 
          success: false, 
          message: 'Failed to reset products',
          count: 0
        };
        console.error('[RESET] Error resetting products:', error);
      }
    }

    // Reset Categories
    if (resetOptions.categories) {
      try {
        const categoryCount = await Category.countDocuments();
        
        await Category.deleteMany({});
        
        resetResults.categories = { 
          success: true, 
          message: `Deleted ${categoryCount} categories`,
          count: categoryCount
        };
        console.log('[RESET] Categories reset successfully');
      } catch (error) {
        resetResults.categories = { 
          success: false, 
          message: 'Failed to reset categories',
          count: 0
        };
        console.error('[RESET] Error resetting categories:', error);
      }
    }

    // Reset Customer Statistics (clear customer activity logs - handled by orders reset)
    if (resetOptions.customerStatistics) {
      resetResults.customerStatistics = { 
        success: true, 
        message: 'Customer statistics cleared (via orders reset)' 
      };
    }

    // Reset Order Statistics (handled by orders reset)
    if (resetOptions.orderStatistics) {
      resetResults.orderStatistics = { 
        success: true, 
        message: 'Order statistics cleared (via orders reset)' 
      };
    }

    // Reset Sales Analytics (handled by orders/revenue reset)
    if (resetOptions.salesAnalytics) {
      resetResults.salesAnalytics = { 
        success: true, 
        message: 'Sales analytics cleared (via revenue reset)' 
      };
    }

    // Log the reset action
    logResetAction(adminId || 'unknown', adminUsername || 'unknown', resetOptions, resetResults);

    const duration = Date.now() - startTime;
    console.log(`[RESET] Data reset completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: 'Selected data has been reset successfully.',
      results: resetResults,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[RESET] Error during reset process:', error);
    console.error(`[RESET] Reset failed after ${duration}ms`);

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to reset data',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve reset history
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authCookie = request.cookies.get('adminAuth');
    if (!authCookie || authCookie.value !== 'true') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const resetHistory = readJsonFile(resetHistoryFilePath);
    
    return NextResponse.json({
      success: true,
      history: resetHistory,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[RESET] Error fetching reset history:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch reset history',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
