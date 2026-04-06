import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone } = await request.json();
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'El correo ya está registrado.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, phone: phone || '' }
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role } });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: 'Error al registrar usuario.' }, { status: 500 });
  }
}
