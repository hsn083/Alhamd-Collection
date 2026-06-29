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
      console.log('[AUTH-LOGIN] Rate limit exceeded for email:', email);
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
      console.log('[AUTH-LOGIN] Missing email or password');
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[AUTH-LOGIN] Invalid email format:', email);
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();
    console.log('[AUTH-LOGIN] Database connected');

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      console.log('[AUTH-LOGIN] Login failed for email:', email, '- User not found');
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('[AUTH-LOGIN] Login failed for user:', user._id, '- Account is inactive');
      return NextResponse.json(
        { success: false, error: 'Your account is inactive. Please contact support.' },
        { status: 403 }
      );
    }

    // Check if user is blocked
    if (user.isBlocked) {
      console.log('[AUTH-LOGIN] Login blocked for user:', user._id, '- Account is blocked');
      return NextResponse.json(
        { success: false, error: 'Your account has been blocked. Contact support.' },
        { status: 403 }
      );
    }

    // Check if user is deleted
    if (user.isDeleted) {
      console.log('[AUTH-LOGIN] Login failed for user:', user._id, '- Account is deleted');
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      console.log('[AUTH-LOGIN] Login failed for email:', email, '- Invalid password');
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log('[AUTH-LOGIN] Customer logged in successfully:', {
      id: user._id,
      customerId: user.customerId,
      email: user.email,
      name: user.name,
    });

    // Set session cookie with user ID
    const sessionExpiryDays = rememberMe ? 90 : 30;
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        customerId: user.customerId,
        fullName: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.isEmailVerified,
        avatar: user.avatar,
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

    return response;
  } catch (error: any) {
    console.error('[AUTH-LOGIN] Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to login. Please try again.' },
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
    console.log('[AUTH-LOGIN] Checking authentication for session:', sessionToken);

    const user = await User.findById(sessionToken);

    if (!user) {
      console.log('[AUTH-LOGIN] Session invalid - user not found');
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Session invalid' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('[AUTH-LOGIN] User account is inactive');
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Account is inactive' },
        { status: 403 }
      );
    }

    // Check if user is blocked
    if (user.isBlocked) {
      console.log('[AUTH-LOGIN] User account is blocked');
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Account is blocked' },
        { status: 403 }
      );
    }

    // Check if user is deleted
    if (user.isDeleted) {
      console.log('[AUTH-LOGIN] User account is deleted');
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Account not found' },
        { status: 401 }
      );
    }

    console.log('[AUTH-LOGIN] User authenticated successfully:', user.email);

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user._id.toString(),
        customerId: user.customerId,
        fullName: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.isEmailVerified,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error('[AUTH-LOGIN] Check auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to verify authentication' },
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
      { success: false, error: 'Unable to logout' },
      { status: 500 }
    );
  }
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;
