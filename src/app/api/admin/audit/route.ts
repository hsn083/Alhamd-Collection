import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/admin-auth';

// Force dynamic rendering and disable static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// GET - Fetch audit logs
export async function GET(request: NextRequest) {
  try {
    // Skip during build time - check multiple possible build indicators
    const isBuilding = process.env.NEXT_BUILD_PHASE === 'building' || 
                       process.env.NODE_ENV === 'test' ||
                       typeof window === 'undefined' && process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
    
    if (isBuilding) {
      return NextResponse.json({ success: true, logs: [], total: 0 });
    }

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
