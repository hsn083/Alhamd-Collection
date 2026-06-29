// OTP Generation and Validation Library

export interface OTPData {
  email: string;
  otp: string;
  expiresAt: string;
  attempts: number;
  orderId?: string;
}

const STORAGE_KEY = 'alhamdcollection_otp_data';

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP data in localStorage
export function storeOTP(data: OTPData): void {
  if (typeof window === 'undefined') return;
  
  const otpData = getOTPStorage();
  otpData[data.email] = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(otpData));
}

// Get OTP storage
export function getOTPStorage(): { [email: string]: OTPData } {
  if (typeof window === 'undefined') return {};
  
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

// Get OTP data for an email
export function getOTPData(email: string): OTPData | null {
  const storage = getOTPStorage();
  const data = storage[email];
  
  if (!data) return null;
  
  // Check if OTP is expired
  if (new Date(data.expiresAt) < new Date()) {
    deleteOTP(email);
    return null;
  }
  
  return data;
}

// Verify OTP
export function verifyOTP(email: string, otp: string): { success: boolean; error?: string } {
  const data = getOTPData(email);
  
  if (!data) {
    return { success: false, error: 'OTP expired or not found. Please request a new OTP.' };
  }
  
  if (data.attempts >= 3) {
    deleteOTP(email);
    return { success: false, error: 'Too many failed attempts. Please request a new OTP.' };
  }
  
  if (data.otp !== otp) {
    // Increment attempts
    const storage = getOTPStorage();
    data.attempts += 1;
    storage[email] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    
    const remainingAttempts = 3 - data.attempts;
    return { 
      success: false, 
      error: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.` 
    };
  }
  
  // OTP is valid, delete it
  deleteOTP(email);
  return { success: true };
}

// Delete OTP data
export function deleteOTP(email: string): void {
  if (typeof window === 'undefined') return;
  
  const storage = getOTPStorage();
  delete storage[email];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

// Check if OTP exists and is valid
export function hasValidOTP(email: string): boolean {
  return getOTPData(email) !== null;
}

// Get remaining time in seconds
export function getOTPTimeRemaining(email: string): number {
  const data = getOTPData(email);
  if (!data) return 0;
  
  const expiresAt = new Date(data.expiresAt).getTime();
  const now = new Date().getTime();
  const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
  
  return remaining;
}
