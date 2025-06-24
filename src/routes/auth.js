const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', validate('register'), authController.register);
router.post('/login', validate('login'), authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validate('register'), authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);
router.delete('/account', authenticateToken, authController.deleteAccount);

module.exports = router; 