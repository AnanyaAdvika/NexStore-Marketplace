import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import dealRoutes from './routes/deal.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import vendorRoutes from './routes/vendor.routes.js';
import adminRoutes from './routes/admin.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import reviewRoutes from './routes/review.routes.js';
import addressRoutes from './routes/address.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import { prisma } from './utils/prisma.js';
import { errorHandler } from './middlewares/error.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or matching origins
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (origin.endsWith('.vercel.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check with Database Connectivity Verification
const healthHandler = async (_req: express.Request, res: express.Response) => {
  try {
    // Verify database connectivity
    const categoryCount = await prisma.category.count();
    const missingEnv: string[] = [];
    if (!process.env.JWT_SECRET) missingEnv.push('JWT_SECRET');

    return res.status(200).json({
      status: 'ok',
      database: 'connected',
      categoriesCount: categoryCount,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      service: 'NexStore Multi-Vendor Marketplace API',
      warnings: missingEnv.length > 0 ? `Missing env vars: ${missingEnv.join(', ')}` : undefined,
    });
  } catch (error: any) {
    return res.status(503).json({
      status: 'degraded',
      database: 'disconnected',
      error: error.message || 'Database connection failure',
      timestamp: new Date().toISOString(),
      service: 'NexStore Multi-Vendor Marketplace API',
    });
  }
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Error Handler
app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 MultiVendor API Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
