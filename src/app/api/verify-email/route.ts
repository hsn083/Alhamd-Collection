import { NextRequest, NextResponse } from 'next/server';
import { generateVerificationCode, hashVerificationCode, storeVerificationCode, checkRateLimit } from '@/lib/verification';
import { sendVerificationCode } from '@/lib/email';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    // Validate email
    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: 'Email and name are required' },
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

    // Check rate limit
    if (!checkRateLimit(email, 3, 60000)) {
      return NextResponse.json(
        { success: false, error: 'Too many verification requests. Please wait 1 minute.' },
        { status: 429 }
      );
    }

    // Generate verification code
    const code = generateVerificationCode();
    const hashedCode = await hashVerificationCode(code);

    // Store verification code
    storeVerificationCode(email, code, hashedCode);

    // Send verification email
    const emailSent = await sendVerificationCode(email, code, name);

    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully'
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
