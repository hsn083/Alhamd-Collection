import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Google OAuth callback handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { googleId, email, fullName, picture } = body;

    console.log('[AUTH-GOOGLE] Google OAuth callback for email:', email);

    // Validate required fields
    if (!googleId || !email || !fullName) {
      return NextResponse.json(
        { success: false, error: 'Missing required OAuth data' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new user with Google OAuth
      const randomPassword = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      user = await User.create({
        name: fullName,
        email: email.toLowerCase(),
        password: randomPassword, // Random password for OAuth users
        role: 'customer',
        isEmailVerified: true,
        provider: 'google',
        avatar: picture,
      });

      console.log('[AUTH-GOOGLE] Created new user via Google OAuth:', user._id);
    } else if (user.provider !== 'google') {
      console.log('[AUTH-GOOGLE] User exists with different provider:', user.provider);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Set session cookie with user ID
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
      message: 'Google login successful',
    });

    response.cookies.set('customer_session', user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 90 * 24 * 60 * 60,
      path: '/',
    });

    console.log('[AUTH-GOOGLE] Google login successful for user:', user._id, user.email);

    return response;
  } catch (error: any) {
    console.error('[AUTH-GOOGLE] OAuth error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Google authentication failed' },
      { status: 500 }
    );
  }
}
