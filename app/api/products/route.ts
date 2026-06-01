import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateFile(file: File): string | null {
  if (file.size <= 0) return null; // skip empty
  if (file.size > MAX_FILE_SIZE) return `Archivo ${file.name} excede 5MB`;
  if (!ALLOWED_MIME_TYPES.includes(file.type)) return `Tipo de archivo ${file.type} no soportado (use JPEG, PNG, WebP o AVIF)`;
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '9', 10)));
    const search = searchParams.get('search')?.trim() || '';
    const collection = searchParams.get('collection')?.trim() || '';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { collection: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (collection) {
      where.collection = collection;
    }

    const [products, total, collections] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
      prisma.product.findMany({
        select: { collection: true },
        distinct: ['collection'],
        orderBy: { collection: 'asc' },
      }),
    ]);

    const response = NextResponse.json({ products, total, page, limit, collections: collections.map(c => c.collection) });
    response.headers.set('Cache-Control', 'public, max-age=30, s-maxage=60');
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = verifyAdmin(request);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 52_428_800) return NextResponse.json({ error: 'Solicitud demasiado grande' }, { status: 413 });

  try {
    const formData = await request.formData();
    let images: string[] = [];

    const nameRaw = formData.get('name');
    if (!nameRaw || typeof nameRaw !== 'string' || !nameRaw.trim()) return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    const name = nameRaw;
    const collectionRaw = formData.get('collection');
    if (!collectionRaw || typeof collectionRaw !== 'string' || !collectionRaw.trim()) return NextResponse.json({ error: 'La colección es requerida' }, { status: 400 });
    const collection = collectionRaw;
    const priceRaw = formData.get('price');
    const stockRaw = formData.get('stock');
    const priceStr = typeof priceRaw === 'string' ? priceRaw : null;
    const stockStr = typeof stockRaw === 'string' ? stockRaw : null;
    const description = formData.get('description');

    if (description && typeof description !== 'string') return NextResponse.json({ error: 'Descripción inválida' }, { status: 400 });
    if (!priceStr) {
      return NextResponse.json({ error: 'El precio es requerido' }, { status: 400 });
    }
    if (!stockStr) {
      return NextResponse.json({ error: 'El stock es requerido' }, { status: 400 });
    }

    const price = parseFloat(priceStr);
    const stock = parseInt(stockStr, 10);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: 'El precio debe ser un número positivo' }, { status: 400 });
    }
    if (isNaN(stock) || stock < 0) {
      return NextResponse.json({ error: 'El stock debe ser un número válido' }, { status: 400 });
    }

    const existingImagesRaw = formData.get('existingImages');
    if (existingImagesRaw !== null && typeof existingImagesRaw !== 'string') return NextResponse.json({ error: 'Formato de imágenes inválido' }, { status: 400 });
    if (existingImagesRaw) {
      try { images = JSON.parse(existingImagesRaw); } catch (e) {
        return NextResponse.json({ error: 'Formato de imágenes inválido' }, { status: 400 });
      }
    }

    const fileEntries = formData.getAll('newImages').filter((f): f is File => f instanceof File);
    if (fileEntries.length > 0) {
      const errors: string[] = [];
      const validFiles = fileEntries.filter(f => {
        if (f.size <= 0) return false;
        const err = validateFile(f);
        if (err) { errors.push(err); return false; }
        return true;
      });
      if (errors.length > 0) {
        return NextResponse.json({ error: errors.join('. ') }, { status: 400 });
      }
      try {
        const uploadPromises = validFiles.map(f => uploadImage(f));
        const uploadedUrls = (await Promise.all(uploadPromises)).filter((x): x is string => x !== null);
        images = [...images, ...uploadedUrls];
      } catch (e) {
        return NextResponse.json({ error: 'Error al subir imágenes' }, { status: 500 });
      }
    }

    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        collection: collection.trim(),
        price,
        stock,
        status: stock < 10 ? 'LOW' : 'OK',
        description: description && typeof description === 'string' ? description.trim() || null : null,
        images
      }
    });

    return NextResponse.json(newProduct);
  } catch (error) {
    console.error("Error creando producto:", error);
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}
