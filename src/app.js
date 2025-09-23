const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const tripRoutes = require('./routes/trip.routes');
const packinglistRoutes = require('./routes/packinglist.routes');
const productRoutes = require('./routes/product.routes');
const postRoutes = require('./routes/post.routes');

const newsRoutes = require('./routes/news.routes');
const userRoutes = require('./routes/user.routes');
const uploadRoutes = require('./routes/upload.routes');

const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());

// Debug middleware to log content types
app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  console.log('Content-Type:', req.get('Content-Type'));
  next();
});

// Apply body parsing to all routes EXCEPT upload
app.use((req, res, next) => {
  // Skip body parsing entirely for upload routes
  if (req.url.startsWith('/api/upload')) {
    return next();
  }
  
  // Apply JSON parsing for all other routes
  express.json({ limit: '10mb' })(req, res, next);
});

app.use((req, res, next) => {
  // Skip body parsing entirely for upload routes
  if (req.url.startsWith('/api/upload')) {
    return next();
  }
  
  // Apply URL-encoded parsing for all other routes
  express.urlencoded({ limit: '10mb', extended: true })(req, res, next);
});

app.use(morgan('dev'));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => res.send('PackLightly API'));

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/packinglists', packinglistRoutes);
app.use('/api/products', productRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

app.use(errorHandler);

module.exports = app;
