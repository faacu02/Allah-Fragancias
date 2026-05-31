import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';
import { createRatelimit } from '@/lib/rate-limit';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const receiptRatelimit = createRatelimit(5, 60);

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = verifyAuth(request);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 10_485_760) return NextResponse.json({ error: 'Solicitud demasiado grande' }, { status: 413 });

  const ip = getClientIp(request);
  const { success } = await receiptRatelimit.limit(ip);
  if (!success) return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' }, { status: 429 });

  try {
    const { id: orderId } = await params;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    if (order.userId !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'La orden no está pendiente' }, { status: 400 });
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
    if (!receiptUrl) {
      return NextResponse.json({ error: 'Error al subir el comprobante. Configuración de almacenamiento faltante.' }, { status: 500 });
    }

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
