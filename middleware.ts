import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from './lib/auth';

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
];

function addSecurityHeaders(response: NextResponse) {
  securityHeaders.forEach(({ key, value }) => response.headers.set(key, value));
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return addSecurityHeaders(NextResponse.next());
  }

  const isAuthenticated = await verifyAuth(request);

  if (
    (pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) &&
    !isAuthenticated
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return addSecurityHeaders(NextResponse.redirect(url));
  }

  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return addSecurityHeaders(NextResponse.redirect(url));
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|public/).*)',
};