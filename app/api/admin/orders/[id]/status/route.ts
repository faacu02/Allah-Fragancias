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

    if (status !== 'approved' && status !== 'cancelled') {
      return NextResponse.json({ error: 'Status no soportado. Use "approved" o "cancelled".' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: { include: { product: true } }
      }
    });

    if (!order) return NextResponse.json({ error: 'Orden no encontrada.' }, { status: 404 });

    if (order.status !== 'pending') {
      return NextResponse.json({ error: `La orden ya fue ${order.status === 'approved' ? 'aprobada' : 'cancelada'}.` }, { status: 400 });
    }

    if (status === 'approved') {
      // Stock was already decremented atomically at checkout time.
      // Only update order status here — no double stock deduction.
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
        try { await sendOrderEmail(order.user.email, context, true); } catch (e) { console.error('Error enviando email:', e); }
      }
      try {
        const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
        if (adminUser) { await sendAdminNotificationEmail(adminUser.email, context, true); }
      } catch (e) { console.error('Error notificando admin:', e); }

      return NextResponse.json(updatedOrder);
    }

    if (status === 'cancelled') {
      // Cancel order and restore stock atomically
      const updatedOrder = await prisma.$transaction(async (tx) => {
        const updated = await tx.order.update({
          where: { id: orderId },
          data: { status: 'cancelled' }
        });

        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              status: 'OK'
            }
          });
        }

        return updated;
      });

      return NextResponse.json(updatedOrder);
    }

    return NextResponse.json({ error: 'Status no soportado.' }, { status: 400 });
  } catch (error) {
    console.error("Error Admin Actualizando Estado:", error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
