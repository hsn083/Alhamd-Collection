import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Inventory from '@/models/Inventory';
import StockHistory from '@/models/StockHistory';
import Notification from '@/models/Notification';
import { sendOrderStatusEmail } from './email-service';
import mongoose from 'mongoose';

// Admin email for stock alerts
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'alhamdcollection518@gmail.com';

// Calculate stock status based on quantity and threshold
export function calculateStockStatus(quantity: number, threshold: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= threshold) return 'low_stock';
  return 'in_stock';
}

// Update product stock using MongoDB
export async function updateProductStock(
  productId: string,
  newQuantity: number,
  changeType: 'in' | 'out' | 'adjustment' | 'sale' | 'return',
  reason: string,
  performedBy?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return { success: false, error: 'Invalid product ID' };
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    const previousQuantity = product.stock || 0;
    const threshold = product.lowStockThreshold || 10;

    // Update product stock
    product.stock = newQuantity;
    await product.save();

    // Update or create inventory record
    let inventory = await Inventory.findOne({ product: productId });
    if (!inventory) {
      inventory = await Inventory.create({
        product: productId,
        quantity: newQuantity,
        lowStockThreshold: threshold,
        status: calculateStockStatus(newQuantity, threshold),
        reserved: 0,
        available: newQuantity,
      });
    } else {
      inventory.quantity = newQuantity;
      inventory.available = newQuantity;
      inventory.status = calculateStockStatus(newQuantity, inventory.lowStockThreshold);
      await inventory.save();
    }

    // Record stock history
    await StockHistory.create({
      product: productId,
      type: changeType,
      quantity: Math.abs(newQuantity - previousQuantity),
      previousQuantity,
      newQuantity,
      reason,
      referenceType: changeType === 'sale' ? 'order' : changeType === 'return' ? 'return' : 'manual',
      performedBy: performedBy ? new mongoose.Types.ObjectId(performedBy) : undefined,
    });

    // Check for stock alerts and send notifications
    await checkStockAlerts(product, previousQuantity, newQuantity, threshold);

    return { success: true };
  } catch (error) {
    console.error('Error updating product stock:', error);
    return { success: false, error: 'Failed to update stock' };
  }
}

// Check and create stock alerts using MongoDB
async function checkStockAlerts(
  product: any,
  previousQuantity: number,
  newQuantity: number,
  threshold: number
): Promise<void> {
  const thresholdCrossed = newQuantity <= threshold && previousQuantity > threshold;
  const outOfStock = newQuantity === 0 && previousQuantity > 0;

  if (thresholdCrossed || outOfStock) {
    const alertType = outOfStock ? 'out_of_stock' : 'low_stock';

    // Create admin notification
    try {
      await Notification.create({
        recipientType: 'admin',
        type: 'stock',
        title: outOfStock ? '🚨 Out of Stock Alert' : '⚠️ Low Stock Alert',
        message: `${product.name} is ${outOfStock ? 'OUT OF STOCK' : 'running LOW on stock'}. Current quantity: ${newQuantity}`,
        link: `/admin/products/${product._id}`,
        data: {
          productId: product._id,
          productName: product.name,
          currentQuantity: newQuantity,
          threshold,
          alertType,
        },
      });
    } catch (notifError) {
      console.error('Failed to create stock notification:', notifError);
    }

    // Send email alert
    try {
      await sendOrderStatusEmail(
        ADMIN_EMAIL,
        `STK-${product._id}`,
        'Admin',
        alertType
      );
      console.log(`Stock alert email sent for ${product.name}`);
    } catch (emailError) {
      console.error('Failed to send stock alert email:', emailError);
    }
  }
}

// Get low stock products from MongoDB
export async function getLowStockProducts(): Promise<any[]> {
  try {
    await connectDB();

    const products = await Product.find({ status: 'active' }).lean();
    const lowStockProducts = [];

    for (const product of products) {
      const quantity = product.stock || 0;
      const threshold = product.lowStockThreshold || 10;
      const status = calculateStockStatus(quantity, threshold);

      if (status === 'low_stock' || status === 'out_of_stock') {
        lowStockProducts.push({
          ...product,
          id: product._id.toString(),
          stockQuantity: quantity,
          lowStockThreshold: threshold,
          stockStatus: status,
        });
      }
    }

    return lowStockProducts;
  } catch (error) {
    console.error('Error getting low stock products:', error);
    return [];
  }
}

// Get stock summary statistics
export async function getStockSummary(): Promise<{
  totalLowStock: number;
  outOfStock: number;
  criticalStock: number;
}> {
  try {
    await connectDB();

    const products = await Product.find({ status: 'active' }).lean();
    let totalLowStock = 0;
    let outOfStock = 0;
    let criticalStock = 0;

    for (const product of products) {
      const quantity = product.stock || 0;
      const threshold = product.lowStockThreshold || 10;
      const status = calculateStockStatus(quantity, threshold);

      if (status === 'out_of_stock') {
        outOfStock++;
        totalLowStock++;
      } else if (status === 'low_stock') {
        totalLowStock++;
        if (quantity <= 5) {
          criticalStock++;
        }
      }
    }

    return { totalLowStock, outOfStock, criticalStock };
  } catch (error) {
    console.error('Error getting stock summary:', error);
    return { totalLowStock: 0, outOfStock: 0, criticalStock: 0 };
  }
}

// Get stock history for a product
export async function getStockHistory(productId: string): Promise<any[]> {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return [];
    }

    const history = await StockHistory.find({ product: productId })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return history.map((h: any) => ({
      ...h,
      id: h._id.toString(),
    }));
  } catch (error) {
    console.error('Error getting stock history:', error);
    return [];
  }
}
