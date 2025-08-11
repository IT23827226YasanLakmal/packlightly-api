const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const tripRoutes = require('./routes/trip.routes');
const packingRoutes = require('./routes/packing.routes');
const productRoutes = require('./routes/product.routes');
const postRoutes = require('./routes/post.routes');
const newsRoutes = require('./routes/news.routes');
const userRoutes = require('./routes/user.routes');

const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.send('PackLightly API'));

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/packing', packingRoutes);
app.use('/api/products', productRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/users', userRoutes);

app.use(errorHandler);

module.exports = app;
