import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { sendOrderEmail, sendAdminNotificationEmail } from '@/lib/mailer';

const mpClient = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-dummy-token' 
});

export async function POST(request: NextRequest) {
  try {
    const { items, paymentMethod, userId } = await request.json();
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
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
               userName: userObj.name || 'Cliente',
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

       return NextResponse.json({ 
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

       const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

       const createdPreference = await preference.create({
         body: {
           items: mpItems,
           external_reference: newOrder.id,
           back_urls: {
              success: `${baseUrl}/?status=success`,
              failure: `${baseUrl}/?status=failure`,
              pending: `${baseUrl}/?status=pending`
           },
         }
       });

       await prisma.order.update({
          where: { id: newOrder.id },
          data: { mpPreferenceId: createdPreference.id }
       });

       return NextResponse.json({ 
          success: true, 
          init_point: createdPreference.init_point, 
          orderId: newOrder.id 
       });
    }

    return NextResponse.json({ error: 'Método de pago no válido' }, { status: 400 });
  } catch (error) {
    console.error("Error en Checkout:", error);
    return NextResponse.json({ error: 'Error procesando la compra' }, { status: 500 });
  }
}
