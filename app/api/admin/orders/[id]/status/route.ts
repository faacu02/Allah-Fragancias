import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { sendOrderEmail, sendAdminNotificationEmail } from '@/lib/mailer';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = verifyAdmin(request);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  try {
    const { id: orderId } = await params;
    const { status } = await request.json();
    
    if (status !== 'approved') return NextResponse.json({ error: 'Status no soportado.' }, { status: 400 });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: { include: { product: true } }
      }
    });

    if (!order) return NextResponse.json({ error: 'Orden no encontrada.' }, { status: 404 });

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'approved' }
    });

    const context = {
       orderId: order.id,
       userName: order.user?.name || 'Cliente',
       phone: order.user?.phone || '',
       total: order.total,
       paymentMethod: order.paymentMethod,
       items: order.items.map(item => ({
          productId: item.productId,
          title: item.product?.name || 'Producto',
          quantity: item.quantity,
          price: item.price
       }))
    };
    
    if (order.user?.email) {
       await sendOrderEmail(order.user.email, context, true);
    }
    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (adminUser) {
       await sendAdminNotificationEmail(adminUser.email, context, true);
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error Admin Actualizando Estado:", error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
