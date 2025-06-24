const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/restaurant/:restaurantId', reviewController.getRestaurantReviews);
router.get('/restaurant/:restaurantId/stats', reviewController.getReviewStats);

// Protected routes
router.use(authenticateToken);
router.post('/', reviewController.createReview);
router.get('/user', reviewController.getUserReviews);
router.put('/:reviewId', reviewController.updateReview);
router.delete('/:reviewId', reviewController.deleteReview);

module.exports = router; 