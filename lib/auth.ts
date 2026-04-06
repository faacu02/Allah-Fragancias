import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_palabra_segura_mirage';

export function verifyAuth(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
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
