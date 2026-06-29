import { NextRequest, NextResponse } from 'next/server';
import { getSessionByToken, getCustomerById } from '@/lib/customer-auth';

// Middleware to check if user is authenticated
export async function requireAuth(request: NextRequest) {
  const sessionToken = request.cookies.get('customer_session')?.value;

  if (!sessionToken) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  const session = getSessionByToken(sessionToken);

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Invalid session' },
      { status: 401 }
    );
  }

  const user = getCustomerById(session.userId);

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 401 }
    );
  }

  return { user, session };
}

// Middleware to get current user (returns null if not authenticated)
export async function getCurrentUser(request: NextRequest) {
  const sessionToken = request.cookies.get('customer_session')?.value;

  if (!sessionToken) {
    return null;
  }

  const session = getSessionByToken(sessionToken);

  if (!session) {
    return null;
  }

  const user = getCustomerById(session.userId);

  if (!user) {
    return null;
  }

  return user;
}

// Helper function to create authenticated response
export function createAuthResponse(data: any, user: any) {
  return NextResponse.json({
    ...data,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.emailVerified,
    },
  });
}
