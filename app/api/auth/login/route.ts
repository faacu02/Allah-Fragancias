import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken, setTokenCookie } from '@/lib/auth';
import validator from 'validator';
import { checkRateLimit, getRemainingAttempts } from '@/lib/rate-limit-login';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'El email es requerido' }, { status: 400 });
    }
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'La contraseña es requerida' }, { status: 400 });
    }

    const sanitizedEmail = validator.normalizeEmail(validator.trim(email)) as string;
    if (!validator.isEmail(sanitizedEmail)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitKey = `login:${ip}:${sanitizedEmail}`;

    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json({
        error: 'Demasiados intentos. Intente de nuevo en 15 minutos.',
        remaining: 0,
      }, { status: 429 });
    }

    const user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });
    
    if (!user) return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    const userResponse = { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role };
    
    const res = NextResponse.json({ user: userResponse, remaining: getRemainingAttempts(rateLimitKey) });
    setTokenCookie(res, token);
    return res;
  } catch (error) {
    return NextResponse.json({ error: 'Error al iniciar sesión.' }, { status: 500 });
  }
}
