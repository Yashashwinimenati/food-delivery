const database = require('../config/database');
const { 
    generateOrderId, 
    calculateDistance, 
    calculateDeliveryFee, 
    calculateEstimatedDeliveryTime,
    formatAddress 
} = require('../utils/helpers');
const { 
    ERROR_MESSAGES, 
    SUCCESS_MESSAGES, 
    HTTP_STATUS, 
    ORDER_STATUS,
    TAX_RATE 
} = require('../utils/constants');
const { asyncHandler } = require('../middleware/errorHandler');

// Create order from cart
const createOrder = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { addressId, paymentMethod, specialInstructions } = req.body;

    // Get user's cart
    const cartItems = await database.all(`
        SELECT 
            c.*,
            mi.name as item_name,
            mi.price,
            mi.is_available,
            r.id as restaurant_id,
            r.name as restaurant_name,
            r.delivery_fee,
            r.min_order_amount,
            r.avg_preparation_time,
            r.latitude as restaurant_lat,
            r.longitude as restaurant_lng,
            r.is_open
        FROM cart c
        JOIN menu_items mi ON c.item_id = mi.id
        JOIN restaurants r ON c.restaurant_id = r.id
        WHERE c.user_id = ?
    `, [userId]);

    if (cartItems.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: ERROR_MESSAGES.CART_EMPTY
        });
    }

    // Check if restaurant is open
    if (!cartItems[0].is_open) {
        return res.status(HTTP_STATUS.CONFLICT).json({
            success: false,
            message: ERROR_MESSAGES.RESTAURANT_CLOSED
        });
    }

    // Check if all items are available
    const unavailableItems = cartItems.filter(item => !item.is_available);
    if (unavailableItems.length > 0) {
        return res.status(HTTP_STATUS.CONFLICT).json({
            success: false,
            message: ERROR_MESSAGES.ITEM_UNAVAILABLE,
            unavailableItems: unavailableItems.map(item => item.item_name)
        });
    }

    // Get delivery address
    const address = await database.get(
        'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
        [addressId, userId]
    );

    if (!address) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message: 'Delivery address not found'
        });
    }

    // Calculate distance and delivery fee
    const distance = calculateDistance(
        address.latitude, 
        address.longitude, 
        cartItems[0].restaurant_lat, 
        cartItems[0].restaurant_lng
    );

    const deliveryFee = calculateDeliveryFee(distance, cartItems[0].delivery_fee);
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = (subtotal * TAX_RATE) / 100;
    const totalAmount = subtotal + deliveryFee + taxAmount;

    // Check minimum order amount
    if (subtotal < cartItems[0].min_order_amount) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: ERROR_MESSAGES.MIN_ORDER_NOT_MET,
            minOrderAmount: cartItems[0].min_order_amount
        });
    }

    // Generate order ID
    const orderId = generateOrderId();

    // Calculate estimated delivery time
    const estimatedDelivery = calculateEstimatedDeliveryTime(
        cartItems[0].avg_preparation_time,
        distance
    );

    // Create order
    const orderResult = await database.run(`
        INSERT INTO orders (
            order_id, user_id, restaurant_id, address_id, status,
            subtotal, delivery_fee, tax_amount, total_amount,
            payment_method, special_instructions, estimated_delivery_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        orderId, userId, cartItems[0].restaurant_id, addressId, ORDER_STATUS.PLACED,
        subtotal, deliveryFee, taxAmount, totalAmount,
        paymentMethod, specialInstructions, estimatedDelivery.estimatedTime
    ]);

    // Create order items
    for (const item of cartItems) {
        await database.run(`
            INSERT INTO order_items (
                order_id, menu_item_id, item_name, quantity,
                unit_price, total_price, special_instructions
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            orderResult.id, item.item_id, item.item_name, item.quantity,
            item.price, item.price * item.quantity, item.special_instructions
        ]);
    }

    // Create order tracking entry
    await database.run(`
        INSERT INTO order_tracking (order_id, status, description)
        VALUES (?, ?, ?)
    `, [orderResult.id, ORDER_STATUS.PLACED, 'Order has been placed successfully']);

    // Clear cart
    await database.run('DELETE FROM cart WHERE user_id = ?', [userId]);

    res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.ORDER_PLACED,
        orderId,
        totalAmount,
        estimatedDeliveryTime: estimatedDelivery.timeRange,
        status: ORDER_STATUS.PLACED
    });
});

