import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');

export interface Notification {
  id: string;
  type: 'order' | 'shipping' | 'promotion' | 'alert' | 'payment' | 'account';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId?: string; // Optional: for user-specific notifications
  role: 'admin' | 'customer'; // Role-based filtering
}

// Ensure data directory exists
async function ensureDataDir() {
  const { promises: fs } = await import('fs');
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

// Get all notifications (server-side only)
export async function getNotifications(): Promise<Notification[]> {
  try {
    const { promises: fs } = await import('fs');
    const data = await fs.readFile(NOTIFICATIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Get notifications by role (server-side only)
export async function getNotificationsByRole(role: 'admin' | 'customer'): Promise<Notification[]> {
  try {
    const notifications = await getNotifications();
    return notifications.filter(n => n.role === role);
  } catch (error) {
    return [];
  }
}

// Get notifications by user ID (server-side only)
export async function getNotificationsByUserId(userId: string): Promise<Notification[]> {
  try {
    const notifications = await getNotifications();
    return notifications.filter(n => n.userId === userId && n.role === 'customer');
  } catch (error) {
    return [];
  }
}

// Save notifications (server-side only)
async function saveNotifications(notifications: Notification[]): Promise<void> {
  await ensureDataDir();
  const { promises: fs } = await import('fs');
  await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
}

// Create notification (server-side only)
export async function createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<{ success: boolean; notification?: Notification; error?: string }> {
  try {
    const notifications = await getNotifications();
    
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    notifications.unshift(newNotification); // Add to beginning
    
    await saveNotifications(notifications);
    
    return { success: true, notification: newNotification };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Create admin notification (server-side only)
export async function createAdminNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'role'>): Promise<{ success: boolean; notification?: Notification; error?: string }> {
  return createNotification({ ...notification, role: 'admin' });
}

// Create customer notification (server-side only)
export async function createCustomerNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'role'>): Promise<{ success: boolean; notification?: Notification; error?: string }> {
  return createNotification({ ...notification, role: 'customer' });
}

// Mark notification as read (server-side only)
export async function markNotificationAsRead(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const notifications = await getNotifications();
    const updated = notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    
    await saveNotifications(updated);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Mark all notifications as read (server-side only)
export async function markAllAsRead(): Promise<{ success: boolean; error?: string }> {
  try {
    const notifications = await getNotifications();
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    
    await saveNotifications(updated);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Delete notification (server-side only)
export async function deleteNotification(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const notifications = await getNotifications();
    const updated = notifications.filter(n => n.id !== id);
    
    await saveNotifications(updated);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get unread count (server-side only)
export async function getUnreadCount(): Promise<number> {
  const notifications = await getNotifications();
  return notifications.filter(n => !n.isRead).length;
}

// Clear all notifications (server-side only)
export async function clearAllNotifications(): Promise<{ success: boolean; error?: string }> {
  try {
    await saveNotifications([]);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
