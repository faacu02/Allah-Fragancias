import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authUser = verifyAuth(request);
  if (!authUser) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Fetch full user data from DB (JWT only has id, email, role)
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, email: true, name: true, phone: true, role: true }
  });

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
