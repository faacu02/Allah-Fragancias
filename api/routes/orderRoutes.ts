import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { isAuth } from '../middlewares/auth';
import { sendOrderEmail, sendAdminNotificationEmail } from '../mailer';

const router = Router();
const prisma = new PrismaClient();

const mpClient = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-dummy-token' 
});

router.get('/my-orders', isAuth, async (req: any, res: any) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    res.json(orders);
  } catch (error) {
    console.error("Error obteniendo órdenes:", error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

router.post('/checkout', async (req: any, res: any) => {
  try {
    const { items, paymentMethod, userId } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    const total = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    
    const orderData: any = {
       total,
       paymentMethod,
       status: 'pending',
       items: {
          create: items.map((i: any) => ({
             productId: i.productId,
             quantity: i.quantity,
             price: i.price
          }))
       }
    };
    if (userId) { orderData.userId = userId; }
    
    const newOrder = await prisma.order.create({ data: orderData });

    if (paymentMethod === 'efectivo') {
       if (userId) {
          const userObj = await prisma.user.findUnique({ where: { id: userId } });
          if (userObj) {
            const context = {
               orderId: newOrder.id,
               userName: userObj.name,
               phone: userObj.phone || '',
               total,
               paymentMethod,
               items: items
            };
            await sendOrderEmail(userObj.email, context, false);
            
            const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
            if (adminUser) {
               await sendAdminNotificationEmail(adminUser.email, context, false);
            }
          }
       }

       return res.json({ 
          success: true, 
          message: 'Orden creada. Coordina con el administrador.', 
          orderId: newOrder.id 
       });
    } else if (paymentMethod === 'mercadopago') {
       const preference = new Preference(mpClient);
       
       const mpItems = items.map((i: any) => ({
         id: i.productId,
         title: i.title,
         quantity: i.quantity,
         unit_price: i.price,
         currency_id: 'ARS',
       }));

       const createdPreference = await preference.create({
         body: {
           items: mpItems,
           external_reference: newOrder.id,
           back_urls: {
              success: 'https://localhost:3000/?status=success',
              failure: 'https://localhost:3000/?status=failure',
              pending: 'https://localhost:3000/?status=pending'
           },
         }
       });

       await prisma.order.update({
          where: { id: newOrder.id },
          data: { mpPreferenceId: createdPreference.id }
       });

       return res.json({ 
          success: true, 
          init_point: createdPreference.init_point, 
          orderId: newOrder.id 
       });
    }

    return res.status(400).json({ error: 'Método de pago no válido' });
  } catch (error) {
    console.error("Error en Checkout:", error);
    res.status(500).json({ error: 'Error procesando la compra' });
  }
});

router.post('/webhooks/mercadopago', async (req: any, res: any) => {
  try {
    const { type, data } = req.body;
    
    if (type === 'payment' && data?.id) {
       console.log("Notificación de MP procesada", data.id);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send('Webhook error');
  }
});

export default router;
