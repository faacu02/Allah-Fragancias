import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role } });
  } catch (error) {
    return NextResponse.json({ error: 'Error al iniciar sesión.' }, { status: 500 });
  }
}
