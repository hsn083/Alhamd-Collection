import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Customer user interfaces
export interface CustomerUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  emailVerified: boolean;
  provider: 'manual' | 'google' | 'facebook';
  providerId?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
  isBlocked?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  used: boolean;
}

export interface EmailVerificationToken {
  id: string;
  userId: string;
  otp: string;
  expiresAt: string;
  createdAt: string;
  verified: boolean;
}

// File paths
const DATA_DIR = path.join(process.cwd(), 'data');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'customer-sessions.json');
const PASSWORD_RESET_FILE = path.join(DATA_DIR, 'password-reset-tokens.json');
const EMAIL_VERIFICATION_FILE = path.join(DATA_DIR, 'email-verification-tokens.json');

// Ensure data directory exists
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Normalize email for consistency
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Generate unique ID
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate secure token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// ===== CUSTOMER USERS =====

export function getCustomers(): CustomerUser[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(CUSTOMERS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(CUSTOMERS_FILE, 'utf-8');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading customers:', error);
    return [];
  }
}

export function setCustomers(users: CustomerUser[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving customers:', error);
  }
}

export function getCustomerByEmail(email: string): CustomerUser | null {
  const normalizedEmail = normalizeEmail(email);
  const users = getCustomers();
  return users.find((u) => u.email === normalizedEmail) || null;
}

export function getCustomerById(id: string): CustomerUser | null {
  const users = getCustomers();
  return users.find((u) => u.id === id) || null;
}

export async function createCustomer(data: {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  provider?: 'manual' | 'google' | 'facebook';
  providerId?: string;
}): Promise<{ success: boolean; user?: CustomerUser; error?: string }> {
  const normalizedEmail = normalizeEmail(data.email);
  
  // Check if email already exists
  const existingUser = getCustomerByEmail(normalizedEmail);
  if (existingUser) {
    return { success: false, error: 'Email already registered' };
  }

  // Hash password
  const passwordHash = await bcrypt.hash(data.password, 10);

  const newUser: CustomerUser = {
    id: generateId('CUST'),
    fullName: data.fullName,
    email: normalizedEmail,
    phone: data.phone,
    passwordHash,
    role: 'customer',
    emailVerified: false,
    provider: data.provider || 'manual',
    providerId: data.providerId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    failedLoginAttempts: 0,
  };

  const users = getCustomers();
  users.push(newUser);
  setCustomers(users);

  console.log(`[CUSTOMER-AUTH] Created new customer: ${normalizedEmail}`);
  return { success: true, user: newUser };
}

export async function verifyCustomerCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; user?: CustomerUser; error?: string }> {
  const normalizedEmail = normalizeEmail(email);
  const users = getCustomers();
  const userIndex = users.findIndex((u) => u.email === normalizedEmail);

  if (userIndex === -1) {
    return { success: false, error: 'Invalid email or password' };
  }

  const user = users[userIndex];

  // Check if account is locked
  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    return { success: false, error: 'Account is temporarily locked due to multiple failed attempts' };
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    // Increment failed attempts
    user.failedLoginAttempts++;
    
    // Lock account after 5 failed attempts for 15 minutes
    if (user.failedLoginAttempts >= 5) {
      user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    }
    
    users[userIndex] = user;
    setCustomers(users);
    
    return { success: false, error: 'Invalid email or password' };
  }

  // Reset failed attempts on successful login
  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;
  user.lastLogin = new Date().toISOString();
  user.updatedAt = new Date().toISOString();
  
  users[userIndex] = user;
  setCustomers(users);

  console.log(`[CUSTOMER-AUTH] Customer logged in: ${normalizedEmail}`);
  return { success: true, user };
}

export function updateCustomer(
  userId: string,
  updates: Partial<Omit<CustomerUser, 'id' | 'passwordHash' | 'createdAt'>>
): { success: boolean; error?: string } {
  const users = getCustomers();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return { success: false, error: 'User not found' };
  }

  const user = users[userIndex];
  const updatedUser = {
    ...user,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  users[userIndex] = updatedUser;
  setCustomers(users);

  console.log(`[CUSTOMER-AUTH] Updated customer: ${userId}`);
  return { success: true };
}

