import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/admin-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch audit logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const action = searchParams.get('action');
    
    let logs = getAuditLogs();
    
    // Filter by action if specified
    if (action) {
      logs = logs.filter((log) => log.action === action);
    }
    
    // Limit results
    logs = logs.slice(0, limit);
    
    return NextResponse.json({ 
      success: true, 
      logs,
      total: logs.length 
    });
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
