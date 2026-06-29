import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Notification from '@/models/Notification';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Fetch stock notifications for admin
    const alerts = await Notification.find({
      recipientType: 'admin',
      type: 'stock',
    }).sort({ createdAt: -1 }).limit(50);
    
    const unreadCount = alerts.filter((a: any) => !a.isRead).length;

    const transformedAlerts = alerts.map(alert => ({
      id: alert._id.toString(),
      title: alert.title,
      message: alert.message,
      isRead: alert.isRead,
      createdAt: alert.createdAt.toISOString(),
      data: alert.data,
      link: alert.link,
    }));

    return NextResponse.json({
      success: true,
      alerts: transformedAlerts,
      unreadCount,
    });
  } catch (error: any) {
    console.error('Error fetching stock alerts:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch stock alerts' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { action, alertId } = body;

    if (action === 'mark_read' && alertId) {
      await Notification.findByIdAndUpdate(alertId, { isRead: true });
      return NextResponse.json({ success: true, message: 'Alert marked as read' });
    } else if (action === 'clear_all') {
      await Notification.updateMany(
        { recipientType: 'admin', type: 'stock' },
        { isRead: true }
      );
      return NextResponse.json({ success: true, message: 'All alerts cleared' });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error updating stock alerts:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update alerts' },
      { status: 500 }
    );
  }
}
