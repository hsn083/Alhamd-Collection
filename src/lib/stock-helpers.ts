import { readProducts, writeProducts } from './server-products';
import { StockStatus, StockHistory, StockAlert } from '@/types';
import { sendOrderStatusEmail } from './email-service';
import fs from 'fs';
import path from 'path';

const stockHistoryPath = path.join(process.cwd(), 'data', 'stock-history.json');
const stockAlertsPath = path.join(process.cwd(), 'data', 'stock-alerts.json');

// Admin email for stock alerts
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'alhamdcollection518@gmail.com';

// Read stock history
function readStockHistory(): StockHistory[] {
  try {
    if (fs.existsSync(stockHistoryPath)) {
      const data = fs.readFileSync(stockHistoryPath, 'utf-8');
      return JSON.parse(data) || [];
    }
    return [];
  } catch (error) {
    console.error('Error reading stock history:', error);
    return [];
  }
}

// Write stock history
function writeStockHistory(history: StockHistory[]): void {
  try {
    fs.writeFileSync(stockHistoryPath, JSON.stringify(history, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing stock history:', error);
    throw error;
  }
}

// Read stock alerts
function readStockAlerts(): StockAlert[] {
  try {
    if (fs.existsSync(stockAlertsPath)) {
      const data = fs.readFileSync(stockAlertsPath, 'utf-8');
      return JSON.parse(data) || [];
    }
    return [];
  } catch (error) {
    console.error('Error reading stock alerts:', error);
    return [];
  }
}

// Write stock alerts
function writeStockAlerts(alerts: StockAlert[]): void {
  try {
    fs.writeFileSync(stockAlertsPath, JSON.stringify(alerts, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing stock alerts:', error);
    throw error;
  }
}

// Send stock alert email to admin
async function sendStockAlertEmail(
  productName: string,
  sku: string,
  currentQuantity: number,
  threshold: number,
  alertType: 'low_stock' | 'out_of_stock'
): Promise<void> {
  try {
    const subject = alertType === 'out_of_stock' 
      ? `🚨 OUT OF STOCK: ${productName}`
      : `⚠️ LOW STOCK ALERT: ${productName}`;
    
    const message = `
Stock Alert - ${alertType.toUpperCase()}

Product: ${productName}
SKU: ${sku}
Current Quantity: ${currentQuantity}
Threshold: ${threshold}
Alert Type: ${alertType}

${alertType === 'out_of_stock' 
  ? 'This product is now OUT OF STOCK. Please restock immediately.'
  : `This product has LOW STOCK. Current quantity is below the threshold.`
}

Restock Link: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/products

Time: ${new Date().toLocaleString()}
    `.trim();

    // Use existing email service to send alert
    await sendOrderStatusEmail(
      ADMIN_EMAIL,
      `STK-${Date.now()}`,
      'Admin',
      alertType === 'out_of_stock' ? 'out_of_stock' : 'low_stock'
    );
    
    console.log(`Stock alert email sent for ${productName}`);
  } catch (error) {
    console.error('Error sending stock alert email:', error);
  }
}

// Calculate stock status based on quantity and threshold
export function calculateStockStatus(quantity: number, threshold: number): StockStatus {
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= threshold) return 'low_stock';
  return 'in_stock';
}

// Update product stock
export async function updateProductStock(
  productId: string,
  newQuantity: number,
  changeType: 'increase' | 'decrease' | 'adjustment',
  reason: string,
  changedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const products = await readProducts();
    const productIndex = products.findIndex((p: any) => p.id === productId);

    if (productIndex === -1) {
      return { success: false, error: 'Product not found' };
    }

    const product = products[productIndex];
    const previousQuantity = product.stockQuantity || product.stock || 0;

    // Update stock fields
    product.stock = newQuantity;
    product.stockQuantity = newQuantity;
    product.lowStockThreshold = product.lowStockThreshold || 10;
    product.stockStatus = calculateStockStatus(newQuantity, product.lowStockThreshold);
    product.updatedAt = new Date().toISOString();

    // Save updated product
    products[productIndex] = product;
    await writeProducts(products);

    // Record stock history
    const historyEntry: StockHistory = {
      id: `STK-HIST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId,
      productName: product.name,
      previousQuantity,
      newQuantity,
      changeType,
      reason,
      changedBy,
      changedAt: new Date().toISOString(),
    };

    const history = readStockHistory();
    history.unshift(historyEntry);
    writeStockHistory(history);

    // Check for stock alerts
    await checkStockAlerts(product, previousQuantity, newQuantity);

    return { success: true };
  } catch (error) {
    console.error('Error updating product stock:', error);
    return { success: false, error: 'Failed to update stock' };
  }
}

// Check and create stock alerts
async function checkStockAlerts(product: any, previousQuantity: number, newQuantity: number): Promise<void> {
  const alerts = readStockAlerts();
  const threshold = product.lowStockThreshold || 10;

  // Check for out of stock
  if (newQuantity === 0 && previousQuantity > 0) {
    const alert: StockAlert = {
      id: `STK-ALT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      currentQuantity: newQuantity,
      threshold,
      alertType: 'out_of_stock',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    alerts.unshift(alert);
    writeStockAlerts(alerts);
    
    // Send email alert
    await sendStockAlertEmail(product.name, product.sku, newQuantity, threshold, 'out_of_stock');
  }
  // Check for low stock (crossed threshold)
  else if (newQuantity <= threshold && previousQuantity > threshold) {
    const alert: StockAlert = {
      id: `STK-ALT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      currentQuantity: newQuantity,
      threshold,
      alertType: 'low_stock',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    alerts.unshift(alert);
    writeStockAlerts(alerts);
    
    // Send email alert
    await sendStockAlertEmail(product.name, product.sku, newQuantity, threshold, 'low_stock');
  }
}

// Get low stock products
export async function getLowStockProducts(): Promise<any[]> {
  try {
    const products = await readProducts();
    return products.filter((product: any) => {
      const quantity = product.stockQuantity || product.stock || 0;
      const threshold = product.lowStockThreshold || 10;
      const status = calculateStockStatus(quantity, threshold);
      return status === 'low_stock' || status === 'out_of_stock';
    }).map((product: any) => ({
      ...product,
      stockQuantity: product.stockQuantity || product.stock || 0,
      lowStockThreshold: product.lowStockThreshold || 10,
      stockStatus: calculateStockStatus(product.stockQuantity || product.stock || 0, product.lowStockThreshold || 10),
    }));
  } catch (error) {
    console.error('Error getting low stock products:', error);
    return [];
  }
}

// Get stock alerts
export function getStockAlerts(): StockAlert[] {
  return readStockAlerts();
}

// Mark alert as read
export function markAlertAsRead(alertId: string): void {
  const alerts = readStockAlerts();
  const alertIndex = alerts.findIndex((a) => a.id === alertId);
  if (alertIndex !== -1) {
    alerts[alertIndex].isRead = true;
    writeStockAlerts(alerts);
  }
}

// Clear all alerts
export function clearStockAlerts(): void {
  writeStockAlerts([]);
}
