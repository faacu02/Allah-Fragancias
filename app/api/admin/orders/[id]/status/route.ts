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

    // Use a transaction to ensure atomicity of order status update and stock deduction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: 'approved' }
      });

      // Update product stock for each item in the order
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            status: item.product.stock - item.quantity < 10 ? 'LOW' : 'OK'
          }
        });
      }

      return updatedOrder;
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
