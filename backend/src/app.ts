import express, { 
    Application, Request, Response 
} from 'express';

import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app: Application = express(); // Global Middlewares

app.use(helmet());
app.use(cors());
app.use(express.json());// Health Check Route
app.get
('/api/v1/health', 
    (req: Request, res: Response) => 
    {res.status(200).json({ status: 'success', 
        message: 'API is running smoothly.' });
    }
);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes);

export default app;