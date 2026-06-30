import { NextRequest, NextResponse } from 'next/server';
import { 
  getAdminUsers, 
  setAdminUsers, 
  getAuditLogs, 
  setAuditLogs,
  addAuditLog,
  initializeDefaultAdmin 
} from '@/lib/admin-auth';
import bcrypt from 'bcryptjs';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Initialize default admin on first load
let initialized = false;

async function ensureInitialized() {
  // Skip initialization during build time
  if (process.env.NEXT_BUILD_PHASE === 'building') {
    return;
  }
  if (!initialized) {
    await initializeDefaultAdmin();
    initialized = true;
  }
}

// GET - Fetch current admin user info
export async function GET(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    const users = getAdminUsers() || [];
    
    if (username) {
      const user = users.find((u) => u.username === username);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      // Return user without password hash
      const { passwordHash, ...safeUser } = user;
      return NextResponse.json({ success: true, user: safeUser });
    }
    
    // Return all users without password hashes
    const safeUsers = users.map(({ passwordHash, ...user }) => user);
    return NextResponse.json({ success: true, users: safeUsers });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch admin users' },
      { status: 500 }
    );
  }
}

// POST - Login
export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const body = await request.json();
    const { username, password, action } = body;
    
    if (action === 'login') {
      console.log('[ADMIN-LOGIN] Login attempt for username:', username);
      
      if (!username || !password) {
        return NextResponse.json(
          { success: false, error: 'Username and password are required' },
          { status: 400 }
        );
      }
      
      const users = getAdminUsers() || [];
      console.log('[ADMIN-LOGIN] Total admin users in system:', users.length);
      console.log('[ADMIN-LOGIN] Available usernames:', users.map(u => u.username));
      
      const user = users.find((u) => u.username === username);
      console.log('[ADMIN-LOGIN] User found:', !!user);
      
      if (!user) {
        addAuditLog({
          action: 'LOGIN_FAILED',
          adminId: 'unknown',
          adminUsername: username,
          details: `Failed login attempt for username "${username}" - User not found`,
        });
        return NextResponse.json(
          { success: false, error: 'Invalid username or password' },
          { status: 401 }
        );
      }
      
      const isValid = await bcrypt.compare(password, user.passwordHash);
      console.log('[ADMIN-LOGIN] Password validation result:', isValid);
      
      if (!isValid) {
        addAuditLog({
          action: 'LOGIN_FAILED',
          adminId: user.id,
          adminUsername: user.username,
          details: `Failed login attempt - Invalid password`,
        });
        return NextResponse.json(
          { success: false, error: 'Invalid username or password' },
          { status: 401 }
        );
      }
      
      // Update last login
      user.lastLogin = new Date().toISOString();
      setAdminUsers(users);
      
      // Add audit log
      addAuditLog({
        action: 'LOGIN_SUCCESS',
        adminId: user.id,
        adminUsername: user.username,
        details: 'Successful login',
      });
      
      // Return user without password hash
      const { passwordHash, ...safeUser } = user;
      return NextResponse.json({ 
        success: true, 
        user: safeUser,
        message: 'Login successful'
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in admin auth:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
