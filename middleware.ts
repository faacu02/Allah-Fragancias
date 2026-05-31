import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from './lib/auth';
import { authRatelimit, apiRatelimit, forgotPasswordRatelimit } from './lib/rate-limit';
import { generateCsrfToken, getCsrfCookieName, validateCsrfToken } from './lib/csrf';

function getCsp(): string {
  const isDev = process.env.NODE_ENV === 'development';
  return isDev
    ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com; font-src 'self' data:; connect-src 'self' https://api.unsplash.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";
}

function addSecurityHeaders(response: NextResponse) {
  response.headers.set('Content-Security-Policy', getCsp());
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return response;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return addSecurityHeaders(NextResponse.next());
  }

  if (pathname.startsWith('/api/')) {
    // CSRF validation for state-changing API methods
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const csrfCookie = request.cookies.get(getCsrfCookieName())?.value || null;
      const csrfHeader = request.headers.get('x-csrf-token');
      if (!validateCsrfToken(csrfHeader, csrfCookie)) {
        return NextResponse.json({ error: 'CSRF token inválido' }, { status: 403 });
      }
    }

    const ip = getClientIp(request);
    let ratelimit = apiRatelimit;

    if (pathname.startsWith('/api/auth/login')) {
      ratelimit = authRatelimit;
    } else if (pathname.startsWith('/api/auth/register')) {
      ratelimit = authRatelimit;
    } else if (pathname.startsWith('/api/auth/forgot-password') || pathname.startsWith('/api/auth/reset-password')) {
      ratelimit = forgotPasswordRatelimit;
    }

    if (ratelimit) {
      const { success, limit, remaining, reset } = await ratelimit.limit(ip);
      const response = success ? NextResponse.next() : NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' },
        { status: 429 }
      );
      response.headers.set('X-RateLimit-Limit', String(limit));
      response.headers.set('X-RateLimit-Remaining', String(remaining));
      response.headers.set('X-RateLimit-Reset', String(reset));
      addSecurityHeaders(response);
      return response;
    }
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

  const response = addSecurityHeaders(NextResponse.next());
  if (!request.cookies.get(getCsrfCookieName())) {
    response.cookies.set(getCsrfCookieName(), generateCsrfToken(), {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
  }
  return response;
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|public/).*)',
};
