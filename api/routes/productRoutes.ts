import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { isAdmin } from '../middlewares/auth';

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

router.post('/', isAdmin, upload.array('newImages', 5), async (req: any, res: any) => {
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

router.put('/:id', isAdmin, upload.array('newImages', 5), async (req: any, res: any) => {
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

router.delete('/:id', isAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Producto eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

export default router;
