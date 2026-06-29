import { NextRequest, NextResponse } from 'next/server';
import { 
  getNotificationsByUserId, 
  markNotificationAsRead, 
  markAllAsRead, 
  deleteNotification 
} from '@/lib/notifications';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Get customer notifications (filtered by user ID)
export async function GET(request: NextRequest) {
  try {
    // Get user ID from localStorage (sent via header) or session
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 }
      );
    }

    const notifications = await getNotificationsByUserId(userId);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error('[NOTIFICATIONS] Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST - Mark notification as read or mark all as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      await markAllAsRead();
    } else if (notificationId) {
      await markNotificationAsRead(notificationId);
    } else {
      return NextResponse.json(
        { success: false, error: 'notificationId or markAllAsRead required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification(s) marked as read',
    });
  } catch (error: any) {
    console.error('[NOTIFICATIONS] Error marking notification as read:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}

// DELETE - Delete notification
export async function DELETE(request: NextRequest) {
  try {
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
  } catch (error: any) {
    console.error('[NOTIFICATIONS] Error deleting notification:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
