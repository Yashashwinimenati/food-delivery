const db = require('../config/database');
const { generateOrderId } = require('../utils/helpers');

class ReviewController {
  // Create a review for a restaurant
  async createReview(req, res) {
    try {
      const { restaurantId, orderId, rating, comment, foodRating, deliveryRating } = req.body;
      const userId = req.user.id;

      // Validate input
      if (!restaurantId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant ID and valid rating (1-5) are required'
        });
      }

      // Check if user has ordered from this restaurant
      const order = await db.get(
        'SELECT * FROM orders WHERE id = ? AND user_id = ? AND restaurant_id = ? AND status = ?',
        [orderId, userId, restaurantId, 'delivered']
      );

      if (!order) {
        return res.status(400).json({
          success: false,
          message: 'You can only review restaurants you have ordered from and received delivery'
        });
      }

      // Check if user has already reviewed this order
      const existingReview = await db.get(
        'SELECT * FROM reviews WHERE user_id = ? AND order_id = ?',
        [userId, orderId]
      );

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this order'
        });
      }

      // Create review
      const reviewId = generateOrderId('REV');
      const reviewData = {
        id: reviewId,
        user_id: userId,
        restaurant_id: restaurantId,
        order_id: orderId,
        rating: rating,
        comment: comment || null,
        food_rating: foodRating || rating,
        delivery_rating: deliveryRating || rating,
        created_at: new Date().toISOString()
      };

      await db.run(`
        INSERT INTO reviews (
          id, user_id, restaurant_id, order_id, rating, comment,
          food_rating, delivery_rating, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        reviewData.id, reviewData.user_id, reviewData.restaurant_id,
        reviewData.order_id, reviewData.rating, reviewData.comment,
        reviewData.food_rating, reviewData.delivery_rating, reviewData.created_at
      ]);

      // Update restaurant average rating
      await this.updateRestaurantRating(restaurantId);

      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: reviewData
      });

    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating review'
      });
    }
  }

  // Get reviews for a restaurant
  async getRestaurantReviews(req, res) {
    try {
      const { restaurantId } = req.params;
      const { page = 1, limit = 10, sort = 'newest' } = req.query;
      const offset = (page - 1) * limit;

      let orderBy = 'r.created_at DESC';
      if (sort === 'oldest') {
        orderBy = 'r.created_at ASC';
      } else if (sort === 'rating_high') {
        orderBy = 'r.rating DESC';
      } else if (sort === 'rating_low') {
        orderBy = 'r.rating ASC';
      }

      const reviews = await db.all(`
        SELECT r.*, u.name as user_name, u.email as user_email
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.restaurant_id = ?
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `, [restaurantId, limit, offset]);

      const totalCount = await db.get(
        'SELECT COUNT(*) as count FROM reviews WHERE restaurant_id = ?',
        [restaurantId]
      );

      // Get restaurant average rating
      const avgRating = await db.get(`
        SELECT 
          AVG(rating) as avg_rating,
          AVG(food_rating) as avg_food_rating,
          AVG(delivery_rating) as avg_delivery_rating,
          COUNT(*) as total_reviews
        FROM reviews 
        WHERE restaurant_id = ?
      `, [restaurantId]);

      res.status(200).json({
        success: true,
        data: {
          reviews,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount.count,
            totalPages: Math.ceil(totalCount.count / limit)
          },
          summary: {
            averageRating: avgRating.avg_rating || 0,
            averageFoodRating: avgRating.avg_food_rating || 0,
            averageDeliveryRating: avgRating.avg_delivery_rating || 0,
            totalReviews: avgRating.total_reviews || 0
          }
        }
      });

    } catch (error) {
      console.error('Get restaurant reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching reviews'
      });
    }
  }

  // Get user's reviews
  async getUserReviews(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const reviews = await db.all(`
        SELECT r.*, rest.name as restaurant_name, o.order_number
        FROM reviews r
        JOIN restaurants rest ON r.restaurant_id = rest.id
        JOIN orders o ON r.order_id = o.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `, [userId, limit, offset]);

      const totalCount = await db.get(
        'SELECT COUNT(*) as count FROM reviews WHERE user_id = ?',
        [userId]
      );

      res.status(200).json({
        success: true,
        data: {
          reviews,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount.count,
            totalPages: Math.ceil(totalCount.count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get user reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user reviews'
      });
    }
  }

  // Update a review
  async updateReview(req, res) {
    try {
      const { reviewId } = req.params;
      const { rating, comment, foodRating, deliveryRating } = req.body;
      const userId = req.user.id;

      // Validate input
      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      // Get review
      const review = await db.get(
        'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
        [reviewId, userId]
      );

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      // Check if review is within editable time (24 hours)
      const reviewDate = new Date(review.created_at);
      const now = new Date();
      const hoursDiff = (now - reviewDate) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        return res.status(400).json({
          success: false,
          message: 'Reviews can only be edited within 24 hours of creation'
        });
      }

      // Update review
      const updateFields = [];
      const updateValues = [];

      if (rating !== undefined) {
        updateFields.push('rating = ?');
        updateValues.push(rating);
      }

      if (comment !== undefined) {
        updateFields.push('comment = ?');
        updateValues.push(comment);
      }

      if (foodRating !== undefined) {
        updateFields.push('food_rating = ?');
        updateValues.push(foodRating);
      }

      if (deliveryRating !== undefined) {
        updateFields.push('delivery_rating = ?');
        updateValues.push(deliveryRating);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      updateValues.push(reviewId, userId);

      await db.run(
        `UPDATE reviews SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
        updateValues
      );

      // Update restaurant average rating
      await this.updateRestaurantRating(review.restaurant_id);

      res.status(200).json({
        success: true,
        message: 'Review updated successfully'
      });

    } catch (error) {
      console.error('Update review error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating review'
      });
    }
  }

  // Delete a review
  async deleteReview(req, res) {
    try {
      const { reviewId } = req.params;
      const userId = req.user.id;

      // Get review
      const review = await db.get(
        'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
        [reviewId, userId]
      );

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      // Check if review is within deletable time (24 hours)
      const reviewDate = new Date(review.created_at);
      const now = new Date();
      const hoursDiff = (now - reviewDate) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        return res.status(400).json({
          success: false,
          message: 'Reviews can only be deleted within 24 hours of creation'
        });
      }

      // Delete review
      await db.run(
        'DELETE FROM reviews WHERE id = ? AND user_id = ?',
        [reviewId, userId]
      );

      // Update restaurant average rating
      await this.updateRestaurantRating(review.restaurant_id);

      res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
      });

    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting review'
      });
    }
  }

  // Helper method to update restaurant average rating
  async updateRestaurantRating(restaurantId) {
    try {
      const avgRating = await db.get(`
        SELECT 
          AVG(rating) as avg_rating,
          COUNT(*) as total_reviews
        FROM reviews 
        WHERE restaurant_id = ?
      `, [restaurantId]);

      await db.run(
        'UPDATE restaurants SET avg_rating = ?, total_reviews = ? WHERE id = ?',
        [avgRating.avg_rating || 0, avgRating.total_reviews || 0, restaurantId]
      );
    } catch (error) {
      console.error('Update restaurant rating error:', error);
    }
  }

  // Get review statistics for a restaurant
  async getReviewStats(req, res) {
    try {
      const { restaurantId } = req.params;

      const stats = await db.get(`
        SELECT 
          AVG(rating) as avg_rating,
          AVG(food_rating) as avg_food_rating,
          AVG(delivery_rating) as avg_delivery_rating,
          COUNT(*) as total_reviews,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
          COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
          COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
          COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
          COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
        FROM reviews 
        WHERE restaurant_id = ?
      `, [restaurantId]);

      const ratingDistribution = {
        5: stats.five_star || 0,
        4: stats.four_star || 0,
        3: stats.three_star || 0,
        2: stats.two_star || 0,
        1: stats.one_star || 0
      };

      res.status(200).json({
        success: true,
        data: {
          averageRating: stats.avg_rating || 0,
          averageFoodRating: stats.avg_food_rating || 0,
          averageDeliveryRating: stats.avg_delivery_rating || 0,
          totalReviews: stats.total_reviews || 0,
          ratingDistribution
        }
      });

    } catch (error) {
      console.error('Get review stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching review statistics'
      });
    }
  }
}

module.exports = new ReviewController(); 