import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken, setTokenCookie } from '@/lib/auth';
import validator from 'validator';
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
    console.log('Login attempt:', { originalEmail: email, sanitizedEmail });
    
    if (!validator.isEmail(sanitizedEmail)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });
    
    if (!user) {
      console.log('User not found:', sanitizedEmail);
      return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });
    }

    console.log('User found:', { id: user.id, email: user.email, hasPassword: !!user.password, passwordLength: user.password?.length });
    
    // Check if password is stored as plain text (old users) or bcrypt hash
    let validPassword = false;
    if (user.password && user.password.startsWith('$2a$')) {
      // Modern bcrypt hash
      validPassword = await bcrypt.compare(password, user.password);
    } else if (user.password === password) {
      // Legacy plain text password - update to bcrypt on successful login
      validPassword = true;
    }
    
    console.log('Password comparison:', { validPassword, isBcryptHash: user.password?.startsWith('$2a$'), inputLength: password.length, storedLength: user.password?.length });
    
    if (!validPassword) {
      return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });
    }

    // Update legacy plain text password to bcrypt hash
    if (user.password && !user.password.startsWith('$2a$')) {
      console.log('Updating legacy password to bcrypt hash for user:', user.id);
      const newHashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHashedPassword }
      });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    const userResponse = { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role };
    
    const res = NextResponse.json({ user: userResponse });
    setTokenCookie(res, token);
    return res;
  } catch (error) {
    return NextResponse.json({ error: 'Error al iniciar sesión.' }, { status: 500 });
  }
}
