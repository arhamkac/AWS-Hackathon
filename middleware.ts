import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./controllers/authController";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/chat',
    '/checkin',
    '/results',
    '/emergency',
    '/profile-setup',
    '/profile',
    '/api/profile',
  ];

  // University portal routes — handled by their own uni_token cookie, skip student middleware
  if (pathname.startsWith('/university') || pathname.startsWith('/api/university')) {
    return NextResponse.next();
  }

  // Define auth routes (redirect if already logged in)
  const authRoutes = ['/login', '/signup'];

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if current path is auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Get token from cookies
  const token = request.cookies.get('token')?.value;

  // Verify token if it exists
  let isValidToken = false;
  if (token) {
    const payload = await verifyToken(token);
    isValidToken = !!payload;
  }

  // Redirect logic
  if (isProtectedRoute && !isValidToken) {
    // Redirect to login if accessing protected route without valid token
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && isValidToken) {
    // Redirect to dashboard if accessing auth routes with valid token
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|api/colleges|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};