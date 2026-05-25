import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = verifyAdmin(request);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  try {
    const { id } = await params;
    const contentType = request.headers.get('content-type') || '';
    
    let updateData: any = {};
    
    if (contentType.includes('application/json')) {
      const data = await request.json();
      updateData = { ...data };
      if (data.stock !== undefined) {
        updateData.stock = parseInt(data.stock, 10);
        updateData.status = updateData.stock < 10 ? 'LOW' : 'OK';
      }
      if (data.price !== undefined) {
        updateData.price = parseFloat(data.price);
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
      if (price) updateData.price = parseFloat(price);
      if (description !== null && description !== undefined) updateData.description = description || null;
      if (stock !== null && stock !== undefined) {
        updateData.stock = parseInt(stock, 10);
        updateData.status = updateData.stock < 10 ? 'LOW' : 'OK';
      }

      let currentImages: string[] = [];
      let hasImageUpdates = false;

      const existingImagesRaw = formData.get('existingImages') as string | null;
      if (existingImagesRaw !== null) {
        hasImageUpdates = true;
        try { currentImages = JSON.parse(existingImagesRaw); } catch (e) {}
      }

      const files = formData.getAll('newImages') as File[];
      const validFiles = files.filter(f => f.size > 0);
      if (validFiles.length > 0) {
        hasImageUpdates = true;
        const uploadedUrls = await Promise.all(validFiles.map(f => uploadImage(f)));
        currentImages = [...currentImages, ...uploadedUrls];
      }

      if (hasImageUpdates) {
        updateData.images = currentImages;
      }
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
