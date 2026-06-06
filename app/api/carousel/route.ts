import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const images = await prisma.carouselImage.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        imageUrl: true,
        title: true,
        order: true,
      },
    });

    const response = NextResponse.json(images);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener imágenes del carrusel' }, { status: 500 });
  }
}