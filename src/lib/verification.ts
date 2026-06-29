import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import OTP from '@/models/OTP';

// Normalize email for consistent storage and retrieval
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Track pending requests to prevent duplicate sends (in-memory is fine for dedup)
const pendingRequests = new Map<string, Promise<boolean>>();

// Track last sent timestamps for cooldown (in-memory for simplicity, can be moved to Redis if needed)
const lastSentTimestamps = new Map<string, number>();

// Track rate limits (in-memory for simplicity, can be moved to Redis if needed)
const rateLimitRecords = new Map<string, { count: number; resetTime: number }>();

const RESEND_COOLDOWN_MS = 10 * 1000; // 10 seconds
const CODE_EXPIRY_MS = 1 * 60 * 1000; // 1 minute

// Generate a 6-digit verification code
export function generateVerificationCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000);
  return String(code).padStart(6, '0');
}

// Hash verification code for security
export async function hashVerificationCode(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

// Verify code against hash
export async function verifyCode(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

// Store verification code with expiration in MongoDB
export async function storeVerificationCode(
  email: string,
  code: string,
  hashedCode: string,
  orderId?: string
): Promise<void> {
  const normalizedEmail = normalizeEmail(email);
  const now = Date.now();
  const expiresAt = new Date(now + CODE_EXPIRY_MS);
  
  // Ensure code is stored as string
  const codeString = String(code).trim();
  
  try {
    await connectDB();
    
    // Delete any existing unused codes for this email (ensures only latest is valid)
    await OTP.deleteMany({
      email: normalizedEmail,
      isUsed: false,
      type: 'email_verification'
    });
    
    // Store the new code in MongoDB
    await OTP.create({
      email: normalizedEmail,
      code: hashedCode,
      type: 'email_verification',
      expiresAt,
      isUsed: false,
    });
    
    // Update last sent timestamp for cooldown
    lastSentTimestamps.set(normalizedEmail, now);
    
    console.log(`[OTP] Stored new code for ${normalizedEmail} (original: ${email}), expires at ${expiresAt.toISOString()}`);
    console.log(`[OTP] Generated OTP: ${codeString}`);
  } catch (error) {
    console.error('[OTP] Error storing code in MongoDB:', error);
    throw error;
  }
}

// Check if verification code is valid and not expired (async for hash verification)
export async function isValidVerificationCode(email: string, code: string): Promise<{ valid: boolean; reason?: string }> {
  const normalizedEmail = normalizeEmail(email);
  const startTime = Date.now();
  
  try {
    await connectDB();
    
    console.log(`[OTP] Validation attempt for ${normalizedEmail} (original: ${email}) at ${new Date(startTime).toISOString()}`);
    
    // Find the latest unused OTP for this email
    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      type: 'email_verification',
      isUsed: false,
    }).sort({ createdAt: -1 });
    
    if (!otpRecord) {
      console.log(`[OTP] No code found for ${normalizedEmail}`);
      return { valid: false, reason: 'No OTP found for this email. Please request a new code.' };
    }
    
    // Ensure code is a string (handle potential number input)
    const codeString = String(code).trim();
    console.log(`[OTP] Entered OTP: "${codeString}"`);
    console.log(`[OTP] Stored code expires at: ${otpRecord.expiresAt.toISOString()}`);
    console.log(`[OTP] Stored code created at: ${otpRecord.createdAt.toISOString()}`);
    
    // Check if expired
    const now = new Date();
    if (now > otpRecord.expiresAt) {
      const timeExpired = now.getTime() - otpRecord.expiresAt.getTime();
      console.log(`[OTP] Code expired for ${normalizedEmail} by ${timeExpired}ms`);
      
      // Mark as used and delete expired
      await OTP.deleteOne({ _id: otpRecord._id });
      lastSentTimestamps.delete(normalizedEmail);
      
      return { valid: false, reason: 'OTP has expired. Please request a new code.' };
    }
    
    console.log(`[OTP] Code not expired, time remaining: ${otpRecord.expiresAt.getTime() - now.getTime()}ms`);
    
    // Verify the code against the stored hash
    const isMatch = await bcrypt.compare(codeString, otpRecord.code);
    const validationTime = Date.now() - startTime;
    
    if (!isMatch) {
      console.log(`[OTP] Invalid code for ${normalizedEmail} (validation took ${validationTime}ms)`);
      return { valid: false, reason: 'Invalid OTP. Please check the code and try again.' };
    }
    
    console.log(`[OTP] Valid code for ${normalizedEmail} (validation took ${validationTime}ms)`);
    return { valid: true };
  } catch (error) {
    console.error('[OTP] Error validating code:', error);
    return { valid: false, reason: 'Error validating OTP. Please try again.' };
  }
}

