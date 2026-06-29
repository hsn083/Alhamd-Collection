import { NextRequest, NextResponse } from 'next/server';
import { 
  generateVerificationCode, 
  hashVerificationCode, 
  storeVerificationCode,
  removeVerificationCode,
  canResendCode,
  checkRateLimit,
  hasPendingRequest,
  setPendingRequest
} from '@/lib/verification';

// Normalize email for consistency
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
import { sendOTPEmail } from '@/lib/email-service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - Send OTP to email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, orderId } = body;
    
    console.log(`[OTP-SEND] Received request for email: ${email}, orderId: ${orderId}`);
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Normalize email
    const normalizedEmail = normalizeEmail(email);
    console.log(`[OTP-SEND] Normalized email: ${normalizedEmail} (original: ${email})`);
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Check for pending request (deduplication)
    if (hasPendingRequest(normalizedEmail)) {
      console.log(`[OTP-SEND] Pending request exists for ${normalizedEmail}`);
      return NextResponse.json(
        { success: false, error: 'Please wait, email is being sent' },
        { status: 429 }
      );
    }
    
    // Check resend cooldown
    const cooldownCheck = canResendCode(normalizedEmail);
    if (!cooldownCheck.allowed) {
      console.log(`[OTP-SEND] Cooldown active for ${normalizedEmail}, remaining: ${cooldownCheck.remainingTime}s`);
      return NextResponse.json(
        { 
          success: false, 
          error: `Please wait ${cooldownCheck.remainingTime} seconds before requesting a new code`,
          cooldownRemaining: cooldownCheck.remainingTime
        },
        { status: 429 }
      );
    }
    
    // Check rate limit
    if (!checkRateLimit(normalizedEmail)) {
      console.log(`[OTP-SEND] Rate limit exceeded for ${normalizedEmail}`);
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Generate OTP
    const otp = generateVerificationCode();
    console.log(`[OTP-SEND] Generated OTP: ${otp} for ${normalizedEmail}`);
    
    const hashedCode = await hashVerificationCode(otp);
    
    // Store OTP with timestamp (this automatically invalidates any previous OTP)
    await storeVerificationCode(normalizedEmail, otp, hashedCode, orderId);
    
    // Create email send promise and track it for deduplication
    const emailPromise = sendOTPEmail(normalizedEmail, otp, orderId).then(result => {
      if (result.success) {
        console.log(`[OTP-SEND] Email sent successfully to ${normalizedEmail}`);
      } else {
        console.error(`[OTP-SEND] Failed to send email to ${normalizedEmail}:`, result.error);
      }
      return result.success;
    });
    
    setPendingRequest(normalizedEmail, emailPromise);
    
    // Send OTP email
    const emailResult = await emailPromise;
    
    if (!emailResult) {
      // Remove the stored code if email failed
      await removeVerificationCode(normalizedEmail);
      console.log(`[OTP-SEND] Email send failed, removed code for ${normalizedEmail}`);
      return NextResponse.json(
        { success: false, error: 'Failed to send OTP email. Please try again.' },
        { status: 500 }
      );
    }
    
    console.log(`[OTP-SEND] OTP sent successfully to ${normalizedEmail}`);
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 60, // 1 minute in seconds
      cooldownRemaining: 10, // 10 seconds cooldown
    });
  } catch (error: any) {
    console.error('[OTP-SEND] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
