import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

const ALLOWED_UPDATE_FIELDS = ['name', 'collection', 'price', 'stock', 'description', 'status', 'images'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function validateFile(file: File): string | null {
  if (file.size <= 0) return null;
  if (file.size > MAX_FILE_SIZE) return `Archivo ${file.name} excede 5MB`;
  if (!ALLOWED_MIME_TYPES.includes(file.type)) return `Tipo de archivo ${file.type} no soportado`;
  return null;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener producto' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = verifyAdmin(request);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  try {
    const { id } = await params;
    const contentType = request.headers.get('content-type') || '';
    
    let updateData: Record<string, any> = {};
    
    if (contentType.includes('application/json')) {
      const data = await request.json();
      // Whitelist allowed fields only
      for (const key of ALLOWED_UPDATE_FIELDS) {
        if (data[key] !== undefined) {
          updateData[key] = data[key];
        }
      }
      if (updateData.stock !== undefined) {
        updateData.stock = parseInt(updateData.stock, 10);
        if (isNaN(updateData.stock)) return NextResponse.json({ error: 'Stock inválido' }, { status: 400 });
        updateData.status = updateData.stock < 10 ? 'LOW' : 'OK';
      }
      if (updateData.price !== undefined) {
        updateData.price = parseFloat(updateData.price);
        if (isNaN(updateData.price)) return NextResponse.json({ error: 'Precio inválido' }, { status: 400 });
      }
    } else {
      const formData = await request.formData();
      const name = formData.get('name') as string | null;
      const collection = formData.get('collection') as string | null;
      const price = formData.get('price') as string | null;
      const stock = formData.get('stock') as string | null;
      const description = formData.get('description') as string | null;

      if (name) updateData.name = name;
      if (collection) updateData.collection = collection;
      if (price) {
        const parsed = parseFloat(price);
        if (isNaN(parsed)) return NextResponse.json({ error: 'Precio inválido' }, { status: 400 });
        updateData.price = parsed;
      }
      if (description !== null && description !== undefined) updateData.description = description || null;
      if (stock !== null && stock !== undefined) {
        const parsed = parseInt(stock, 10);
        if (isNaN(parsed)) return NextResponse.json({ error: 'Stock inválido' }, { status: 400 });
        updateData.stock = parsed;
        updateData.status = parsed < 10 ? 'LOW' : 'OK';
      }

      let currentImages: string[] = [];
      let hasImageUpdates = false;

      const existingImagesRaw = formData.get('existingImages') as string | null;
      if (existingImagesRaw !== null) {
        hasImageUpdates = true;
        try { currentImages = JSON.parse(existingImagesRaw); } catch (e) {
          return NextResponse.json({ error: 'Formato de imágenes existentes inválido' }, { status: 400 });
        }
      }

      const files = formData.getAll('newImages') as File[];
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
      if (validFiles.length > 0) {
        hasImageUpdates = true;
        const uploadedUrls = (await Promise.all(validFiles.map(f => uploadImage(f)))).filter((x): x is string => x !== null);
        currentImages = [...currentImages, ...uploadedUrls];
      }

      if (hasImageUpdates) {
        updateData.images = currentImages;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No hay datos para actualizar' }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error en PUT:", error);
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = verifyAdmin(request);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: 'Producto eliminado con éxito' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 });
  }
}
