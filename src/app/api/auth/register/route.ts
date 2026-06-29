import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

// Generate customer ID
function generateCustomerId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CUST-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, password, phone, confirmPassword, termsAccepted } = body;

    console.log('[AUTH-REGISTER] Registration attempt for email:', email);

    // Rate limiting by email
    const rateLimitResult = checkRateLimit(email, 5, 60 * 1000); // 5 requests per minute
    if (!rateLimitResult.allowed) {
      console.log('[AUTH-REGISTER] Rate limit exceeded for email:', email);
      return NextResponse.json(
        { success: false, error: 'Too many registration attempts. Please try again later.' },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      );
    }

    // Validate required fields
    if (!fullName || !email || !password || !phone) {
      console.log('[AUTH-REGISTER] Missing required fields');
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate terms acceptance
    if (!termsAccepted) {
      console.log('[AUTH-REGISTER] Terms not accepted');
      return NextResponse.json(
        { success: false, error: 'You must accept the terms and conditions' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[AUTH-REGISTER] Invalid email format:', email);
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/[^0-9+]/g, ''))) {
      console.log('[AUTH-REGISTER] Invalid phone format:', phone);
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      console.log('[AUTH-REGISTER] Password too short');
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password)) {
      console.log('[AUTH-REGISTER] Password missing uppercase');
      return NextResponse.json(
        { success: false, error: 'Password must contain at least one uppercase letter' },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(password)) {
      console.log('[AUTH-REGISTER] Password missing number');
      return NextResponse.json(
        { success: false, error: 'Password must contain at least one number' },
        { status: 400 }
      );
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      console.log('[AUTH-REGISTER] Passwords do not match');
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();
    console.log('[AUTH-REGISTER] Database connected');

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('[AUTH-REGISTER] Email already registered:', email);
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Generate unique customer ID
    let customerId = generateCustomerId();
    let customerIdExists = await User.findOne({ customerId });
    while (customerIdExists) {
      customerId = generateCustomerId();
      customerIdExists = await User.findOne({ customerId });
    }

    // Create new user
    const newUser = await User.create({
      customerId,
      name: fullName,
      email: email.toLowerCase(),
      password,
      phone,
      role: 'customer',
      isEmailVerified: true, // Auto-verify for now
      isActive: true,
    });

    console.log('[AUTH-REGISTER] New customer registered:', {
      id: newUser._id,
      customerId: newUser.customerId,
      email: newUser.email,
      name: newUser.name,
    });

    // Return user data without password
    const userObj = newUser.toObject();
    const { password: _, ...userWithoutPassword } = userObj;

    return NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        id: newUser._id.toString(),
        fullName: newUser.name,
        emailVerified: newUser.isEmailVerified,
      },
      message: 'Registration successful. You can now login.',
    });
  } catch (error: any) {
    console.error('[AUTH-REGISTER] Registration error:', error);
    // Don't expose detailed error messages to client
    return NextResponse.json(
      { success: false, error: 'Unable to create account. Please try again.' },
      { status: 500 }
    );
  }
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;
