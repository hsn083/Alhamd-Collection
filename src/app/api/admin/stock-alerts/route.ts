import { NextRequest, NextResponse } from 'next/server';
import { getStockAlerts, markAlertAsRead, clearStockAlerts } from '@/lib/stock-helpers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const alerts = getStockAlerts();
    const unreadCount = alerts.filter((a) => !a.isRead).length;

    return NextResponse.json({
      success: true,
      alerts,
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
    const body = await request.json();
    const { action, alertId } = body;

    if (action === 'mark_read' && alertId) {
      markAlertAsRead(alertId);
      return NextResponse.json({ success: true, message: 'Alert marked as read' });
    } else if (action === 'clear_all') {
      clearStockAlerts();
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
