import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error obteniendo órdenes:", error);
    return NextResponse.json({ error: 'Error al obtener historial' }, { status: 500 });
  }
}
