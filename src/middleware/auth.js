const { verifyToken } = require('../utils/helpers');
const { ERROR_MESSAGES, HTTP_STATUS } = require('../utils/constants');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_TOKEN,
            error: 'Access token is required'
        });
    }

    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_TOKEN,
                error: 'Invalid or expired token'
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_TOKEN,
            error: 'Token verification failed'
        });
    }
};

// Middleware to check if user is the owner of a resource
const authorizeOwner = (resourceType) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const resourceId = req.params.id || req.params.userId || req.params.orderId;
            
            if (!resourceId) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Resource ID is required'
                });
            }

            // Get the database instance
            const database = require('../config/database');
            
            let query, params;
            
            switch (resourceType) {
                case 'order':
                    query = 'SELECT user_id FROM orders WHERE id = ? OR order_id = ?';
                    params = [resourceId, resourceId];
                    break;
                case 'address':
                    query = 'SELECT user_id FROM addresses WHERE id = ?';
                    params = [resourceId];
                    break;
                case 'cart':
                    query = 'SELECT user_id FROM cart WHERE id = ?';
                    params = [resourceId];
                    break;
                case 'review':
                    query = 'SELECT user_id FROM reviews WHERE id = ?';
                    params = [resourceId];
                    break;
                default:
                    return res.status(HTTP_STATUS.BAD_REQUEST).json({
                        success: false,
                        message: 'Invalid resource type'
                    });
            }

            const resource = await database.get(query, params);
            
            if (!resource) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} not found`
                });
            }

            if (resource.user_id !== userId) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
                    error: 'You can only access your own resources'
                });
            }

            next();
        } catch (error) {
            console.error('Authorization error:', error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Authorization check failed',
                error: error.message
            });
        }
    };
};

// Middleware to check if user is admin (for restaurant management)
const requireAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            message: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
            error: 'Admin access required'
        });
    }
    next();
};

// Middleware to check if user is restaurant owner
const requireRestaurantOwner = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const restaurantId = req.params.restaurantId || req.body.restaurantId;
        
        if (!restaurantId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Restaurant ID is required'
            });
        }

        const database = require('../config/database');
        const restaurant = await database.get(
            'SELECT owner_id FROM restaurants WHERE id = ?',
            [restaurantId]
        );

        if (!restaurant) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: ERROR_MESSAGES.RESTAURANT_NOT_FOUND
            });
        }

        if (restaurant.owner_id !== userId && !req.user.isAdmin) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
                error: 'Only restaurant owner can perform this action'
            });
        }

        next();
    } catch (error) {
        console.error('Restaurant owner check error:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Authorization check failed',
            error: error.message
        });
    }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = verifyToken(token);
            if (decoded) {
                req.user = decoded;
            }
        } catch (error) {
            // Token is invalid, but we don't fail the request
            console.warn('Invalid optional token:', error.message);
        }
    }

    next();
};

module.exports = {
    authenticateToken,
    authorizeOwner,
    requireAdmin,
    requireRestaurantOwner,
    optionalAuth
}; 