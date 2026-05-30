import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET no está definido en las variables de entorno.');
}

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'mirage_token';

export function verifyAuth(request: NextRequest) {
  // Try to get token from cookies first (preferred)
  const token = request.cookies.get(COOKIE_NAME)?.value
    || request.headers.get('authorization')?.split(' ')[1];

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    if (!decoded.id || !decoded.email || !decoded.role) return null;
    return decoded;
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
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return response;
}

export function clearTokenCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return response;
}
