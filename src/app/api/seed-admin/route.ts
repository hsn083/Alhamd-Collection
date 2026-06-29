import { NextRequest, NextResponse } from 'next/server';
import { initializeDefaultAdmin, getAdminUsers } from '@/lib/admin-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - Seed default admin user (development only)
export async function POST(request: NextRequest) {
  try {
    console.log('[SEED-ADMIN] Starting admin seed process');
    
    // Check if running in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Seed endpoint is disabled in production' },
        { status: 403 }
      );
    }
    
    // Initialize default admin
    await initializeDefaultAdmin();
    
    // Verify the admin was created
    const users = getAdminUsers();
    const adminUser = users.find(u => u.username === 'admin');
    
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to create admin user' },
        { status: 500 }
      );
    }
    
    console.log('[SEED-ADMIN] Admin user seeded successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Default admin user created/verified',
      admin: {
        username: adminUser.username,
        email: adminUser.email,
        id: adminUser.id,
      },
    });
  } catch (error: any) {
    console.error('[SEED-ADMIN] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to seed admin user' },
      { status: 500 }
    );
  }
}

// GET - Check if admin exists
export async function GET(request: NextRequest) {
  try {
    const users = getAdminUsers();
    const adminUser = users.find(u => u.username === 'admin');
    
    return NextResponse.json({
      success: true,
      exists: !!adminUser,
      admin: adminUser ? {
        username: adminUser.username,
        email: adminUser.email,
        id: adminUser.id,
        createdAt: adminUser.createdAt,
      } : null,
    });
  } catch (error: any) {
    console.error('[SEED-ADMIN] Error checking admin:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to check admin user' },
      { status: 500 }
    );
  }
}
