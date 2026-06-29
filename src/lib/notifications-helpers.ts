import { 
  createAdminNotification,
  createCustomerNotification,
  getNotifications as getStoredNotifications,
  type Notification as StoredNotification 
} from '@/lib/notifications';
import { readProducts } from './server-products';

// Generate notification for new order (admin)
export function createNewOrderNotification(order: any) {
  const notification = {
    type: 'order' as const,
    title: 'New Order Received',
    message: `Order ${order.id} placed by ${order.user?.name || 'Guest'} for PKR ${order.total?.toLocaleString()}`,
    isRead: false,
  };
  createAdminNotification(notification);
  console.log('[NOTIFICATION] New order notification created for admin');
}

// Generate notification for customer order confirmation
export function createCustomerOrderNotification(order: any) {
  const userId = order.userId || order.user?.email || order.user?.id;
  if (!userId) {
    console.log('[NOTIFICATION] No user ID for customer notification');
    return;
  }
  
  const notification = {
    type: 'order' as const,
    title: 'Order Confirmed',
    message: `Your order ${order.id} has been confirmed successfully`,
    isRead: false,
    userId: userId,
  };
  createCustomerNotification(notification);
  console.log('[NOTIFICATION] Customer order notification created');
}

// Generate notification for order status update (customer)
export function createOrderStatusNotification(order: any, status: string) {
  const userId = order.userId || order.user?.email || order.user?.id;
  if (!userId) {
    console.log('[NOTIFICATION] No user ID for order status notification');
    return;
  }
  
  const statusMessages: { [key: string]: string } = {
    'confirmed': 'Your order has been confirmed',
    'processing': 'Your order is being processed',
    'shipped': 'Your order has been shipped',
    'delivered': 'Your order has been delivered',
    'cancelled': 'Your order has been cancelled',
    'returned': 'Your order return has been processed',
  };
  
  const notification = {
    type: 'shipping' as const,
    title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: statusMessages[status] || `Your order status is now: ${status}`,
    isRead: false,
    userId: userId,
  };
  createCustomerNotification(notification);
  console.log('[NOTIFICATION] Order status notification created for customer');
}

// Generate notification for low stock (admin)
export async function createLowStockNotification(product: any) {
  const notifications = await getStoredNotifications();
  const existingNotification = notifications.find(
    (n: StoredNotification) => n.type === 'alert' && n.message.includes(product.name) && !n.isRead && n.role === 'admin'
  );
  
  if (!existingNotification) {
    const notification = {
      type: 'alert' as const,
      title: 'Low Stock Alert',
      message: `${product.name} is running low on stock (${product.stock} remaining)`,
      isRead: false,
    };
    createAdminNotification(notification);
    console.log('[NOTIFICATION] Low stock notification created for admin');
  }
}

// Generate notification for new customer (admin)
export function createNewCustomerNotification(customer: any) {
  const notification = {
    type: 'order' as const,
    title: 'New Customer Registered',
    message: `${customer.name} (${customer.email}) has registered`,
    isRead: false,
  };
  createAdminNotification(notification);
  console.log('[NOTIFICATION] New customer notification created for admin');
}

// Check for low stock products
export async function checkLowStock() {
  const products = await readProducts();
  products.forEach((product: any) => {
    if (product.stock <= 5) {
      createLowStockNotification(product);
    }
  });
}
