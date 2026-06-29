import { NextRequest, NextResponse } from 'next/server';
import { getCustomerByEmail, createPasswordResetToken, getPasswordResetToken, updateCustomerPassword } from '@/lib/customer-auth';
import { sendPasswordResetEmail } from '@/lib/email-service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    console.log('[AUTH-RESET-PASSWORD] Password reset request for email:', email);

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get user by email
    const user = getCustomerByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
      });
    }

    // Create password reset token
    const resetToken = createPasswordResetToken(user.id, 1); // 1 hour expiry

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetToken.token, user.fullName);
      console.log('[AUTH-RESET-PASSWORD] Password reset email sent to:', email);
    } catch (emailError) {
      console.error('[AUTH-RESET-PASSWORD] Failed to send password reset email:', emailError);
      return NextResponse.json(
        { success: false, error: 'Failed to send password reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.',
    });
  } catch (error: any) {
    console.error('[AUTH-RESET-PASSWORD] Request error:', error);
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
    const { token, newPassword, confirmPassword } = body;

    console.log('[AUTH-RESET-PASSWORD] Password reset attempt with token');

    // Validate required fields
    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { success: false, error: 'Password must contain at least one uppercase letter' },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { success: false, error: 'Password must contain at least one number' },
        { status: 400 }
      );
    }

    // Get reset token
    const resetTokenData = getPasswordResetToken(token);
    if (!resetTokenData) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Update password
    const result = await updateCustomerPassword(resetTokenData.userId, '', newPassword);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Mark token as used
    const { markPasswordResetTokenUsed } = await import('@/lib/customer-auth');
    markPasswordResetTokenUsed(resetTokenData.id);

    console.log('[AUTH-RESET-PASSWORD] Password reset successful for user:', resetTokenData.userId);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
    });
  } catch (error: any) {
    console.error('[AUTH-RESET-PASSWORD] Reset error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}
