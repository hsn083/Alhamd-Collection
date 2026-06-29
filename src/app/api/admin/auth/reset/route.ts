import { NextRequest, NextResponse } from 'next/server';
import { getAdminUsers, setAdminUsers, addAuditLog } from '@/lib/admin-auth';
import bcrypt from 'bcryptjs';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }
    
    const users = getAdminUsers();
    const user = users.find((u) => u.email === email || u.recoveryEmail === email);
    
    if (!user) {
      // Don't reveal if email exists for security
      return NextResponse.json({ 
        success: true, 
        message: 'If the email exists, a password reset link has been sent' 
      });
    }
    
    // Generate reset token (valid for 1 hour)
    const resetToken = Math.random().toString(36).substr(2, 32);
    const resetExpires = new Date(Date.now() + 3600000).toISOString();
    
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    setAdminUsers(users);
    
    // Add audit log
    addAuditLog({
      action: 'PASSWORD_RESET_REQUESTED',
      adminId: user.id,
      adminUsername: user.username,
      details: `Password reset requested for email ${email}`,
    });
    
    // In production, send email with reset link
    // For now, return the token for testing
    return NextResponse.json({ 
      success: true, 
      message: 'Password reset link sent to email',
      resetToken // Remove in production
    });
  } catch (error: any) {
    console.error('Error requesting password reset:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to request password reset' },
      { status: 500 }
    );
  }
}

// PUT - Reset password with token
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;
    
    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Token and new password are required' },
        { status: 400 }
      );
    }
    
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }
    
    const users = getAdminUsers();
    const userIndex = users.findIndex((u) => u.passwordResetToken === token);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }
    
    const user = users[userIndex];
    
    // Check if token is expired
    if (user.passwordResetExpires && new Date(user.passwordResetExpires) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Reset token has expired' },
        { status: 400 }
      );
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.updatedAt = new Date().toISOString();
    delete user.passwordResetToken;
    delete user.passwordResetExpires;
    
    users[userIndex] = user;
    setAdminUsers(users);
    
    // Add audit log
    addAuditLog({
      action: 'PASSWORD_RESET_COMPLETED',
      adminId: user.id,
      adminUsername: user.username,
      details: 'Password reset completed via reset link',
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Password reset successfully' 
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}
