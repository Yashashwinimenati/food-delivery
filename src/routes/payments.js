const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

// All payment routes require authentication
router.use(authenticateToken);

router.post('/process', paymentController.processPayment);
router.get('/history', paymentController.getPaymentHistory);
router.get('/methods', paymentController.getPaymentMethods);
router.get('/:paymentId', paymentController.getPaymentDetails);
router.post('/:paymentId/refund', paymentController.refundPayment);

module.exports = router; 