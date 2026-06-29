import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email-service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    console.log('[AUTH-FORGOT-PASSWORD] Password reset request for email:', email);

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

    // Connect to database
    await connectDB();
    console.log('[AUTH-FORGOT-PASSWORD] Database connected');

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Don't reveal if email exists or not for security
    if (!user) {
      console.log('[AUTH-FORGOT-PASSWORD] Email not found:', email);
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set token to expire in 1 hour
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    // Save token to user
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    console.log('[AUTH-FORGOT-PASSWORD] Reset token generated for user:', user.email);

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetToken, user.name);
      console.log('[AUTH-FORGOT-PASSWORD] Password reset email sent to:', email);
    } catch (emailError) {
      console.error('[AUTH-FORGOT-PASSWORD] Failed to send password reset email:', emailError);
      // Still return success to not reveal email existence
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.',
    });
  } catch (error: any) {
    console.error('[AUTH-FORGOT-PASSWORD] Request error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to request password reset' },
      { status: 500 }
    );
  }
}
