import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderEmail, sendAdminNotificationEmail } from '@/lib/mailer';

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
          message: 'Orden creada. Coordina con el administrador para el pago en efectivo.', 
          orderId: newOrder.id 
       });
    } else if (paymentMethod === 'transferencia') {
       // Bank transfer details - these should come from environment variables in production
       const bankDetails = {
         bankName: process.env.BANK_NAME || 'Banco Ejemplo',
         accountType: process.env.ACCOUNT_TYPE || 'Cuenta Corriente',
         accountNumber: process.env.ACCOUNT_NUMBER || '123456789',
         alias: process.env.ALIAS || 'ALLAH.FRAGANCIAS',
         cuit: process.env.CUIT || '20-12345678-9',
         holderName: process.env.HOLDER_NAME || 'Allah Fragancias'
       };

       if (userId) {
          const userObj = await prisma.user.findUnique({ where: { id: userId } });
          if (userObj) {
            const context = {
               orderId: newOrder.id,
               userName: userObj.name || 'Cliente',
               phone: userObj.phone || '',
               total,
               paymentMethod,
               items: items,
               bankDetails
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
          message: 'Orden creada. Envía el comprobante de transferencia por WhatsApp para confirmar tu pago.', 
          orderId: newOrder.id,
          bankDetails,
          showWhatsApp: true
       });
    }

    return NextResponse.json({ error: 'Método de pago no válido' }, { status: 400 });
  } catch (error) {
    console.error("Error en Checkout:", error);
    return NextResponse.json({ error: 'Error procesando la compra' }, { status: 500 });
  }
}
