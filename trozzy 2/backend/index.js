const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const reviewsRouter = require('./src/routes/simple-reviews');
const productsRouter = require('./src/routes/simple-products');
const categoriesRouter = require('./src/routes/simple-categories');
const bannersRouter = require('./src/routes/simple-banners');
const uploadRouter = require('./src/routes/simple-upload');
const adminProductsRouter = require('./src/routes/admin-products');
const adminCategoriesRouter = require('./src/routes/admin-categories');
const adminBannersRouter = require('./src/routes/admin-banners');
const adminDashboardRouter = require('./src/routes/admin-dashboard');
const adminUsersRouter = require('./src/routes/admin-users');
const authRouter = require('./src/routes/auth');
const adminAuthRouter = require('./src/routes/adminAuth');
const userAuthRouter = require('./src/routes/userAuth');
const wishlistRouter = require('./src/routes/wishlist');
const cartRouter = require('./src/routes/cart');
const ordersRouter = require('./src/routes/simple-orders');

const app = express();
const PORT = process.env.PORT || 5050;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 2000, // higher limit in dev to avoid 429 during admin actions
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/reviews', reviewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/banners', bannersRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/admin/products', adminProductsRouter);
app.use('/api/admin/categories', adminCategoriesRouter);
app.use('/api/admin/banners', adminBannersRouter);
app.use('/api/admin/users', adminUsersRouter);
app.use('/api/admin', adminDashboardRouter);
app.use('/api/auth/admin', adminAuthRouter);
app.use('/api/auth/user', userAuthRouter);
app.use('/api/auth', authRouter); // Keep for backward compatibility
app.use('/api/wishlist', wishlistRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TROZZY Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB Atlas Connected');

    // Start server only after DB is ready
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 TROZZY Backend Server running on port ${PORT}`);
      console.log(`📊 MongoDB Atlas connected`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

module.exports = app;
