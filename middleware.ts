import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/admin', '/customer'];

// Routes that should redirect authenticated users (auth pages)
const authRoutes = ['/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies or localStorage (client-side only)
  // Note: This middleware runs on the server, so we can't access localStorage
  // For full server-side protection, you'd need to use HTTP-only cookies
  // This is a basic client-side check that can be enhanced

  // For now, we'll let the client-side auth context handle the protection
  // This middleware serves as a foundation for future server-side auth

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
