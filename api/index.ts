import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Rutas
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// Montaje de rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api', orderRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

export default app;
