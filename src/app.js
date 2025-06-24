const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const addressRoutes = require('./routes/addresses');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

// Import database initialization
const initDatabase = require('./config/initDatabase');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Food Delivery API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
    res.json({
        success: true,
        message: 'Food Delivery API Documentation',
        version: '1.0.0',
        endpoints: {
            auth: {
                base: '/api/auth',
                endpoints: [
                    'POST /register - Register a new user',
                    'POST /login - User login',
                    'POST /forgot-password - Request password reset',
                    'POST /reset-password - Reset password',
                    'GET /profile - Get user profile (protected)',
                    'PUT /profile - Update user profile (protected)',
                    'PUT /change-password - Change password (protected)',
                    'DELETE /account - Delete account (protected)'
                ]
            },
            restaurants: {
                base: '/api/restaurants',
                endpoints: [
                    'GET /search - Search restaurants',
                    'GET /:restaurantId - Get restaurant details',
                    'GET /:restaurantId/menu - Get restaurant menu',
                    'GET /:restaurantId/categories - Get menu categories',
                    'GET /:restaurantId/categories/:categoryId/items - Get category items'
                ]
            },
            cart: {
                base: '/api/cart',
                endpoints: [
                    'GET / - Get user cart (protected)',
                    'POST /items - Add item to cart (protected)',
                    'PUT /items/:itemId - Update cart item (protected)',
                    'DELETE /items/:itemId - Remove item from cart (protected)',
                    'DELETE / - Clear cart (protected)'
                ]
            },
            orders: {
                base: '/api/orders',
                endpoints: [
                    'POST / - Create new order (protected)',
                    'GET / - Get order history (protected)',
                    'GET /:orderId - Get order details (protected)',
                    'GET /:orderId/tracking - Track order (protected)',
                    'PUT /:orderId/cancel - Cancel order (protected)',
                    'POST /:orderId/reorder - Reorder (protected)'
                ]
            },
            addresses: {
                base: '/api/addresses',
                endpoints: [
                    'GET / - Get user addresses (protected)',
                    'POST / - Add new address (protected)',
                    'GET /:addressId - Get address details (protected)',
                    'PUT /:addressId - Update address (protected)',
                    'DELETE /:addressId - Delete address (protected)',
                    'PUT /:addressId/set-default - Set default address (protected)'
                ]
            },
            payments: {
                base: '/api/payments',
                endpoints: [
                    'POST /process - Process payment (protected)',
                    'GET /history - Get payment history (protected)',
                    'GET /methods - Get payment methods (protected)',
                    'GET /:paymentId - Get payment details (protected)',
                    'POST /:paymentId/refund - Refund payment (protected)'
                ]
            },
            reviews: {
                base: '/api/reviews',
                endpoints: [
                    'GET /restaurant/:restaurantId - Get restaurant reviews',
                    'GET /restaurant/:restaurantId/stats - Get review statistics',
                    'POST / - Create review (protected)',
                    'GET /user - Get user reviews (protected)',
                    'PUT /:reviewId - Update review (protected)',
                    'DELETE /:reviewId - Delete review (protected)'
                ]
            }
        },
        authentication: {
            type: 'JWT Bearer Token',
            header: 'Authorization: Bearer <token>'
        },
        response_format: {
            success: 'boolean',
            message: 'string',
            data: 'object/array (optional)',
            pagination: 'object (optional)'
        }
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// Search route
app.get('/api/search', (req, res) => {
    // This will be handled by restaurant controller
    res.redirect('/api/restaurants/search/global');
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
    try {
        // Initialize database
        await initDatabase();
        console.log('Database initialized successfully');

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Food Delivery API server running on port ${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start the server
if (require.main === module) {
    startServer();
}

module.exports = app; 