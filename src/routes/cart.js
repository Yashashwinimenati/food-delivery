const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// All cart routes require authentication
router.use(authenticateToken);

router.get('/', cartController.getCart);
router.post('/items', validate('addToCart'), cartController.addToCart);
router.put('/items/:itemId', validate('updateCartItem'), cartController.updateCartItem);
router.delete('/items/:itemId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

module.exports = router; 