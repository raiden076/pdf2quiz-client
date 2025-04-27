import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { jwtDecode } from 'jwt-decode';

// Paths that require authentication
const PROTECTED_PATHS = [
  '/dashboard', 
  '/profile',
  '/quiz/create',
  '/quiz/',
  '/sessions'
];

// Paths that are only accessible to non-authenticated users
const AUTH_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('pdf_quiz_auth_token')?.value;
  
  // Check if the path requires authentication
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  const isAuthPath = AUTH_PATHS.some(path => pathname === path);
  
  // Check if token is valid
  const isValidToken = token ? isTokenValid(token) : false;
  
  // Redirect logic
  if (isProtectedPath && !isValidToken) {
    // Redirect to login if accessing protected path without valid token
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (isAuthPath && isValidToken) {
    // Redirect to dashboard if accessing auth paths with valid token
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Helper function to validate token
function isTokenValid(token: string): boolean {
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
}

// Configure which paths should trigger the middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/quiz/:path*',
    '/sessions/:path*',
    '/login',
    '/register'
  ],
};