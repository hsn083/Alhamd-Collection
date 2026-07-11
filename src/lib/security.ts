// Input sanitization (server-safe, no DOMPurify)
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  // Trim and remove potentially dangerous characters
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return '';
  // For server-side, escape HTML to prevent XSS
  // If HTML is needed, use a client-side component with DOMPurify
  return escapeHtml(html);
}

// Input validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,20}$/;
  return phoneRegex.test(phone);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateMongoId(id: string): boolean {
  const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
  return mongoIdRegex.test(id);
}

// XSS Protection
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// SQL Injection Prevention (for MongoDB)
export function sanitizeMongoQuery(query: any): any {
  if (typeof query === 'string') {
    return sanitizeInput(query);
  }
  
  if (Array.isArray(query)) {
    return query.map(sanitizeMongoQuery);
  }
  
  if (typeof query === 'object' && query !== null) {
    const sanitized: any = {};
    for (const key in query) {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      sanitized[key] = sanitizeMongoQuery(query[key]);
    }
    return sanitized;
  }
  
  return query;
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Rate limiting key generator
export function generateRateLimitKey(identifier: string, action: string): string {
  return `${identifier}:${action}`;
}

// Content Security Policy
export function getCSPHeaders() {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://checkout.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.stripe.com https://checkout.stripe.com",
      "frame-src 'self' https://checkout.stripe.com https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "block-all-mixed-content",
      "upgrade-insecure-requests",
    ].join('; '),
  };
}

// Secure headers
export function getSecureHeaders() {
  return {
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'X-XSS-Protection': '1; mode=block',
  };
}
