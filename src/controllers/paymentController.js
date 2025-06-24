const db = require('../config/database');
const { generateOrderId } = require('../utils/helpers');
const { PAYMENT_STATUS, PAYMENT_METHODS } = require('../utils/constants');

class PaymentController {
  // Process payment for an order
  async processPayment(req, res) {
    try {
      const { orderId, paymentMethod, cardDetails } = req.body;
      const userId = req.user.id;

      // Validate input
      if (!orderId || !paymentMethod) {
        return res.status(400).json({
          success: false,
          message: 'Order ID and payment method are required'
        });
      }

      if (!PAYMENT_METHODS.includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method'
        });
      }

      // Get order details
      const order = await db.get(
        'SELECT * FROM orders WHERE id = ? AND user_id = ?',
        [orderId, userId]
      );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.payment_status === PAYMENT_STATUS.COMPLETED) {
        return res.status(400).json({
          success: false,
          message: 'Payment already completed for this order'
        });
      }

      // Simulate payment processing
      const paymentId = generateOrderId('PAY');
      const isPaymentSuccessful = Math.random() > 0.1; // 90% success rate

      const paymentStatus = isPaymentSuccessful 
        ? PAYMENT_STATUS.COMPLETED 
        : PAYMENT_STATUS.FAILED;

      // Create payment record
      const paymentData = {
        id: paymentId,
        order_id: orderId,
        user_id: userId,
        amount: order.total_amount,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        transaction_id: isPaymentSuccessful ? generateOrderId('TXN') : null,
        payment_date: new Date().toISOString(),
        card_last_four: cardDetails?.cardNumber?.slice(-4) || null,
        card_type: cardDetails?.cardType || null
      };

      await db.run(`
        INSERT INTO payments (
          id, order_id, user_id, amount, payment_method, payment_status,
          transaction_id, payment_date, card_last_four, card_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        paymentData.id, paymentData.order_id, paymentData.user_id,
        paymentData.amount, paymentData.payment_method, paymentData.payment_status,
        paymentData.transaction_id, paymentData.payment_date,
        paymentData.card_last_four, paymentData.card_type
      ]);

      // Update order payment status
      await db.run(
        'UPDATE orders SET payment_status = ? WHERE id = ?',
        [paymentStatus, orderId]
      );

      if (isPaymentSuccessful) {
        // Update order status to confirmed
        await db.run(
          'UPDATE orders SET status = ? WHERE id = ?',
          ['confirmed', orderId]
        );
      }

      res.status(200).json({
        success: true,
        message: isPaymentSuccessful ? 'Payment processed successfully' : 'Payment failed',
        data: {
          paymentId: paymentData.id,
          status: paymentStatus,
          transactionId: paymentData.transaction_id,
          amount: paymentData.amount
        }
      });

    } catch (error) {
      console.error('Payment processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing payment'
      });
    }
  }

  // Get payment history for user
  async getPaymentHistory(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const payments = await db.all(`
        SELECT p.*, o.order_number, r.name as restaurant_name
        FROM payments p
        JOIN orders o ON p.order_id = o.id
        JOIN restaurants r ON o.restaurant_id = r.id
        WHERE p.user_id = ?
        ORDER BY p.payment_date DESC
        LIMIT ? OFFSET ?
      `, [userId, limit, offset]);

      const totalCount = await db.get(
        'SELECT COUNT(*) as count FROM payments WHERE user_id = ?',
        [userId]
      );

      res.status(200).json({
        success: true,
        data: {
          payments,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount.count,
            totalPages: Math.ceil(totalCount.count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get payment history error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching payment history'
      });
    }
  }

  // Get payment details by payment ID
  async getPaymentDetails(req, res) {
    try {
      const { paymentId } = req.params;
      const userId = req.user.id;

      const payment = await db.get(`
        SELECT p.*, o.order_number, r.name as restaurant_name
        FROM payments p
        JOIN orders o ON p.order_id = o.id
        JOIN restaurants r ON o.restaurant_id = r.id
        WHERE p.id = ? AND p.user_id = ?
      `, [paymentId, userId]);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      res.status(200).json({
        success: true,
        data: payment
      });

    } catch (error) {
      console.error('Get payment details error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching payment details'
      });
    }
  }

  // Refund payment
  async refundPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      // Get payment details
      const payment = await db.get(
        'SELECT * FROM payments WHERE id = ? AND user_id = ?',
        [paymentId, userId]
      );

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      if (payment.payment_status !== PAYMENT_STATUS.COMPLETED) {
        return res.status(400).json({
          success: false,
          message: 'Only completed payments can be refunded'
        });
      }

      // Check if order is eligible for refund (within 24 hours)
      const order = await db.get(
        'SELECT * FROM orders WHERE id = ?',
        [payment.order_id]
      );

      const orderDate = new Date(order.created_at);
      const now = new Date();
      const hoursDiff = (now - orderDate) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        return res.status(400).json({
          success: false,
          message: 'Refund can only be requested within 24 hours of order'
        });
      }

      // Simulate refund processing
      const refundId = generateOrderId('REF');
      const isRefundSuccessful = Math.random() > 0.05; // 95% success rate

      if (isRefundSuccessful) {
        // Update payment status
        await db.run(
          'UPDATE payments SET payment_status = ? WHERE id = ?',
          [PAYMENT_STATUS.REFUNDED, paymentId]
        );

        // Update order status
        await db.run(
          'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
          ['cancelled', PAYMENT_STATUS.REFUNDED, payment.order_id]
        );

        // Create refund record
        await db.run(`
          INSERT INTO payments (
            id, order_id, user_id, amount, payment_method, payment_status,
            transaction_id, payment_date, refund_reason
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          refundId, payment.order_id, userId, -payment.amount,
          payment.payment_method, PAYMENT_STATUS.REFUNDED,
          generateOrderId('TXN'), new Date().toISOString(), reason
        ]);
      }

      res.status(200).json({
        success: true,
        message: isRefundSuccessful ? 'Refund processed successfully' : 'Refund processing failed',
        data: {
          refundId: isRefundSuccessful ? refundId : null,
          status: isRefundSuccessful ? PAYMENT_STATUS.REFUNDED : 'failed',
          amount: payment.amount
        }
      });

    } catch (error) {
      console.error('Refund payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing refund'
      });
    }
  }

  // Get payment methods
  async getPaymentMethods(req, res) {
    try {
      res.status(200).json({
        success: true,
        data: {
          paymentMethods: PAYMENT_METHODS,
          defaultMethod: 'card'
        }
      });

    } catch (error) {
      console.error('Get payment methods error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching payment methods'
      });
    }
  }
}

module.exports = new PaymentController(); 