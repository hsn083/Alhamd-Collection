import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// File-based storage for verification codes (persistent across serverless function calls)
interface VerificationCodeData {
  code: string; // hashed code
  expiresAt: number;
  email: string;
  orderId?: string;
  createdAt: number;
  lastSentAt: number;
}

// Normalize email for consistent storage and retrieval
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// File paths
const DATA_DIR = path.join(process.cwd(), 'data');
const OTP_FILE = path.join(DATA_DIR, 'otp-codes.json');

// Ensure data directory exists
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Get OTP codes from file
function getVerificationCodes(): Map<string, VerificationCodeData> {
  try {
    ensureDataDir();
    if (!fs.existsSync(OTP_FILE)) {
      return new Map();
    }
    const data = fs.readFileSync(OTP_FILE, 'utf-8');
    const obj = JSON.parse(data);
    return new Map(Object.entries(obj));
  } catch (error) {
    console.error('[OTP] Error reading OTP codes:', error);
    return new Map();
  }
}

// Save OTP codes to file
function saveVerificationCodes(codes: Map<string, VerificationCodeData>): void {
  try {
    ensureDataDir();
    const obj = Object.fromEntries(codes);
    fs.writeFileSync(OTP_FILE, JSON.stringify(obj, null, 2));
  } catch (error) {
    console.error('[OTP] Error saving OTP codes:', error);
  }
}

// Track pending requests to prevent duplicate sends (in-memory is fine for dedup)
const pendingRequests = new Map<string, Promise<boolean>>();

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

// Store verification code with expiration and timestamp
export function storeVerificationCode(
  email: string,
  code: string,
  hashedCode: string,
  orderId?: string
): void {
  const normalizedEmail = normalizeEmail(email);
  const now = Date.now();
  const expiresAt = now + CODE_EXPIRY_MS;
  
  // Ensure code is stored as string
  const codeString = String(code).trim();
  
  // Get current codes from file
  const verificationCodes = getVerificationCodes();
  
  // Delete any existing code for this email (ensures only latest is valid)
  verificationCodes.delete(normalizedEmail);
  
  // Store the new code
  verificationCodes.set(normalizedEmail, {
    code: hashedCode,
    expiresAt,
    email: normalizedEmail,
    orderId,
    createdAt: now,
    lastSentAt: now,
  });
  
  // Save to file
  saveVerificationCodes(verificationCodes);
  
  // Update last sent timestamp for cooldown (also file-based)
  const lastSentMap = getLastSentMap();
  lastSentMap.set(normalizedEmail, now);
  saveLastSentMap(lastSentMap);
  
  console.log(`[OTP] Stored new code for ${normalizedEmail} (original: ${email}), expires at ${new Date(expiresAt).toISOString()}`);
  console.log(`[OTP] Generated OTP: ${codeString}`);
  console.log(`[OTP] Total stored codes: ${verificationCodes.size}`);
}

// Check if verification code is valid and not expired (async for hash verification)
export async function isValidVerificationCode(email: string, code: string): Promise<{ valid: boolean; reason?: string }> {
  const normalizedEmail = normalizeEmail(email);
  const startTime = Date.now();
  
  // Get codes from file
  const verificationCodes = getVerificationCodes();
  
  console.log(`[OTP] Validation attempt for ${normalizedEmail} (original: ${email}) at ${new Date(startTime).toISOString()}`);
  console.log(`[OTP] Total stored codes: ${verificationCodes.size}`);
  console.log(`[OTP] Stored emails: ${Array.from(verificationCodes.keys()).join(', ')}`);
  
  const stored = verificationCodes.get(normalizedEmail);
  if (!stored) {
    console.log(`[OTP] No code found for ${normalizedEmail}`);
    console.log(`[OTP] Available keys: ${Array.from(verificationCodes.keys()).join(', ')}`);
    return { valid: false, reason: 'No OTP found for this email. Please request a new code.' };
  }
  
  // Ensure code is a string (handle potential number input)
  const codeString = String(code).trim();
  console.log(`[OTP] Entered OTP: "${codeString}"`);
  console.log(`[OTP] Stored code expires at: ${new Date(stored.expiresAt).toISOString()}`);
  console.log(`[OTP] Stored code created at: ${new Date(stored.createdAt).toISOString()}`);
  
  // Check if expired
  const now = Date.now();
  if (now > stored.expiresAt) {
    const timeExpired = now - stored.expiresAt;
    console.log(`[OTP] Code expired for ${normalizedEmail} by ${timeExpired}ms`);
    verificationCodes.delete(normalizedEmail);
    saveVerificationCodes(verificationCodes);
    const lastSentMap = getLastSentMap();
    lastSentMap.delete(normalizedEmail);
    saveLastSentMap(lastSentMap);
    return { valid: false, reason: 'OTP has expired. Please request a new code.' };
  }
  
  console.log(`[OTP] Code not expired, time remaining: ${stored.expiresAt - now}ms`);
  
  // Verify the code against the stored hash
  const isMatch = await bcrypt.compare(codeString, stored.code);
  const validationTime = Date.now() - startTime;
  
  if (!isMatch) {
    console.log(`[OTP] Invalid code for ${normalizedEmail} (validation took ${validationTime}ms)`);
    return { valid: false, reason: 'Invalid OTP. Please check the code and try again.' };
  }
  
  console.log(`[OTP] Valid code for ${normalizedEmail} (validation took ${validationTime}ms)`);
  return { valid: true };
}

