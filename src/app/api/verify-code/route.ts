import { NextRequest, NextResponse } from 'next/server';
import { verifyCode, isValidVerificationCode, removeVerificationCode } from '@/lib/verification';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    // Validate input
    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Check if code is valid and not expired
    if (!isValidVerificationCode(email, code)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // In a real implementation, you would verify the hashed code here
    // For now, we'll just check if the code matches the stored one
    // This is a simplified version - in production, use proper hash verification
    
    // Remove the verification code after successful verification
    removeVerificationCode(email);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
