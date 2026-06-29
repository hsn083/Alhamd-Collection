import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page to be accessible
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check maintenance mode for non-admin routes
  if (!pathname.startsWith('/admin')) {
    try {
      // Fetch settings from API instead of reading file directly
      const baseUrl = request.nextUrl.origin;
      const response = await fetch(`${baseUrl}/api/settings`, {
        cache: 'no-store',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings?.general?.maintenanceMode) {
          // Allow access to maintenance page itself
          if (pathname === '/maintenance') {
            return NextResponse.next();
          }
          // Redirect to maintenance page
          return NextResponse.redirect(new URL('/maintenance', request.url));
        }
      }
    } catch (error) {
      console.error('Error checking maintenance mode:', error);
    }
  }

  // Check if the path is admin-related
  if (pathname.startsWith('/admin')) {
    // Check for auth token in cookies
    const authCookie = request.cookies.get('adminAuth');
    
    // In production, you would verify a proper JWT token
    // For now, we'll check if the user is authenticated
    if (!authCookie || authCookie.value !== 'true') {
      // Redirect to login page
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
