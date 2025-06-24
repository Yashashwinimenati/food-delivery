// Order Status Constants
const ORDER_STATUS = {
    PLACED: 'placed',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

// Payment Methods
const PAYMENT_METHODS = {
    CASH: 'cash',
    CARD: 'card',
    UPI: 'upi',
    WALLET: 'wallet'
};

// Payment Status
const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
};

// Delivery Partner Status
const DELIVERY_STATUS = {
    AVAILABLE: 'available',
    BUSY: 'busy',
    OFFLINE: 'offline'
};

// Address Types
const ADDRESS_TYPES = {
    HOME: 'home',
    WORK: 'work',
    OTHER: 'other'
};

// Vehicle Types
const VEHICLE_TYPES = {
    BIKE: 'bike',
    CAR: 'car',
    BICYCLE: 'bicycle'
};

// HTTP Status Codes
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
};

// Tax Rate (in percentage)
const TAX_RATE = 5; // 5% GST

// Delivery Configuration
const DELIVERY_CONFIG = {
    MAX_DISTANCE_KM: process.env.MAX_DELIVERY_DISTANCE_KM || 10,
    DEFAULT_FEE: process.env.DEFAULT_DELIVERY_FEE || 40,
    BASE_FEE_PER_KM: process.env.BASE_DELIVERY_FEE_PER_KM || 5
};

// Rate Limiting
const RATE_LIMIT = {
    WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 900000, // 15 minutes
    MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 100
};

// JWT Configuration
const JWT_CONFIG = {
    SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d'
};

// Validation Rules
const VALIDATION_RULES = {
    PASSWORD_MIN_LENGTH: 6,
    PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PINCODE_REGEX: /^[1-9][0-9]{5}$/
};

// Error Messages
const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User not found',
    RESTAURANT_NOT_FOUND: 'Restaurant not found',
    ITEM_NOT_FOUND: 'Menu item not found',
    ORDER_NOT_FOUND: 'Order not found',
    CART_EMPTY: 'Cart is empty',
    RESTAURANT_CLOSED: 'Restaurant is currently closed',
    ITEM_UNAVAILABLE: 'Item is currently unavailable',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
    INVALID_TOKEN: 'Invalid or expired token',
    ADDRESS_OUT_OF_RANGE: 'Delivery address is out of service range',
    MIN_ORDER_NOT_MET: 'Order amount is below minimum requirement',
    CART_RESTAURANT_MISMATCH: 'Cart can only contain items from one restaurant',
    ORDER_ALREADY_CANCELLED: 'Order has already been cancelled',
    ORDER_CANNOT_BE_CANCELLED: 'Order cannot be cancelled at this stage'
};

// Success Messages
const SUCCESS_MESSAGES = {
    USER_REGISTERED: 'User registered successfully',
    USER_LOGGED_IN: 'User logged in successfully',
    ADDRESS_ADDED: 'Address added successfully',
    ADDRESS_UPDATED: 'Address updated successfully',
    ITEM_ADDED_TO_CART: 'Item added to cart',
    ITEM_UPDATED_IN_CART: 'Item updated in cart',
    ITEM_REMOVED_FROM_CART: 'Item removed from cart',
    CART_CLEARED: 'Cart cleared successfully',
    ORDER_PLACED: 'Order placed successfully',
    ORDER_CANCELLED: 'Order cancelled successfully',
    PAYMENT_PROCESSED: 'Payment processed successfully',
    REVIEW_ADDED: 'Review added successfully'
};

module.exports = {
    ORDER_STATUS,
    PAYMENT_METHODS,
    PAYMENT_STATUS,
    DELIVERY_STATUS,
    ADDRESS_TYPES,
    VEHICLE_TYPES,
    HTTP_STATUS,
    TAX_RATE,
    DELIVERY_CONFIG,
    RATE_LIMIT,
    JWT_CONFIG,
    VALIDATION_RULES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES
}; 