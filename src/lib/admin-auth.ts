// Admin user storage and authentication utilities
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  email: string;
  recoveryEmail?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  passwordResetToken?: string;
  passwordResetExpires?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  adminId: string;
  adminUsername: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// File paths
const DATA_DIR = path.join(process.cwd(), 'data');
const ADMIN_USERS_FILE = path.join(DATA_DIR, 'admin-users.json');
const AUDIT_LOGS_FILE = path.join(DATA_DIR, 'audit-logs.json');

// Default admin user (will be created if no users exist)
const DEFAULT_ADMIN: Omit<AdminUser, 'id' | 'passwordHash' | 'createdAt' | 'updatedAt'> = {
  username: 'admin',
  email: 'admin@alhamdcollection.pk',
  recoveryEmail: 'admin@alhamdcollection.pk',
};

// Ensure data directory exists
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Get admin users from file
export function getAdminUsers(): AdminUser[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(ADMIN_USERS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(ADMIN_USERS_FILE, 'utf-8');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading admin users:', error);
    return [];
  }
}

// Save admin users to file
export function setAdminUsers(users: AdminUser[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(ADMIN_USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving admin users:', error);
  }
}

// Get audit logs from file
export function getAuditLogs(): AuditLog[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(AUDIT_LOGS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(AUDIT_LOGS_FILE, 'utf-8');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading audit logs:', error);
    return [];
  }
}

// Save audit logs to file
export function setAuditLogs(logs: AuditLog[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(AUDIT_LOGS_FILE, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('Error saving audit logs:', error);
  }
}

// Add audit log entry
export function addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    ...log,
    id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newLog); // Add to beginning
  
  // Keep only last 1000 logs
  if (logs.length > 1000) {
    logs.splice(1000);
  }
  
  setAuditLogs(logs);
}

// Initialize default admin user if no users exist
export async function initializeDefaultAdmin(): Promise<void> {
  const users = getAdminUsers();
  console.log('[ADMIN-AUTH] Checking for existing admin users:', users.length);
  
  if (users.length === 0) {
    console.log('[ADMIN-AUTH] No admin users found, creating default admin');
    const passwordHash = await bcrypt.hash('admin123', 10);
    const defaultAdmin: AdminUser = {
      ...DEFAULT_ADMIN,
      id: `ADMIN-${Date.now()}`,
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAdminUsers([defaultAdmin]);
    console.log('[ADMIN-AUTH] Default admin user created successfully');
  } else {
    console.log('[ADMIN-AUTH] Admin users already exist, skipping creation');
  }
}

// Verify admin credentials
export async function verifyAdminCredentials(username: string, password: string): Promise<AdminUser | null> {
  const users = getAdminUsers();
  const user = users.find((u) => u.username === username);
  
  if (!user) return null;
  
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;
  
  // Update last login
  user.lastLogin = new Date().toISOString();
  setAdminUsers(users);
  
  return user;
}

// Update admin username
export async function updateAdminUsername(
  adminId: string,
  currentPassword: string,
  newUsername: string
): Promise<{ success: boolean; error?: string }> {
  const users = getAdminUsers();
  const userIndex = users.findIndex((u) => u.id === adminId);
  
  if (userIndex === -1) {
    return { success: false, error: 'Admin user not found' };
  }
  
  const user = users[userIndex];
  
  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    return { success: false, error: 'Current password is incorrect' };
  }
  
  // Check if new username already exists
  const usernameExists = users.some((u) => u.username === newUsername && u.id !== adminId);
  if (usernameExists) {
    return { success: false, error: 'Username already exists' };
  }
  
  const oldUsername = user.username;
  user.username = newUsername;
  user.updatedAt = new Date().toISOString();
  users[userIndex] = user;
  setAdminUsers(users);
  
  // Add audit log
  addAuditLog({
    action: 'USERNAME_CHANGED',
    adminId: user.id,
    adminUsername: oldUsername,
    details: `Username changed from "${oldUsername}" to "${newUsername}"`,
  });
  
  return { success: true };
}

// Update admin password
export async function updateAdminPassword(
  adminId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const users = getAdminUsers();
  const userIndex = users.findIndex((u) => u.id === adminId);
  
  if (userIndex === -1) {
    return { success: false, error: 'Admin user not found' };
  }
  
  const user = users[userIndex];
  
  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    return { success: false, error: 'Current password is incorrect' };
  }
  
  // Validate new password
  if (newPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' };
  }
  
  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 10);
  user.passwordHash = passwordHash;
  user.updatedAt = new Date().toISOString();
  users[userIndex] = user;
  setAdminUsers(users);
  
  // Add audit log
  addAuditLog({
    action: 'PASSWORD_CHANGED',
    adminId: user.id,
    adminUsername: user.username,
    details: 'Password changed successfully',
  });
  
  return { success: true };
}

// Update admin email
export async function updateAdminEmail(
  adminId: string,
  currentPassword: string,
  newEmail: string,
  recoveryEmail?: string
): Promise<{ success: boolean; error?: string }> {
  const users = getAdminUsers();
  const userIndex = users.findIndex((u) => u.id === adminId);
  
  if (userIndex === -1) {
    return { success: false, error: 'Admin user not found' };
  }
  
  const user = users[userIndex];
  
  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    return { success: false, error: 'Current password is incorrect' };
  }
  
  const oldEmail = user.email;
  user.email = newEmail;
  if (recoveryEmail) {
    user.recoveryEmail = recoveryEmail;
  }
  user.updatedAt = new Date().toISOString();
  users[userIndex] = user;
  setAdminUsers(users);
  
  // Add audit log
  addAuditLog({
    action: 'EMAIL_CHANGED',
    adminId: user.id,
    adminUsername: user.username,
    details: `Email changed from "${oldEmail}" to "${newEmail}"`,
  });
  
  return { success: true };
}