export async function updateCustomerPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const users = getCustomers();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return { success: false, error: 'User not found' };
  }

  const user = users[userIndex];

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    return { success: false, error: 'Current password is incorrect' };
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 10);
  user.passwordHash = passwordHash;
  user.updatedAt = new Date().toISOString();

  users[userIndex] = user;
  setCustomers(users);

  console.log(`[CUSTOMER-AUTH] Password updated for: ${userId}`);
  return { success: true };
}

export function deleteCustomer(userId: string): { success: boolean; error?: string } {
  const users = getCustomers();
  const filteredUsers = users.filter((u) => u.id !== userId);

  if (filteredUsers.length === users.length) {
    return { success: false, error: 'User not found' };
  }

  setCustomers(filteredUsers);
  
  // Also delete all sessions for this user
  const sessions = getSessions();
  const filteredSessions = sessions.filter((s) => s.userId !== userId);
  setSessions(filteredSessions);

  console.log(`[CUSTOMER-AUTH] Deleted customer: ${userId}`);
  return { success: true };
}

export function setCustomerEmailVerified(userId: string, verified: boolean): void {
  const users = getCustomers();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex !== -1) {
    users[userIndex].emailVerified = verified;
    users[userIndex].updatedAt = new Date().toISOString();
    setCustomers(users);
    console.log(`[CUSTOMER-AUTH] Email verification set to ${verified} for: ${userId}`);
  }
}

// ===== SESSIONS =====

export function getSessions(): Session[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(SESSIONS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading sessions:', error);
    return [];
  }
}

export function setSessions(sessions: Session[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
  } catch (error) {
    console.error('Error saving sessions:', error);
  }
}

export function getSessionByToken(token: string): Session | null {
  const sessions = getSessions();
  const session = sessions.find((s) => s.token === token);
  
  if (!session) {
    return null;
  }

  // Check if expired
  if (new Date(session.expiresAt) < new Date()) {
    deleteSession(session.id);
    return null;
  }

  return session;
}

export function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string,
  expiresInDays: number = 30
): Session {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  const session: Session = {
    id: generateId('SESS'),
    userId,
    token,
    expiresAt,
    createdAt: new Date().toISOString(),
    ipAddress,
    userAgent,
  };

  const sessions = getSessions();
  sessions.push(session);
  setSessions(sessions);

  console.log(`[CUSTOMER-AUTH] Created session for user: ${userId}`);
  return session;
}

export function deleteSession(sessionId: string): void {
  const sessions = getSessions();
  const filteredSessions = sessions.filter((s) => s.id !== sessionId);
  setSessions(filteredSessions);
  console.log(`[CUSTOMER-AUTH] Deleted session: ${sessionId}`);
}

export function deleteAllUserSessions(userId: string): void {
  const sessions = getSessions();
  const filteredSessions = sessions.filter((s) => s.userId !== userId);
  setSessions(filteredSessions);
  console.log(`[CUSTOMER-AUTH] Deleted all sessions for user: ${userId}`);
}

export function cleanupExpiredSessions(): void {
  const sessions = getSessions();
  const now = new Date();
  const filteredSessions = sessions.filter((s) => new Date(s.expiresAt) > now);
  
  if (filteredSessions.length !== sessions.length) {
    setSessions(filteredSessions);
    console.log(`[CUSTOMER-AUTH] Cleaned up ${sessions.length - filteredSessions.length} expired sessions`);
  }
}

// ===== PASSWORD RESET TOKENS =====

export function getPasswordResetTokens(): PasswordResetToken[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(PASSWORD_RESET_FILE)) {
      return [];
    }
    const data = fs.readFileSync(PASSWORD_RESET_FILE, 'utf-8');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading password reset tokens:', error);
    return [];
  }
}

export function setPasswordResetTokens(tokens: PasswordResetToken[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(PASSWORD_RESET_FILE, JSON.stringify(tokens, null, 2));
  } catch (error) {
    console.error('Error saving password reset tokens:', error);
  }
}

