import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { sendOrderEmail, sendAdminNotificationEmail } from '@/lib/mailer';
import { checkoutRatelimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    if (checkoutRatelimit) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const { success } = await checkoutRatelimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: 'Demasiadas solicitudes. Intente de nuevo en un momento.' }, { status: 429 });
      }
    }

    const { items, paymentMethod } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    if (paymentMethod !== 'efectivo' && paymentMethod !== 'transferencia') {
      return NextResponse.json({ error: 'Método de pago no válido' }, { status: 400 });
    }

    // Get userId from server-side session (NOT from request body)
    const authUser = verifyAuth(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Autenticación requerida' }, { status: 401 });
    }
    if (authUser.role === 'admin') {
      return NextResponse.json({ error: 'Las cuentas administrativas no pueden realizar compras' }, { status: 403 });
    }
    const userId = authUser.id;

    // Read prices from database — never trust client prices
    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    const dbProductMap = new Map(dbProducts.map(p => [p.id, p]));

    // Validate stock and build trusted items
    const trustedItems: { productId: string; quantity: number; price: number; title: string }[] = [];
    const stockErrors: string[] = [];

    for (const item of items) {
      const dbProduct = dbProductMap.get(item.productId);
      if (!dbProduct) {
        stockErrors.push(`Producto "${item.title || item.productId}" no encontrado`);
        continue;
      }
      if (dbProduct.stock < item.quantity) {
        stockErrors.push(`${dbProduct.name} tiene solo ${dbProduct.stock} unidades (pediste ${item.quantity})`);
        continue;
      }
      trustedItems.push({
        productId: dbProduct.id,
        quantity: item.quantity,
        price: dbProduct.price, // Always use DB price
        title: dbProduct.name
      });
    }

    if (stockErrors.length > 0) {
      return NextResponse.json({
        error: 'Stock insuficiente: ' + stockErrors.join('. ')
      }, { status: 409 });
    }

    // Calculate total from DB prices
    const total = trustedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Create order + decrement stock atomically
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          total,
          paymentMethod,
          status: 'pending',
          userId: userId || undefined,
          items: {
            create: trustedItems.map(i => ({
              productId: i.productId,
              quantity: i.quantity,
              price: i.price
            }))
          }
        }
      });

      // Decrement stock atomically
      for (const item of trustedItems) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity } // Guard: only update if enough stock
          },
          data: {
            stock: { decrement: item.quantity }
          }
        });

        if (updated.count === 0) {
          throw new Error(`Stock insuficiente para ${item.title}`);
        }

        // Update LOW status
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (product) {
          await tx.product.update({
            where: { id: item.productId },
            data: { status: product.stock < 10 ? 'LOW' : 'OK' }
          });
        }
      }

      return order;
    });

    // Send emails (outside transaction — best effort)
    if (userId) {
      const userObj = await prisma.user.findUnique({ where: { id: userId } });
      if (userObj) {
        const emailContext = {
          orderId: newOrder.id,
          userName: userObj.name || 'Cliente',
          phone: userObj.phone || '',
          total,
          paymentMethod,
          items: trustedItems
        };

        try {
          await sendOrderEmail(userObj.email, emailContext, false);
        } catch (e) {
          console.error('Error enviando email al usuario:', e);
        }

        try {
          const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
          if (adminUser) {
            await sendAdminNotificationEmail(adminUser.email, emailContext, false);
          }
        } catch (e) {
          console.error('Error enviando email al admin:', e);
        }
      }
    }

    if (paymentMethod === 'transferencia') {
      const bankDetails = {
        bankName: process.env.BANK_NAME || 'Banco Ejemplo',
        accountType: process.env.ACCOUNT_TYPE || 'Cuenta Corriente',
        accountNumber: process.env.ACCOUNT_NUMBER || '123456789',
        alias: process.env.ALIAS || 'ALLAH.FRAGANCIAS',
        cuit: process.env.CUIT || '20-12345678-9',
        holderName: process.env.HOLDER_NAME || 'Allah Fragancias'
      };

      return NextResponse.json({
        success: true,
        message: 'Orden creada. Envía el comprobante de transferencia por WhatsApp para confirmar tu pago.',
        orderId: newOrder.id,
        bankDetails,
        showWhatsApp: true
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Orden creada. Coordina con el administrador para el pago en efectivo.',
      orderId: newOrder.id
    });
  } catch (error) {
    console.error("Error en Checkout:", error);
    return NextResponse.json({ error: 'Error procesando la compra' }, { status: 500 });
  }
}
