import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Facebook OAuth callback handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('[AUTH-FACEBOOK-CALLBACK] OAuth error:', error);
      return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', request.url));
    }

    if (!code) {
      console.error('[AUTH-FACEBOOK-CALLBACK] No code provided');
      return NextResponse.redirect(new URL('/auth/login?error=no_code', request.url));
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_CLIENT_ID}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&code=${code}&redirect_uri=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/facebook/callback`)}`, {
      method: 'GET',
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[AUTH-FACEBOOK-CALLBACK] Token exchange failed:', errorText);
      return NextResponse.redirect(new URL('/auth/login?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info from Facebook
    const userInfoResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${accessToken}`, {
      method: 'GET',
    });

    if (!userInfoResponse.ok) {
      console.error('[AUTH-FACEBOOK-CALLBACK] Failed to get user info');
      return NextResponse.redirect(new URL('/auth/login?error=user_info_failed', request.url));
    }

    const userInfo = await userInfoResponse.json();

    console.log('[AUTH-FACEBOOK-CALLBACK] User info received:', userInfo.email);

    // Call the internal Facebook OAuth handler
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/facebook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        facebookId: userInfo.id,
        email: userInfo.email,
        fullName: userInfo.name,
      }),
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.json();
      console.error('[AUTH-FACEBOOK-CALLBACK] Auth handler failed:', errorData);
      return NextResponse.redirect(new URL('/auth/login?error=auth_handler_failed', request.url));
    }

    const authData = await authResponse.json();

    if (authData.success) {
      return NextResponse.redirect(new URL('/account', request.url));
    } else {
      return NextResponse.redirect(new URL('/auth/login?error=' + encodeURIComponent(authData.error || 'Unknown error'), request.url));
    }
  } catch (error: any) {
    console.error('[AUTH-FACEBOOK-CALLBACK] Callback error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=callback_error', request.url));
  }
}
