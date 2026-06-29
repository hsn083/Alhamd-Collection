import { NextRequest, NextResponse } from 'next/server';
import { 
  getNotificationsByRole,
  createAdminNotification,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  type Notification 
} from '@/lib/notifications';
import { checkLowStock } from '@/lib/notifications-helpers';
import fs from 'fs';
import path from 'path';

const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');

// Helper function to read orders
function getOrders(): any[] {
  try {
    if (fs.existsSync(ordersFilePath)) {
      const data = fs.readFileSync(ordersFilePath, 'utf-8');
      return JSON.parse(data) || [];
    }
    return [];
  } catch (error) {
    console.error('Error reading orders:', error);
    return [];
  }
}

// Notification types
export type NotificationType = 'new_order' | 'low_stock' | 'new_customer' | 'payment_received';

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

// GET endpoint to fetch admin notifications only
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminAuth = request.headers.get('x-admin-auth');
    const cookieAuth = request.cookies.get('adminAuth');
    
    if (!adminAuth && !cookieAuth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Check for low stock
    await checkLowStock();

    let notifications = await getNotificationsByRole('admin');
    if (unreadOnly) {
      notifications = notifications.filter((n: Notification) => !n.isRead);
    }

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: notifications.filter((n: Notification) => !n.isRead).length,
    });
  } catch (error) {
    console.error('[NOTIFICATIONS] Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST endpoint to mark notification as read
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminAuth = request.headers.get('x-admin-auth');
    const cookieAuth = request.cookies.get('adminAuth');
    
    if (!adminAuth && !cookieAuth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      await markAllAsRead();
    } else if (notificationId) {
      await markNotificationAsRead(notificationId);
    }

    return NextResponse.json({
      success: true,
      message: 'Notification(s) marked as read',
    });
  } catch (error) {
    console.error('[NOTIFICATIONS] Error marking notification as read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to delete notification
export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    const adminAuth = request.headers.get('x-admin-auth');
    const cookieAuth = request.cookies.get('adminAuth');
    
    if (!adminAuth && !cookieAuth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    await deleteNotification(notificationId);

    return NextResponse.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('[NOTIFICATIONS] Error deleting notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
