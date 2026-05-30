import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/mailer';
import crypto from 'crypto';
import validator from 'validator';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const sanitizedEmail = validator.trim(email || '');

    if (!sanitizedEmail || !validator.isEmail(sanitizedEmail)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000);
      // Store SHA-256 hash of the token, not the raw token
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: hashedToken, resetTokenExpiry }
      });

      // Send the raw token in the email (user never sees the hashed one)
      try {
        await sendPasswordResetEmail(user.email, resetToken);
      } catch (emailError) {
        console.error('Error sending reset email:', emailError);
      }
    }

    return NextResponse.json({
      message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}
