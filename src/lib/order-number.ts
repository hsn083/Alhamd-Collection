import Counter from '@/models/Counter';
import connectDB from '@/lib/db';

/**
 * Generate the next sequential order number
 * Uses atomic counter to ensure uniqueness even with concurrent requests
 */
export async function generateNextOrderNumber(): Promise<number> {
  await connectDB();
  
  const counterName = 'orderNumber';
  
  // Use findOneAndUpdate with atomic increment to handle concurrency
  const counter = await Counter.findOneAndUpdate(
    { name: counterName },
    { $inc: { value: 1 } },
    { 
      new: true, 
      upsert: true,
      setDefaultsOnInsert: true 
    }
  );
  
  if (!counter) {
    throw new Error('Failed to generate order number');
  }
  
  // Start from 100001 if this is the first order
  if (counter.value === 1) {
    await Counter.findByIdAndUpdate(counter._id, { value: 100001 });
    return 100001;
  }
  
  return counter.value;
}

/**
 * Format order number for display
 * e.g., 100001 -> "Order# (100001)"
 */
export function formatOrderNumber(orderNumber: number): string {
  return `Order# (${orderNumber})`;
}

/**
 * Extract numeric order number from display format
 * e.g., "Order# (100001)" -> 100001
 * e.g., "100001" -> 100001
 */
export function extractOrderNumber(input: string): number | null {
  // Try to extract from "Order# (123456)" format
  const match = input.match(/Order#\s*\((\d+)\)/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  // Try to parse as plain number
  const num = parseInt(input.trim(), 10);
  if (!isNaN(num) && num > 0) {
    return num;
  }
  
  return null;
}
