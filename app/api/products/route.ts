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

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = verifyAdmin(request);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  try {
    const formData = await request.formData();
    let images: string[] = [];

    const name = formData.get('name') as string | null;
    const collection = formData.get('collection') as string | null;
    const priceStr = formData.get('price') as string | null;
    const stockStr = formData.get('stock') as string | null;
    const description = formData.get('description') as string | null;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }
    if (!collection || !collection.trim()) {
      return NextResponse.json({ error: 'La colección es requerida' }, { status: 400 });
    }
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

    const existingImagesRaw = formData.get('existingImages') as string | null;
    if (existingImagesRaw) {
      try { images = JSON.parse(existingImagesRaw); } catch (e) {
        return NextResponse.json({ error: 'Formato de imágenes inválido' }, { status: 400 });
      }
    }

    const files = formData.getAll('newImages') as File[];
    if (files.length > 0) {
      const errors: string[] = [];
      const validFiles = files.filter(f => {
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
        const uploadedUrls = await Promise.all(uploadPromises);
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
        description: description || null,
        images
      }
    });

    return NextResponse.json(newProduct);
  } catch (error) {
    console.error("Error creando producto:", error);
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}
