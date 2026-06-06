import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_CAROUSEL_IMAGES = 5;

function validateFile(file: File): string | null {
  if (file.size <= 0) return null;
  if (file.size > MAX_FILE_SIZE) return `Archivo ${file.name} excede 5MB`;
  if (!ALLOWED_MIME_TYPES.includes(file.type)) return `Tipo de archivo no soportado (use JPEG, PNG, WebP o AVIF)`;
  return null;
}

export async function GET(request: NextRequest) {
  const user = verifyAdmin(request);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  try {
    const images = await prisma.carouselImage.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(images);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener imágenes del carrusel' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const user = verifyAdmin(request);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 52_428_800) {
    return NextResponse.json({ error: 'Solicitud demasiado grande' }, { status: 413 });
  }

  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;

    if (action === 'upload') {
      const file = formData.get('image') as File | null;
      const title = formData.get('title') as string || '';

      if (!file || file.size <= 0) {
        return NextResponse.json({ error: 'Imagen requerida' }, { status: 400 });
      }

      const validationError = validateFile(file);
      if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

      const existingCount = await prisma.carouselImage.count();
      if (existingCount >= MAX_CAROUSEL_IMAGES) {
        return NextResponse.json({ error: `Máximo ${MAX_CAROUSEL_IMAGES} imágenes permitidas` }, { status: 400 });
      }

      const maxOrder = await prisma.carouselImage.aggregate({ _max: { order: true } });
      const newOrder = (maxOrder._max.order ?? -1) + 1;

      const imageUrl = await uploadImage(file);
      if (!imageUrl) {
        return NextResponse.json({ error: 'Error al subir imagen' }, { status: 500 });
      }

      const image = await prisma.carouselImage.create({
        data: {
          imageUrl,
          title: title.trim(),
          order: newOrder,
          isActive: true,
        },
      });

      revalidatePath('/');
      revalidatePath('/api/carousel');

      return NextResponse.json(image);
    }

    if (action === 'update') {
      const id = formData.get('id') as string;
      const title = formData.get('title') as string | null;
      const isActive = formData.get('isActive');
      const order = formData.get('order');

      if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

      const updateData: Record<string, unknown> = {};
      if (title !== null) updateData.title = title.trim();
      if (isActive !== null) updateData.isActive = isActive === 'true';
      if (order !== null) updateData.order = parseInt(order as string, 10);

      const image = await prisma.carouselImage.update({
        where: { id },
        data: updateData,
      });

      revalidatePath('/');
      revalidatePath('/api/carousel');

      return NextResponse.json(image);
    }

    if (action === 'reorder') {
      const ordersJson = formData.get('orders') as string;
      if (!ordersJson) return NextResponse.json({ error: 'Ordenes requeridas' }, { status: 400 });

      let orders: { id: string; order: number }[];
      try {
        orders = JSON.parse(ordersJson);
      } catch {
        return NextResponse.json({ error: 'Formato de órdenes inválido' }, { status: 400 });
      }

      await Promise.all(
        orders.map(({ id, order }) =>
          prisma.carouselImage.update({ where: { id }, data: { order } })
        )
      );

      revalidatePath('/');
      revalidatePath('/api/carousel');

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
  } catch (error) {
    console.error('Error en carousel PUT:', error);
    return NextResponse.json({ error: 'Error al procesar solicitud' }, { status: 500 });
  }
}