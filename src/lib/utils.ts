import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes a Pakistan phone number to a standard format
 * Handles various input formats:
 * - 03001111111 (local format)
 * - +923001111111 (international with +)
 * - 923001111111 (international without +)
 * - 0300-1111111 (with hyphens)
 * - +92 300 1111111 (with spaces)
 * - (0300)1111111 (with parentheses)
 * 
 * Returns normalized format: 923001111111
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with 92 (Pakistan country code)
  if (normalized.startsWith('0')) {
    normalized = '92' + normalized.substring(1);
  }
  
  // If already starts with 92, keep it
  // If it's just a number without country code, assume Pakistan (92)
  if (!normalized.startsWith('92') && normalized.length === 10) {
    normalized = '92' + normalized;
  }
  
  return normalized;
}

/**
 * Detects if input is likely a phone number
 * Returns true if input looks like a phone number (contains mostly digits)
 */
export function isPhoneNumber(input: string): boolean {
  if (!input) return false;
  const digits = input.replace(/\D/g, '');
  // Pakistan phone numbers are typically 10-13 digits (including country code)
  return digits.length >= 10 && digits.length <= 13 && 
         /^\d+$/.test(digits) && 
         (digits.startsWith('0') || digits.startsWith('92') || digits.startsWith('0092'));
}

/**
 * Detects if input is likely an email address
 */
export function isEmail(input: string): boolean {
  if (!input) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
}

/**
 * Detects if input is likely an order number (ORD-...)
 */
export function isOrderNumber(input: string): boolean {
  if (!input) return false;
  return input.toUpperCase().startsWith('ORD-');
}

/**
 * Detects if input is likely a MongoDB ObjectId (24 hex characters)
 */
export function isObjectId(input: string): boolean {
  if (!input) return false;
  return /^[0-9A-F]{24}$/i.test(input);
}
