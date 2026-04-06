import 'dotenv/config';
import express from 'express';
import { sendOrderEmail, sendAdminNotificationEmail } from './mailer';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ storage: multer.memoryStorage() });

const JWT_SECRET = process.env.JWT_SECRET || 'secret_palabra_segura_mirage';

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    // Check si el usuario existe
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'El correo ya está registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, phone: phone || '' }
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role } });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: 'Error al registrar usuario.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Credenciales inválidas.' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});

const isAdmin = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Rol insuficiente.' });
    }
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

const isAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

app.get('/api/my-orders', isAuth, async (req: any, res: any) => {
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


// ----------------------------------------------------
// PRODUCT ROUTES
// ----------------------------------------------------
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Protegemos POST, PUT, DELETE con isAdmin
app.post('/api/products', isAdmin, upload.array('newImages', 5), async (req, res) => {
  try {
    const data = req.body;
    let images: string[] = [];
    
    if (data.existingImages) {
        try { images = JSON.parse(data.existingImages); } catch (e) {}
    }

    if (req.files && Array.isArray(req.files)) {
      const uploadPromises = req.files.map(file => {
        return new Promise<string>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'allah_fragancias' },
            (error, result) => {
              if (result) resolve(result.secure_url);
              else reject(error);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      images = [...images, ...uploadedUrls];
    }

    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        collection: data.collection,
        price: parseFloat(data.price) || 0,
        stock: parseInt(data.stock) || 0,
        status: data.stock < 10 ? 'LOW' : 'OK',
        images: images
      }
    });

    res.json(newProduct);
  } catch (error) {
    console.error("Error creando producto backend:", error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

app.put('/api/products/:id', isAdmin, upload.array('newImages', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    let updateData: any = { ...data };
    
    if (data.stock !== undefined) {
      updateData.stock = parseInt(data.stock, 10);
      updateData.status = updateData.stock < 10 ? 'LOW' : 'OK';
    }
    if (data.price !== undefined) {
      updateData.price = parseFloat(data.price);
    }
    
    let currentImages: string[] = [];
    let hasImageUpdates = false;

    if (data.existingImages !== undefined) {
      hasImageUpdates = true;
      try { currentImages = JSON.parse(data.existingImages); } catch (e) {}
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      hasImageUpdates = true;
      const uploadPromises = req.files.map(file => {
        return new Promise<string>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'allah_fragancias' },
            (error, result) => {
              if (result) resolve(result.secure_url);
              else reject(error);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      currentImages = [...currentImages, ...uploadedUrls];
    }
    
    if (hasImageUpdates) {
       updateData.images = currentImages;
    }
    
    delete updateData.existingImages;
    delete updateData.newImages;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error en PUT:", error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

app.delete('/api/products/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Producto eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// ----------------------------------------------------
// CHECKOUT & MERCADOPAGO ROUTES
// ----------------------------------------------------
import { MercadoPagoConfig, Preference } from 'mercadopago';

const mpClient = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-dummy-token' 
});

app.post('/api/checkout', async (req: any, res: any) => {
  try {
    const { items, paymentMethod, userId } = req.body;
    
    // items = [{ productId, quantity, price, title }]
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    const total = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    
    // Crear la orden en la BD (marcada como pendiente de pago o confirmacion)
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

    // Lógica Específica
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
       // Configurar la Preferncia de MP
       const preference = new Preference(mpClient);
       
       const mpItems = items.map((i: any) => ({
         id: i.productId,
         title: i.title,
         quantity: i.quantity,
         unit_price: i.price,
         currency_id: 'ARS',
       }));

       // Agregamos notification_url si quisieramos webhooks vivos al subirse:
       // notification_url: 'https://midominio.com/api/webhooks/mercadopago'

       const createdPreference = await preference.create({
         body: {
           items: mpItems,
           external_reference: newOrder.id,
           back_urls: {
              success: 'https://localhost:3000/?status=success',
              failure: 'https://localhost:3000/?status=failure',
              pending: 'https://localhost:3000/?status=pending'
           },
           // auto_return: 'approved' // MercadoPago rechaza auto_redirect hacia localhost.
         }
       });

       // Guardar la preference en la DB para trackeo
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

// Endpoint Webhook para recibir notificaciones reales de MP
app.post('/api/webhooks/mercadopago', async (req: any, res: any) => {
  try {
    const { type, data } = req.body;
    
    // Si es un evento de pago
    if (type === 'payment' && data?.id) {
       // Aca se haria un fetch o uso SDK para buscar el payment por su ID
       // y verificar si su status === 'approved'. Logica omitida para brevedad.
       
       // Simulamos que encontramos la orden en DB con ese payment.
       // await sendOrderEmail(user.email, orderContext, true);
       console.log("Notificación de MP procesada", data.id);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send('Webhook error');
  }
});

export default app;
