import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { isAdmin } from '../middlewares/auth';
import { sendOrderEmail, sendAdminNotificationEmail } from '../mailer';

const router = Router();
const prisma = new PrismaClient();

router.get('/orders', isAdmin, async (req: any, res: any) => {
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
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo órdenes admin' });
  }
});

router.put('/orders/:id/status', isAdmin, async (req: any, res: any) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    
    if (status !== 'approved') return res.status(400).json({ error: 'Status no soportado.' });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: { include: { product: true } }
      }
    });

    if (!order) return res.status(404).json({ error: 'Orden no encontrada.' });

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

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error Admin Actualizando Estado:", error);
    res.status(500).json({ error: 'Error interno.' });
  }
});

export default router;
