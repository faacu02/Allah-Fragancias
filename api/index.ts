import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Obtener todos los productos
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

// Crear un producto nuevo
app.post('/api/products', async (req, res) => {
  try {
    const data = req.body;
    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        collection: data.collection,
        price: parseFloat(data.price) || 0,
        stock: parseInt(data.stock) || 0,
        status: data.stock < 10 ? 'LOW' : 'OK',
        image: data.image
      }
    });
    res.json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// Editar un producto (precio o stock)
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    // Si envían stock nuevo, calculamos el status, de lo contrario lo mantenemos
    let updateData: any = { ...data };
    if (data.stock !== undefined) {
      updateData.stock = parseInt(data.stock, 10);
      updateData.status = updateData.stock < 10 ? 'LOW' : 'OK';
    }
    if (data.price !== undefined) {
      updateData.price = parseFloat(data.price);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData
    });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Eliminar producto
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Producto eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

export default app;