// Get user's order history
const getOrders = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    let query = `
        SELECT 
            o.order_id,
            o.status,
            o.total_amount,
            o.created_at,
            o.delivered_at,
            r.name as restaurant_name,
            COUNT(oi.id) as item_count
        FROM orders o
        JOIN restaurants r ON o.restaurant_id = r.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ?
    `;

    const queryParams = [userId];

    if (status) {
        query += ' AND o.status = ?';
        queryParams.push(status);
    }

    query += ' GROUP BY o.id ORDER BY o.created_at DESC';

    // Get total count
    const countQuery = `
        SELECT COUNT(*) as total FROM orders WHERE user_id = ?
        ${status ? ' AND status = ?' : ''}
    `;
    const countParams = status ? [userId, status] : [userId];
    const totalResult = await database.get(countQuery, countParams);
    const total = totalResult.total;

    // Apply pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const orders = await database.all(query, queryParams);

    const formattedOrders = orders.map(order => ({
        orderId: order.order_id,
        restaurantName: order.restaurant_name,
        items: order.item_count,
        totalAmount: order.total_amount,
        status: order.status,
        orderedAt: order.created_at,
        deliveredAt: order.delivered_at
    }));

    const totalPages = Math.ceil(total / limit);

    res.status(HTTP_STATUS.OK).json({
        success: true,
        orders: formattedOrders,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    });
});

// Get order details with tracking
const getOrderDetails = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { orderId } = req.params;

    // Get order details
    const order = await database.get(`
        SELECT 
            o.*,
            r.name as restaurant_name,
            r.phone as restaurant_phone,
            a.address_line1, a.address_line2, a.city, a.state, a.pincode,
            dp.name as delivery_partner_name,
            dp.phone as delivery_partner_phone
        FROM orders o
        JOIN restaurants r ON o.restaurant_id = r.id
        JOIN addresses a ON o.address_id = a.id
        LEFT JOIN delivery_partners dp ON o.delivery_partner_id = dp.id
        WHERE o.order_id = ? AND o.user_id = ?
    `, [orderId, userId]);

    if (!order) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message: ERROR_MESSAGES.ORDER_NOT_FOUND
        });
    }

    // Get order items
    const orderItems = await database.all(`
        SELECT 
            item_name, quantity, unit_price, total_price, special_instructions
        FROM order_items
        WHERE order_id = ?
    `, [order.id]);

    // Get order tracking
    const tracking = await database.all(`
        SELECT status, description, created_at
        FROM order_tracking
        WHERE order_id = ?
        ORDER BY created_at ASC
    `, [order.id]);

    const formattedOrder = {
        orderId: order.order_id,
        restaurant: {
            name: order.restaurant_name,
            phone: order.restaurant_phone
        },
        items: orderItems.map(item => ({
            name: item.item_name,
            quantity: item.quantity,
            price: item.unit_price,
            total: item.total_price,
            specialInstructions: item.special_instructions
        })),
        deliveryAddress: formatAddress({
            address_line1: order.address_line1,
            address_line2: order.address_line2,
            city: order.city,
            state: order.state,
            pincode: order.pincode
        }),
        status: order.status,
        tracking: tracking.map(track => ({
            status: track.status,
            description: track.description,
            timestamp: track.created_at
        })),
        deliveryPartner: order.delivery_partner_name ? {
            name: order.delivery_partner_name,
            phone: order.delivery_partner_phone
        } : null,
        subtotal: order.subtotal,
        deliveryFee: order.delivery_fee,
        taxAmount: order.tax_amount,
        totalAmount: order.total_amount,
        paymentMethod: order.payment_method,
        specialInstructions: order.special_instructions,
        orderedAt: order.created_at,
        estimatedDeliveryTime: order.estimated_delivery_time,
        deliveredAt: order.delivered_at
    };

    res.status(HTTP_STATUS.OK).json({
        success: true,
        order: formattedOrder
    });
});

// Cancel order
const cancelOrder = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { orderId } = req.params;

    // Get order
    const order = await database.get(
        'SELECT id, status FROM orders WHERE order_id = ? AND user_id = ?',
        [orderId, userId]
    );

    if (!order) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message: ERROR_MESSAGES.ORDER_NOT_FOUND
        });
    }

    // Check if order can be cancelled
    const cancellableStatuses = [ORDER_STATUS.PLACED, ORDER_STATUS.CONFIRMED];
    if (!cancellableStatuses.includes(order.status)) {
        return res.status(HTTP_STATUS.CONFLICT).json({
            success: false,
            message: ERROR_MESSAGES.ORDER_CANNOT_BE_CANCELLED
        });
    }

    // Update order status
    await database.run(
        'UPDATE orders SET status = ? WHERE id = ?',
        [ORDER_STATUS.CANCELLED, order.id]
    );

    // Add tracking entry
    await database.run(`
        INSERT INTO order_tracking (order_id, status, description)
        VALUES (?, ?, ?)
    `, [order.id, ORDER_STATUS.CANCELLED, 'Order has been cancelled by customer']);

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.ORDER_CANCELLED
    });
});

module.exports = {
    createOrder,
    getOrders,
    getOrderDetails,
    cancelOrder
}; 