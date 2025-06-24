const crypto = require('crypto');
const moment = require('moment');

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

// Generate unique order ID
function generateOrderId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD${timestamp.slice(-6)}${random}`;
}

// Generate transaction ID for payments
function generateTransactionId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN${timestamp.slice(-8)}${random}`;
}

// Hash password using bcrypt
async function hashPassword(password) {
    const bcrypt = require('bcryptjs');
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// Compare password with hash
async function comparePassword(password, hash) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(password, hash);
}

// Generate JWT token
function generateToken(payload) {
    const jwt = require('jsonwebtoken');
    const { JWT_CONFIG } = require('./constants');
    return jwt.sign(payload, JWT_CONFIG.SECRET, { expiresIn: JWT_CONFIG.EXPIRES_IN });
}

// Verify JWT token
function verifyToken(token) {
    const jwt = require('jsonwebtoken');
    const { JWT_CONFIG } = require('./constants');
    try {
        return jwt.verify(token, JWT_CONFIG.SECRET);
    } catch (error) {
        return null;
    }
}

// Calculate delivery fee based on distance
function calculateDeliveryFee(distance, baseFee = 40, perKmFee = 5) {
    if (distance <= 2) {
        return baseFee;
    }
    return baseFee + (Math.ceil(distance - 2) * perKmFee);
}

// Calculate estimated delivery time
function calculateEstimatedDeliveryTime(preparationTime, distance) {
    const avgSpeed = 20; // km/h for delivery
    const deliveryTime = Math.ceil(distance / avgSpeed * 60); // in minutes
    const totalTime = preparationTime + deliveryTime;
    
    const now = moment();
    const estimatedTime = now.add(totalTime, 'minutes');
    
    return {
        totalMinutes: totalTime,
        estimatedTime: estimatedTime.format('YYYY-MM-DD HH:mm:ss'),
        timeRange: `${totalTime}-${totalTime + 5} minutes`
    };
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Sanitize input string
function sanitizeString(str) {
    if (!str) return '';
    return str.replace(/[<>]/g, '').trim();
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone number format
function isValidPhone(phone) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
}

// Validate pincode format (Indian)
function isValidPincode(pincode) {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
}

// Check if restaurant is open
function isRestaurantOpen(openingTime, closingTime) {
    const now = moment();
    const today = now.format('YYYY-MM-DD');
    
    const openTime = moment(`${today} ${openingTime}`, 'YYYY-MM-DD HH:mm');
    const closeTime = moment(`${today} ${closingTime}`, 'YYYY-MM-DD HH:mm');
    
    // Handle restaurants that close after midnight
    if (closeTime.isBefore(openTime)) {
        closeTime.add(1, 'day');
    }
    
    return now.isBetween(openTime, closeTime, null, '[]');
}

// Parse JSON safely
function safeJsonParse(str, defaultValue = null) {
    try {
        return JSON.parse(str);
    } catch (error) {
        return defaultValue;
    }
}

// Format address for display
function formatAddress(address) {
    const parts = [
        address.address_line1,
        address.address_line2,
        address.city,
        address.state,
        address.pincode
    ].filter(Boolean);
    
    return parts.join(', ');
}

// Calculate average rating
function calculateAverageRating(ratings) {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal place
}

// Generate pagination info
function generatePagination(page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    
    return {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        offset,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
}

// Format order status for display
function formatOrderStatus(status) {
    const statusMap = {
        'placed': 'Order Placed',
        'confirmed': 'Order Confirmed',
        'preparing': 'Preparing Your Order',
        'ready': 'Ready for Pickup',
        'out_for_delivery': 'Out for Delivery',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };
    
    return statusMap[status] || status;
}

// Get order status color for UI
function getOrderStatusColor(status) {
    const colorMap = {
        'placed': '#FFA500',
        'confirmed': '#4169E1',
        'preparing': '#FF8C00',
        'ready': '#32CD32',
        'out_for_delivery': '#FF6347',
        'delivered': '#228B22',
        'cancelled': '#DC143C'
    };
    
    return colorMap[status] || '#808080';
}

// Validate coordinates
function isValidCoordinates(latitude, longitude) {
    return (
        latitude >= -90 && latitude <= 90 &&
        longitude >= -180 && longitude <= 180
    );
}

// Sleep function for async operations
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate random string
function generateRandomString(length = 8) {
    return crypto.randomBytes(length).toString('hex');
}

// Mask sensitive data
function maskData(data, type = 'email') {
    if (!data) return '';
    
    switch (type) {
        case 'email':
            const [username, domain] = data.split('@');
            return `${username.charAt(0)}***@${domain}`;
        case 'phone':
            return data.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
        case 'card':
            return data.replace(/(\d{4})\d{8}(\d{4})/, '$1********$2');
        default:
            return data;
    }
}

module.exports = {
    calculateDistance,
    generateOrderId,
    generateTransactionId,
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken,
    calculateDeliveryFee,
    calculateEstimatedDeliveryTime,
    formatCurrency,
    sanitizeString,
    isValidEmail,
    isValidPhone,
    isValidPincode,
    isRestaurantOpen,
    safeJsonParse,
    formatAddress,
    calculateAverageRating,
    generatePagination,
    formatOrderStatus,
    getOrderStatusColor,
    isValidCoordinates,
    sleep,
    generateRandomString,
    maskData
}; 