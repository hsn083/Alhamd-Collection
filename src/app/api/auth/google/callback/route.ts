import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Google OAuth callback handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('[AUTH-GOOGLE-CALLBACK] OAuth error:', error);
      return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', request.url));
    }

    if (!code) {
      console.error('[AUTH-GOOGLE-CALLBACK] No code provided');
      return NextResponse.redirect(new URL('/auth/login?error=no_code', request.url));
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[AUTH-GOOGLE-CALLBACK] Token exchange failed:', errorText);
      return NextResponse.redirect(new URL('/auth/login?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error('[AUTH-GOOGLE-CALLBACK] Failed to get user info');
      return NextResponse.redirect(new URL('/auth/login?error=user_info_failed', request.url));
    }

    const userInfo = await userInfoResponse.json();

    console.log('[AUTH-GOOGLE-CALLBACK] User info received:', userInfo.email);

    // Call the internal Google OAuth handler
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        googleId: userInfo.id,
        email: userInfo.email,
        fullName: userInfo.name,
        picture: userInfo.picture,
      }),
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.json();
      console.error('[AUTH-GOOGLE-CALLBACK] Auth handler failed:', errorData);
      return NextResponse.redirect(new URL('/auth/login?error=auth_handler_failed', request.url));
    }

    const authData = await authResponse.json();

    if (authData.success) {
      // Redirect to account page on success
      return NextResponse.redirect(new URL('/account', request.url));
    } else {
      return NextResponse.redirect(new URL('/auth/login?error=' + encodeURIComponent(authData.error || 'Unknown error'), request.url));
    }
  } catch (error: any) {
    console.error('[AUTH-GOOGLE-CALLBACK] Callback error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=callback_error', request.url));
  }
}
