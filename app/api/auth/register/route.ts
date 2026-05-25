import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken, setTokenCookie } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/mailer';
import validator from 'validator';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone } = await request.json();
    
    // Input sanitization and validation
    const sanitizedEmail = validator.trim(email || '');
    if (!validator.isEmail(sanitizedEmail)) {
      return NextResponse.json({ error: 'El email no es válido' }, { status: 400 });
    }
    
    const sanitizedName = validator.escape(validator.trim(name || ''));
    if (!sanitizedName) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }
    
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }
    
    const sanitizedPhone = phone ? validator.trim(phone).replace(/\s+/g, '') : '';
    if (sanitizedPhone && !validator.isNumeric(sanitizedPhone)) {
      return NextResponse.json({ error: 'El teléfono debe contener solo números' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: sanitizedEmail } });
    if (existing) {
      return NextResponse.json({ error: 'El correo ya está registrado.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        email: sanitizedEmail, 
        password: hashedPassword, 
        name: sanitizedName, 
        phone: sanitizedPhone 
      }
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name || 'Miembro');
    } catch (emailError) {
      console.warn('Failed to send welcome email:', emailError);
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    const userResponse = { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role };
    
    // Set cookie and return user data (without token)
    const res = NextResponse.json({ user: userResponse });
    setTokenCookie(res, token);
    return res;
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: 'Error al registrar usuario.' }, { status: 500 });
  }
}
