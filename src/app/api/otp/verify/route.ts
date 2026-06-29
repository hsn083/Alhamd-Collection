import { NextRequest, NextResponse } from 'next/server';
import { isValidVerificationCode, removeVerificationCode } from '@/lib/verification';

// Normalize email for consistency
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - Verify OTP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;
    
    console.log(`[OTP-VERIFY] Received verification request for email: ${email}, OTP: ${otp}`);
    
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Email and OTP are required' },
        { status: 400 }
      );
    }
    
    // Normalize email
    const normalizedEmail = normalizeEmail(email);
    console.log(`[OTP-VERIFY] Normalized email: ${normalizedEmail} (original: ${email})`);
    
    // Validate OTP format (6 digits)
    if (!/^[0-9]{6}$/.test(otp)) {
      console.log(`[OTP-VERIFY] Invalid OTP format: ${otp}`);
      return NextResponse.json(
        { success: false, error: 'Invalid OTP format. Must be 6 digits.' },
        { status: 400 }
      );
    }
    
    // Verify OTP using the new verification system
    const result = await isValidVerificationCode(normalizedEmail, otp);
    
    if (result.valid) {
      // Remove the code after successful verification
      await removeVerificationCode(normalizedEmail);
      console.log(`[OTP-VERIFY] OTP verified successfully for ${normalizedEmail}`);
      
      return NextResponse.json({
        success: true,
        message: 'OTP verified successfully',
      });
    } else {
      console.log(`[OTP-VERIFY] OTP verification failed for ${normalizedEmail}: ${result.reason}`);
      return NextResponse.json(
        { success: false, error: result.reason || 'Invalid or expired OTP. Please request a new code.' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('[OTP-VERIFY] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