export function createPasswordResetToken(userId: string, expiresInHours: number = 1): PasswordResetToken {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();

  const resetToken: PasswordResetToken = {
    id: generateId('RESET'),
    userId,
    token,
    expiresAt,
    createdAt: new Date().toISOString(),
    used: false,
  };

  const tokens = getPasswordResetTokens();
  // Delete any existing unused tokens for this user
  const filteredTokens = tokens.filter((t) => t.userId !== userId || t.used);
  filteredTokens.push(resetToken);
  setPasswordResetTokens(filteredTokens);

  console.log(`[CUSTOMER-AUTH] Created password reset token for user: ${userId}`);
  return resetToken;
}

export function getPasswordResetToken(token: string): PasswordResetToken | null {
  const tokens = getPasswordResetTokens();
  const resetToken = tokens.find((t) => t.token === token && !t.used);
  
  if (!resetToken) {
    return null;
  }

  // Check if expired
  if (new Date(resetToken.expiresAt) < new Date()) {
    return null;
  }

  return resetToken;
}

export function markPasswordResetTokenUsed(tokenId: string): void {
  const tokens = getPasswordResetTokens();
  const tokenIndex = tokens.findIndex((t) => t.id === tokenId);

  if (tokenIndex !== -1) {
    tokens[tokenIndex].used = true;
    setPasswordResetTokens(tokens);
    console.log(`[CUSTOMER-AUTH] Marked password reset token as used: ${tokenId}`);
  }
}

// ===== EMAIL VERIFICATION TOKENS =====

export function getEmailVerificationTokens(): EmailVerificationToken[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(EMAIL_VERIFICATION_FILE)) {
      return [];
    }
    const data = fs.readFileSync(EMAIL_VERIFICATION_FILE, 'utf-8');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading email verification tokens:', error);
    return [];
  }
}

export function setEmailVerificationTokens(tokens: EmailVerificationToken[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(EMAIL_VERIFICATION_FILE, JSON.stringify(tokens, null, 2));
  } catch (error) {
    console.error('Error saving email verification tokens:', error);
  }
}

export function createEmailVerificationToken(
  userId: string,
  otp: string,
  expiresInMinutes: number = 1
): EmailVerificationToken {
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

  const verificationToken: EmailVerificationToken = {
    id: generateId('VERIFY'),
    userId,
    otp,
    expiresAt,
    createdAt: new Date().toISOString(),
    verified: false,
  };

  const tokens = getEmailVerificationTokens();
  // Delete any existing unverified tokens for this user
  const filteredTokens = tokens.filter((t) => t.userId !== userId || t.verified);
  filteredTokens.push(verificationToken);
  setEmailVerificationTokens(filteredTokens);

  console.log(`[CUSTOMER-AUTH] Created email verification token for user: ${userId}`);
  return verificationToken;
}

export function getEmailVerificationToken(userId: string): EmailVerificationToken | null {
  const tokens = getEmailVerificationTokens();
  const token = tokens.find((t) => t.userId === userId && !t.verified);
  
  if (!token) {
    return null;
  }

  // Check if expired
  if (new Date(token.expiresAt) < new Date()) {
    return null;
  }

  return token;
}

export function verifyEmailOTP(userId: string, otp: string): boolean {
  const tokens = getEmailVerificationTokens();
  const tokenIndex = tokens.findIndex((t) => t.userId === userId && !t.verified && t.otp === otp);

  if (tokenIndex === -1) {
    return false;
  }

  const token = tokens[tokenIndex];

  // Check if expired
  if (new Date(token.expiresAt) < new Date()) {
    return false;
  }

  // Mark as verified
  token.verified = true;
  tokens[tokenIndex] = token;
  setEmailVerificationTokens(tokens);

  // Mark user email as verified
  setCustomerEmailVerified(userId, true);

  console.log(`[CUSTOMER-AUTH] Email verified for user: ${userId}`);
  return true;
}

// ===== CLEANUP =====

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cleanupExpiredSessions();
  }, 5 * 60 * 1000);
}
