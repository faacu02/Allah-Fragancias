import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_palabra_segura_mirage';
const COOKIE_NAME = 'mirage_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // true in production
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export function verifyAuth(request: NextRequest) {
  // Try to get token from Authorization header (for backward compatibility or API routes)
  let token = request.headers.get('authorization')?.split(' ')[1];
  // If not in header, try to get from cookies
  if (!token) {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    token = cookies[COOKIE_NAME];
  }
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

export function verifyAdmin(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user || user.role !== 'admin') return null;
  return user;
}

export function signToken(payload: { id: string; email: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function setTokenCookie(response: NextResponse, token: string) {
  response.headers.set(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${COOKIE_OPTIONS.maxAge}`
  );
  return response;
}

export function clearTokenCookie(response: NextResponse) {
  response.headers.set(
    'Set-Cookie',
    `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
  );
  return response;
}
