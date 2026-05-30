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

    if (order.status === 'approved') {
      return NextResponse.json({ error: 'La orden ya fue aprobada.' }, { status: 400 });
    }

    // Check stock availability before approving
    const stockErrors: string[] = [];
    for (const item of order.items) {
      if (!item.product) {
        stockErrors.push(`Producto ${item.productId} no encontrado`);
        continue;
      }
      if (item.product.stock < item.quantity) {
        stockErrors.push(`${item.product.name} tiene solo ${item.product.stock} unidades (necesita ${item.quantity})`);
      }
    }

    if (stockErrors.length > 0) {
      return NextResponse.json({
        error: 'Stock insuficiente: ' + stockErrors.join('. ')
      }, { status: 409 });
    }

    // Use a transaction to ensure atomicity of order status update and stock deduction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: 'approved' }
      });

      // Update product stock for each item in the order with negative stock guard
      for (const item of order.items) {
        const result = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity } // Guard: only update if enough stock
          },
          data: {
            stock: { decrement: item.quantity }
          }
        });

        if (result.count === 0) {
          throw new Error(`Stock insuficiente para ${item.product?.name || item.productId}`);
        }

        // Update LOW status based on new stock
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (product) {
          await tx.product.update({
            where: { id: item.productId },
            data: { status: product.stock < 10 ? 'LOW' : 'OK' }
          });
        }
      }

      return updatedOrder;
    });

    // Send emails (best effort, outside transaction)
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
      try {
        await sendOrderEmail(order.user.email, context, true);
      } catch (e) {
        console.error('Error enviando email al usuario:', e);
      }
    }

    try {
      const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
      if (adminUser) {
        await sendAdminNotificationEmail(adminUser.email, context, true);
      }
    } catch (e) {
      console.error('Error enviando email al admin:', e);
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error Admin Actualizando Estado:", error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
