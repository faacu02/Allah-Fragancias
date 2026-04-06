import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

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

    const existingImagesRaw = formData.get('existingImages') as string | null;
    if (existingImagesRaw) {
      try { images = JSON.parse(existingImagesRaw); } catch (e) {}
    }

    const files = formData.getAll('newImages') as File[];
    if (files.length > 0) {
      const uploadPromises = files.filter(f => f.size > 0).map(f => uploadImage(f));
      const uploadedUrls = await Promise.all(uploadPromises);
      images = [...images, ...uploadedUrls];
    }

    const newProduct = await prisma.product.create({
      data: {
        name: formData.get('name') as string,
        collection: formData.get('collection') as string,
        price: parseFloat(formData.get('price') as string) || 0,
        stock: parseInt(formData.get('stock') as string) || 0,
        status: parseInt(formData.get('stock') as string) < 10 ? 'LOW' : 'OK',
        images: images
      }
    });

    return NextResponse.json(newProduct);
  } catch (error) {
    console.error("Error creando producto:", error);
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}
