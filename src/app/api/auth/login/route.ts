import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    console.log('[AUTH-LOGIN] Login attempt for email:', email);

    // Rate limiting by email
    const rateLimitResult = checkRateLimit(email, 10, 60 * 1000); // 10 requests per minute
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      );
    }

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      console.log('[AUTH-LOGIN] Login failed for email:', email, 'User not found');
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      console.log('[AUTH-LOGIN] Login failed for email:', email, 'Invalid password');
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is blocked
    if (user.isBlocked) {
      console.log('[AUTH-LOGIN] Login blocked for user:', user._id, 'Account is blocked');
      return NextResponse.json(
        { success: false, error: 'Your account has been blocked. Contact support.' },
        { status: 403 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Set session cookie with user ID
    const sessionExpiryDays = rememberMe ? 90 : 30;
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        fullName: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.isEmailVerified,
        provider: user.provider,
      },
      message: 'Login successful',
    });

    // Set HTTP-only cookie with user ID
    response.cookies.set('customer_session', user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: sessionExpiryDays * 24 * 60 * 60,
      path: '/',
    });

    console.log('[AUTH-LOGIN] Customer logged in successfully:', user._id, user.email);

    return response;
  } catch (error: any) {
    console.error('[AUTH-LOGIN] Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}

// GET - Check if user is logged in
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('customer_session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(sessionToken);

    if (!user) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'User not found' },
        { status: 401 }
      );
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Account is blocked' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user._id.toString(),
        fullName: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.isEmailVerified,
        provider: user.provider,
      },
    });
  } catch (error: any) {
    console.error('[AUTH-LOGIN] Check auth error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication check failed' },
      { status: 500 }
    );
  }
}

// DELETE - Logout
export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear session cookie
    response.cookies.delete('customer_session');

    console.log('[AUTH-LOGIN] Customer logged out');

    return response;
  } catch (error: any) {
    console.error('[AUTH-LOGIN] Logout error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Logout failed' },
      { status: 500 }
    );
  }
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;
