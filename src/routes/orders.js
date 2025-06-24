const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// All order routes require authentication
router.use(authenticateToken);

router.post('/', validate('createOrder'), orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:orderId', orderController.getOrderDetails);
router.put('/:orderId/cancel', orderController.cancelOrder);

module.exports = router; 