// Remove verification code after use
export async function removeVerificationCode(email: string): Promise<void> {
  const normalizedEmail = normalizeEmail(email);
  
  try {
    await connectDB();
    
    // Mark the latest OTP as used
    await OTP.updateOne(
      {
        email: normalizedEmail,
        type: 'email_verification',
        isUsed: false,
      },
      { isUsed: true }
    );
    
    // Also delete it to keep collection clean
    await OTP.deleteMany({
      email: normalizedEmail,
      type: 'email_verification',
      isUsed: false,
    });
    
    lastSentTimestamps.delete(normalizedEmail);
    
    console.log(`[OTP] Removed code for ${normalizedEmail}`);
  } catch (error) {
    console.error('[OTP] Error removing code:', error);
  }
}

// Check if resend is allowed (10-second cooldown)
export function canResendCode(email: string): { allowed: boolean; remainingTime: number } {
  const normalizedEmail = normalizeEmail(email);
  const lastSent = lastSentTimestamps.get(normalizedEmail);
  const now = Date.now();
  
  if (!lastSent) {
    return { allowed: true, remainingTime: 0 };
  }
  
  const timeSinceLastSend = now - lastSent;
  const remainingTime = Math.max(0, RESEND_COOLDOWN_MS - timeSinceLastSend);
  
  return {
    allowed: remainingTime === 0,
    remainingTime: Math.ceil(remainingTime / 1000), // return in seconds
  };
}

// Rate limiting: Check if too many requests from same email
export function checkRateLimit(email: string, maxRequests: number = 5, windowMs: number = 300000): boolean {
  const normalizedEmail = normalizeEmail(email);
  const now = Date.now();
  const record = rateLimitRecords.get(normalizedEmail);
  
  if (!record || now > record.resetTime) {
    rateLimitRecords.set(normalizedEmail, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// Clean up expired codes in MongoDB (run periodically)
export async function cleanupExpiredCodes(): Promise<void> {
  try {
    await connectDB();
    
    const now = new Date();
    const result = await OTP.deleteMany({
      expiresAt: { $lt: now },
    });
    
    if (result.deletedCount > 0) {
      console.log(`[OTP] Cleaned up ${result.deletedCount} expired codes`);
    }
  } catch (error) {
    console.error('[OTP] Error cleaning up expired codes:', error);
  }
}

// Clean up expired rate limit records
export function cleanupRateLimits(): void {
  const now = Date.now();
  let cleaned = false;
  
  for (const [email, data] of rateLimitRecords.entries()) {
    if (now > data.resetTime) {
      rateLimitRecords.delete(email);
      cleaned = true;
    }
  }
  
  if (cleaned) {
    console.log('[OTP] Cleaned up expired rate limit records');
  }
  
  // Clean up old last sent timestamps (older than 10 minutes)
  let lastSentCleaned = false;
  for (const [email, timestamp] of lastSentTimestamps.entries()) {
    if (now - timestamp > 10 * 60 * 1000) {
      lastSentTimestamps.delete(email);
      lastSentCleaned = true;
    }
  }
  
  if (lastSentCleaned) {
    console.log('[OTP] Cleaned up old last sent timestamps');
  }
}

// Run cleanup every 1 minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cleanupExpiredCodes();
    cleanupRateLimits();
  }, 1 * 60 * 1000);
}

// Deduplication: Prevent duplicate email sends for the same request
export function setPendingRequest(email: string, promise: Promise<boolean>): void {
  const normalizedEmail = normalizeEmail(email);
  pendingRequests.set(normalizedEmail, promise);
  
  // Clean up after promise resolves
  promise.finally(() => {
    setTimeout(() => {
      pendingRequests.delete(normalizedEmail);
    }, 1000);
  });
}

export function getPendingRequest(email: string): Promise<boolean> | undefined {
  const normalizedEmail = normalizeEmail(email);
  return pendingRequests.get(normalizedEmail);
}

export function hasPendingRequest(email: string): boolean {
  const normalizedEmail = normalizeEmail(email);
  return pendingRequests.has(normalizedEmail);
}
