import { NextRequest, NextResponse } from 'next/server';
import { clearTokenCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const res = NextResponse.json({ success: true });
  clearTokenCookie(res);
  return res;
}