import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = verifyAdmin(request);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        },
        items: {
          include: { product: true }
        }
      }
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Error obteniendo órdenes admin' }, { status: 500 });
  }
}
