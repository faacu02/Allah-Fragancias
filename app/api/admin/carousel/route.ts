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
    const response = NextResponse.json(images);
    response.headers.set('Cache-Control', 'no-store');
    return response;
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
    const contentType = request.headers.get('content-type') || '';
    let action: string;
    let bodyData: Record<string, unknown> = {};

    if (contentType.includes('application/json')) {
      bodyData = await request.json();
      action = bodyData.action as string;
    } else {
      const formData = await request.formData();
      action = formData.get('action') as string;
      // Convert FormData to object for consistent handling
      formData.forEach((value, key) => {
        if (key !== 'image') bodyData[key] = value;
      });
    }

    if (action === 'upload') {
      // Upload must use FormData for file
      const formData = contentType.includes('application/json') 
        ? null 
        : await request.formData();
      
      if (!formData) {
        return NextResponse.json({ error: 'Upload requiere FormData' }, { status: 400 });
      }

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
      const id = bodyData.id as string;
      const title = bodyData.title as string | null;
      const isActive = bodyData.isActive as string | null;
      const order = bodyData.order as string | null;

      if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

      const updateData: Record<string, unknown> = {};
      if (title !== null && title !== undefined) updateData.title = title.trim();
      if (isActive !== null && isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === '1';
      if (order !== null && order !== undefined) updateData.order = typeof order === 'number' ? order : parseInt(order as string, 10);

      const image = await prisma.carouselImage.update({
        where: { id },
        data: updateData,
      });

      revalidatePath('/');
      revalidatePath('/api/carousel');

      return NextResponse.json(image);
    }

    if (action === 'reorder') {
      const orders = bodyData.orders as { id: string; order: number }[];
      if (!orders || !Array.isArray(orders)) return NextResponse.json({ error: 'Ordenes requeridas' }, { status: 400 });

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