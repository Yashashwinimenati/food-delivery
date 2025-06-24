const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// All cart routes require authentication
router.use(authenticateToken);

// Cart operations
router.post('/add', validate('addToCart'), cartController.addToCart);
router.get('/', cartController.getCart);
router.put('/update/:itemId', validate('updateCartItem'), cartController.updateCartItem);
router.delete('/remove/:itemId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

module.exports = router; 