// Remove verification code after use
export function removeVerificationCode(email: string): void {
  const normalizedEmail = normalizeEmail(email);
  const verificationCodes = getVerificationCodes();
  verificationCodes.delete(normalizedEmail);
  saveVerificationCodes(verificationCodes);
  
  const lastSentMap = getLastSentMap();
  lastSentMap.delete(normalizedEmail);
  saveLastSentMap(lastSentMap);
  
  console.log(`[OTP] Removed code for ${normalizedEmail}`);
}

// File-based last sent timestamps
const LAST_SENT_FILE = path.join(DATA_DIR, 'otp-last-sent.json');

function getLastSentMap(): Map<string, number> {
  try {
    ensureDataDir();
    if (!fs.existsSync(LAST_SENT_FILE)) {
      return new Map();
    }
    const data = fs.readFileSync(LAST_SENT_FILE, 'utf-8');
    const obj = JSON.parse(data);
    return new Map(Object.entries(obj));
  } catch (error) {
    console.error('[OTP] Error reading last sent map:', error);
    return new Map();
  }
}

function saveLastSentMap(map: Map<string, number>): void {
  try {
    ensureDataDir();
    const obj = Object.fromEntries(map);
    fs.writeFileSync(LAST_SENT_FILE, JSON.stringify(obj, null, 2));
  } catch (error) {
    console.error('[OTP] Error saving last sent map:', error);
  }
}

// Check if resend is allowed (10-second cooldown)
export function canResendCode(email: string): { allowed: boolean; remainingTime: number } {
  const normalizedEmail = normalizeEmail(email);
  const lastSentMap = getLastSentMap();
  const lastSent = lastSentMap.get(normalizedEmail);
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

// Rate limiting: Check if too many requests from same email (file-based)
const RATE_LIMIT_FILE = path.join(DATA_DIR, 'otp-rate-limit.json');

function getRateLimitMap(): Map<string, { count: number; resetTime: number }> {
  try {
    ensureDataDir();
    if (!fs.existsSync(RATE_LIMIT_FILE)) {
      return new Map();
    }
    const data = fs.readFileSync(RATE_LIMIT_FILE, 'utf-8');
    const obj = JSON.parse(data);
    const map = new Map<string, { count: number; resetTime: number }>();
    for (const [key, value] of Object.entries(obj)) {
      map.set(key, value as { count: number; resetTime: number });
    }
    return map;
  } catch (error) {
    console.error('[OTP] Error reading rate limit map:', error);
    return new Map();
  }
}

function saveRateLimitMap(map: Map<string, { count: number; resetTime: number }>): void {
  try {
    ensureDataDir();
    const obj = Object.fromEntries(map);
    fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(obj, null, 2));
  } catch (error) {
    console.error('[OTP] Error saving rate limit map:', error);
  }
}

export function checkRateLimit(email: string, maxRequests: number = 5, windowMs: number = 300000): boolean {
  const normalizedEmail = normalizeEmail(email);
  const now = Date.now();
  const rateLimitMap = getRateLimitMap();
  const record = rateLimitMap.get(normalizedEmail);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(normalizedEmail, { count: 1, resetTime: now + windowMs });
    saveRateLimitMap(rateLimitMap);
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  saveRateLimitMap(rateLimitMap);
  return true;
}

// Clean up expired codes (run periodically)
export function cleanupExpiredCodes(): void {
  const now = Date.now();
  const verificationCodes = getVerificationCodes();
  let cleaned = false;
  
  for (const [email, data] of verificationCodes.entries()) {
    if (now > data.expiresAt) {
      verificationCodes.delete(email);
      cleaned = true;
    }
  }
  
  if (cleaned) {
    saveVerificationCodes(verificationCodes);
  }
}

// Clean up expired rate limit records
export function cleanupRateLimits(): void {
  const now = Date.now();
  const rateLimitMap = getRateLimitMap();
  let cleaned = false;
  
  for (const [email, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(email);
      cleaned = true;
    }
  }
  
  if (cleaned) {
    saveRateLimitMap(rateLimitMap);
  }
  
  // Clean up old last sent timestamps (older than 10 minutes)
  const lastSentMap = getLastSentMap();
  let lastSentCleaned = false;
  for (const [email, timestamp] of lastSentMap.entries()) {
    if (now - timestamp > 10 * 60 * 1000) {
      lastSentMap.delete(email);
      lastSentCleaned = true;
    }
  }
  
  if (lastSentCleaned) {
    saveLastSentMap(lastSentMap);
  }
}

// Run cleanup every 1 minutes
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
