import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = verifyAuth(request);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id: orderId } = await params;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    if (order.userId !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('receipt') as File | null;
    if (!file) return NextResponse.json({ error: 'No se subió ningún archivo' }, { status: 400 });

    // Server-side file validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido. Solo se aceptan imágenes (JPG, PNG, WebP)' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'La imagen no puede superar los 5MB' }, { status: 400 });
    }

    const receiptUrl = await uploadImage(file);

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { paymentReceipt: receiptUrl }
    });

    return NextResponse.json({ success: true, receiptUrl: updated.paymentReceipt });
  } catch (error) {
    console.error('Error subiendo comprobante:', error);
    return NextResponse.json({ error: 'Error al subir comprobante' }, { status: 500 });
  }
}
