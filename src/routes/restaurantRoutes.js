const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { validateQuery } = require('../middleware/validation');
const { optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', validateQuery('restaurantSearch'), restaurantController.getRestaurants);
router.get('/:id', restaurantController.getRestaurantDetails);
router.get('/:restaurantId/reviews', restaurantController.getRestaurantReviews);

// Search route
router.get('/search/global', validateQuery('search'), restaurantController.search);

module.exports = router; 