const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');

// Public routes
router.get('/search', restaurantController.search);
router.get('/:restaurantId', restaurantController.getRestaurantDetails);
router.get('/:restaurantId/reviews', restaurantController.getRestaurantReviews);

module.exports = router; 