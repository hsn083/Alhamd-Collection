import mongoose from 'mongoose';
import connectDB from '../src/lib/db';
import Order from '../src/models/Order';
import Counter from '../src/models/Counter';
import { formatOrderNumber } from '../src/lib/order-number';

/**
 * Migration Script: Convert existing orders to new sequential order number format
 * 
 * This script:
 * 1. Finds all existing orders
 * 2. Assigns sequential numeric order numbers starting from 100001
 * 3. Creates displayOrderNumber field in "Order# (100001)" format
 * 4. Updates the counter to the highest order number
 * 
 * Run with: npx tsx scripts/migrate-order-numbers.ts
 */

async function migrateOrderNumbers() {
  try {
    console.log('[MIGRATION] Starting order number migration...');
    await connectDB();

    // Check if migration has already been run
    const existingCounter = await Counter.findOne({ name: 'orderNumber' });
    if (existingCounter && existingCounter.value > 0) {
      console.log('[MIGRATION] Counter already exists with value:', existingCounter.value);
      console.log('[MIGRATION] Skipping migration to avoid duplicate order numbers.');
      console.log('[MIGRATION] If you need to re-run, delete the counter document first.');
      return;
    }

    // Get all existing orders, sorted by creation date
    const orders = await Order.find({}).sort({ createdAt: 1 });
    console.log(`[MIGRATION] Found ${orders.length} existing orders to migrate`);

    if (orders.length === 0) {
      console.log('[MIGRATION] No orders found. Initializing counter to 100001');
      await Counter.create({ name: 'orderNumber', value: 100001 });
      console.log('[MIGRATION] Migration complete');
      return;
    }

    // Start order numbers from 100001
    let currentOrderNumber = 100001;
    const migrationResults = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Update each order with a sequential number
    for (const order of orders) {
      try {
        const oldOrderNumber = order.orderNumber;
        
        // Update order with new number format
        await Order.findByIdAndUpdate(order._id, {
          orderNumber: currentOrderNumber,
          displayOrderNumber: formatOrderNumber(currentOrderNumber),
        });

        console.log(`[MIGRATION] Migrated order: ${oldOrderNumber} -> ${formatOrderNumber(currentOrderNumber)}`);
        migrationResults.success++;
        currentOrderNumber++;
      } catch (error: any) {
        console.error(`[MIGRATION] Failed to migrate order ${order._id}:`, error.message);
        migrationResults.failed++;
        migrationResults.errors.push(`${order._id}: ${error.message}`);
      }
    }

    // Set the counter to the next available number
    const finalCounterValue = currentOrderNumber;
    await Counter.create({ name: 'orderNumber', value: finalCounterValue });
    console.log(`[MIGRATION] Counter initialized to ${finalCounterValue}`);

    // Print migration summary
    console.log('\n[MIGRATION] Migration Summary:');
    console.log(`[MIGRATION] Total orders: ${orders.length}`);
    console.log(`[MIGRATION] Successfully migrated: ${migrationResults.success}`);
    console.log(`[MIGRATION] Failed: ${migrationResults.failed}`);
    
    if (migrationResults.errors.length > 0) {
      console.log('[MIGRATION] Errors:');
      migrationResults.errors.forEach((err, i) => {
        console.log(`[MIGRATION]   ${i + 1}. ${err}`);
      });
    }

    console.log('[MIGRATION] Migration complete!');
  } catch (error: any) {
    console.error('[MIGRATION] Fatal error during migration:', error);
    process.exit(1);
  }
}

// Run migration
migrateOrderNumbers()
  .then(() => {
    console.log('[MIGRATION] Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[MIGRATION] Script failed:', error);
    process.exit(1);
  });
