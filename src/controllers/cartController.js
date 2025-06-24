const database = require('../config/database');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, HTTP_STATUS } = require('../utils/constants');
const { asyncHandler } = require('../middleware/errorHandler');

// Add item to cart
const addToCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { restaurantId, itemId, quantity, specialInstructions } = req.body;

    // Check if item exists and is available
    const item = await database.get(`
        SELECT mi.*, r.is_open, r.name as restaurant_name
        FROM menu_items mi
        JOIN restaurants r ON mi.restaurant_id = r.id
        WHERE mi.id = ? AND mi.restaurant_id = ?
    `, [itemId, restaurantId]);

    if (!item) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message: ERROR_MESSAGES.ITEM_NOT_FOUND
        });
    }

    if (!item.is_available) {
        return res.status(HTTP_STATUS.CONFLICT).json({
            success: false,
            message: ERROR_MESSAGES.ITEM_UNAVAILABLE
        });
    }

    if (!item.is_open) {
        return res.status(HTTP_STATUS.CONFLICT).json({
            success: false,
            message: ERROR_MESSAGES.RESTAURANT_CLOSED
        });
    }

    // Check if cart already has items from a different restaurant
    const existingCartItems = await database.all(
        'SELECT restaurant_id FROM cart WHERE user_id = ?',
        [userId]
    );

    if (existingCartItems.length > 0) {
        const existingRestaurantId = existingCartItems[0].restaurant_id;
        if (existingRestaurantId !== restaurantId) {
            return res.status(HTTP_STATUS.CONFLICT).json({
                success: false,
                message: ERROR_MESSAGES.CART_RESTAURANT_MISMATCH
            });
        }
    }

    // Check if item already exists in cart
    const existingCartItem = await database.get(
        'SELECT id, quantity FROM cart WHERE user_id = ? AND item_id = ?',
        [userId, itemId]
    );

    if (existingCartItem) {
        // Update existing item quantity
        const newQuantity = existingCartItem.quantity + quantity;
        await database.run(
            'UPDATE cart SET quantity = ?, special_instructions = ? WHERE id = ?',
            [newQuantity, specialInstructions, existingCartItem.id]
        );
    } else {
        // Add new item to cart
        await database.run(
            'INSERT INTO cart (user_id, restaurant_id, item_id, quantity, special_instructions) VALUES (?, ?, ?, ?, ?)',
            [userId, restaurantId, itemId, quantity, specialInstructions]
        );
    }

    // Get updated cart total
    const cartTotal = await getCartTotal(userId);

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.ITEM_ADDED_TO_CART,
        cartTotal: cartTotal.total,
        itemCount: cartTotal.itemCount
    });
});

// Get user's cart
const getCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const cartItems = await database.all(`
        SELECT 
            c.id,
            c.quantity,
            c.special_instructions,
            mi.id as item_id,
            mi.name,
            mi.description,
            mi.price,
            mi.is_veg,
            mi.image_url,
            r.id as restaurant_id,
            r.name as restaurant_name,
            r.delivery_fee,
            r.min_order_amount
        FROM cart c
        JOIN menu_items mi ON c.item_id = mi.id
        JOIN restaurants r ON c.restaurant_id = r.id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
    `, [userId]);

    if (cartItems.length === 0) {
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cart is empty',
            cart: {
                items: [],
                restaurant: null,
                subtotal: 0,
                deliveryFee: 0,
                total: 0,
                itemCount: 0
            }
        });
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = cartItems[0].delivery_fee;
    const total = subtotal + deliveryFee;
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // Format cart items
    const formattedItems = cartItems.map(item => ({
        id: item.id,
        itemId: item.item_id,
        name: item.name,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
        isVeg: item.is_veg === 1,
        image: item.image_url,
        specialInstructions: item.special_instructions
    }));

    const cart = {
        items: formattedItems,
        restaurant: {
            id: cartItems[0].restaurant_id,
            name: cartItems[0].restaurant_name,
            deliveryFee: cartItems[0].delivery_fee,
            minOrderAmount: cartItems[0].min_order_amount
        },
        subtotal,
        deliveryFee,
        total,
        itemCount
    };

    res.status(HTTP_STATUS.OK).json({
        success: true,
        cart
    });
});

// Update cart item quantity
const updateCartItem = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity, specialInstructions } = req.body;

    // Check if cart item exists and belongs to user
    const cartItem = await database.get(`
        SELECT c.*, mi.is_available, r.is_open
        FROM cart c
        JOIN menu_items mi ON c.item_id = mi.id
        JOIN restaurants r ON c.restaurant_id = r.id
        WHERE c.id = ? AND c.user_id = ?
    `, [itemId, userId]);

    if (!cartItem) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message: 'Cart item not found'
        });
    }

    if (!cartItem.is_available) {
        return res.status(HTTP_STATUS.CONFLICT).json({
            success: false,
            message: ERROR_MESSAGES.ITEM_UNAVAILABLE
        });
    }

    if (!cartItem.is_open) {
        return res.status(HTTP_STATUS.CONFLICT).json({
            success: false,
            message: ERROR_MESSAGES.RESTAURANT_CLOSED
        });
    }

    if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        await database.run(
            'DELETE FROM cart WHERE id = ?',
            [itemId]
        );
    } else {
        // Update quantity
        await database.run(
            'UPDATE cart SET quantity = ?, special_instructions = ? WHERE id = ?',
            [quantity, specialInstructions, itemId]
        );
    }

    // Get updated cart total
    const cartTotal = await getCartTotal(userId);

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.ITEM_UPDATED_IN_CART,
        cartTotal: cartTotal.total,
        itemCount: cartTotal.itemCount
    });
});

// Remove item from cart
const removeFromCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { itemId } = req.params;

    // Check if cart item exists and belongs to user
    const cartItem = await database.get(
        'SELECT id FROM cart WHERE id = ? AND user_id = ?',
        [itemId, userId]
    );

    if (!cartItem) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message: 'Cart item not found'
        });
    }

    // Remove item
    await database.run(
        'DELETE FROM cart WHERE id = ?',
        [itemId]
    );

    // Get updated cart total
    const cartTotal = await getCartTotal(userId);

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.ITEM_REMOVED_FROM_CART,
        cartTotal: cartTotal.total,
        itemCount: cartTotal.itemCount
    });
});

// Clear cart
const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    await database.run(
        'DELETE FROM cart WHERE user_id = ?',
        [userId]
    );

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.CART_CLEARED,
        cartTotal: 0,
        itemCount: 0
    });
});

// Helper function to get cart total
const getCartTotal = async (userId) => {
    const cartItems = await database.all(`
        SELECT 
            c.quantity,
            mi.price,
            r.delivery_fee
        FROM cart c
        JOIN menu_items mi ON c.item_id = mi.id
        JOIN restaurants r ON c.restaurant_id = r.id
        WHERE c.user_id = ?
    `, [userId]);

    if (cartItems.length === 0) {
        return { total: 0, itemCount: 0 };
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = cartItems[0].delivery_fee;
    const total = subtotal + deliveryFee;
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return { total, itemCount };
};

module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
}; 