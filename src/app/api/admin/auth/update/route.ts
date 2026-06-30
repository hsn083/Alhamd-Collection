import { NextRequest, NextResponse } from 'next/server';
import { 
  getAdminUsers, 
  setAdminUsers, 
  addAuditLog,
  updateAdminUsername,
  updateAdminPassword,
  updateAdminEmail
} from '@/lib/admin-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// PUT - Update admin credentials
export async function PUT(request: NextRequest) {
  try {
    // Skip during build time
    if (process.env.NEXT_BUILD_PHASE === 'building') {
      return NextResponse.json({ success: false, error: 'Not available during build' }, { status: 503 });
    }

    const body = await request.json();
    const { adminId, currentPassword, updateType, newUsername, newPassword, newEmail, recoveryEmail } = body;
    
    if (!adminId || !currentPassword || !updateType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (updateType) {
      case 'username':
        if (!newUsername) {
          return NextResponse.json(
            { success: false, error: 'New username is required' },
            { status: 400 }
          );
        }
        result = await updateAdminUsername(adminId, currentPassword, newUsername);
        break;
        
      case 'password':
        if (!newPassword) {
          return NextResponse.json(
            { success: false, error: 'New password is required' },
            { status: 400 }
          );
        }
        result = await updateAdminPassword(adminId, currentPassword, newPassword);
        break;
        
      case 'email':
        if (!newEmail) {
          return NextResponse.json(
            { success: false, error: 'New email is required' },
            { status: 400 }
          );
        }
        result = await updateAdminEmail(adminId, currentPassword, newEmail, recoveryEmail);
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid update type' },
          { status: 400 }
        );
    }
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `${updateType.charAt(0).toUpperCase() + updateType.slice(1)} updated successfully` 
    });
  } catch (error: any) {
    console.error('Error updating admin credentials:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update credentials' },
      { status: 500 }
    );
  }
}
