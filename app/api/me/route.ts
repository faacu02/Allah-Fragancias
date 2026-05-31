import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authUser = verifyAuth(request);
    if (!authUser) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, email: true, name: true, phone: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const response = NextResponse.json({ user });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Error al obtener usuario' }, { status: 500 });
  }
}
