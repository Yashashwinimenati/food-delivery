const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// All order routes require authentication
router.use(authenticateToken);

// Order operations
router.post('/create', validate('createOrder'), orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:orderId', orderController.getOrderDetails);
router.post('/:orderId/cancel', orderController.cancelOrder);

module.exports = router; 