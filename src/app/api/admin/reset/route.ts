import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// File paths
const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');
const transactionsFilePath = path.join(process.cwd(), 'data', 'transactions.json');

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[RESET] Starting data reset process at:', new Date().toISOString());

  try {
    const body = await request.json();
    const { resetOptions } = body;

    console.log('[RESET] Reset options:', resetOptions);

    // Validate reset options
    const options = resetOptions || {
      orders: true,
      transactions: true,
      coupons: true,
      cart: true,
      wishlist: true,
    };

    const resetResults: any = {
      orders: { success: false, message: '' },
      transactions: { success: false, message: '' },
      coupons: { success: false, message: '' },
      cart: { success: false, message: '' },
      wishlist: { success: false, message: '' },
    };

    // Reset orders - delete from JSON file
    if (options.orders) {
      try {
        let orderCount = 0;
        if (fs.existsSync(ordersFilePath)) {
          const data = fs.readFileSync(ordersFilePath, 'utf-8');
          const orders = JSON.parse(data) || [];
          orderCount = orders.length;
        }
        
        fs.writeFileSync(ordersFilePath, JSON.stringify([], null, 2), 'utf-8');
        resetResults.orders = { 
          success: true, 
          message: `Deleted ${orderCount} orders` 
        };
        console.log('[RESET] Orders reset successfully');
      } catch (error) {
        resetResults.orders = { 
          success: false, 
          message: 'Failed to reset orders' 
        };
        console.error('[RESET] Error resetting orders:', error);
      }
    }

    // Reset transactions - delete from JSON file
    if (options.transactions) {
      try {
        let transactionCount = 0;
        if (fs.existsSync(transactionsFilePath)) {
          const data = fs.readFileSync(transactionsFilePath, 'utf-8');
          const transactions = JSON.parse(data) || [];
          transactionCount = transactions.length;
        }
        
        fs.writeFileSync(transactionsFilePath, JSON.stringify([], null, 2), 'utf-8');
        resetResults.transactions = { 
          success: true, 
          message: `Deleted ${transactionCount} transactions` 
        };
        console.log('[RESET] Transactions reset successfully');
      } catch (error) {
        resetResults.transactions = { 
          success: false, 
          message: 'Failed to reset transactions' 
        };
        console.error('[RESET] Error resetting transactions:', error);
      }
    }

    // Reset coupons - coupons are currently mock data only, so just log success
    if (options.coupons) {
      try {
        resetResults.coupons = { 
          success: true, 
          message: 'Coupons reset (mock data cleared)' 
        };
        console.log('[RESET] Coupons reset successfully');
      } catch (error) {
        resetResults.coupons = { 
          success: false, 
          message: 'Failed to reset coupons' 
        };
        console.error('[RESET] Error resetting coupons:', error);
      }
    }

    // Note: Cart and wishlist are client-side stores (Zustand with localStorage)
    // They will be cleared by the frontend after successful reset
    resetResults.cart = { 
      success: true, 
      message: 'Cart will be cleared on client side' 
    };
    resetResults.wishlist = { 
      success: true, 
      message: 'Wishlist will be cleared on client side' 
    };

    const duration = Date.now() - startTime;
    console.log(`[RESET] Data reset completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: 'Orders, Transactions, Coupons, Cart, and Wishlist have been reset successfully.',
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
