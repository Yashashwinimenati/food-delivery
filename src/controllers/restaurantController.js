const database = require('../config/database');
const { calculateDistance, isRestaurantOpen, safeJsonParse, generatePagination } = require('../utils/helpers');
const { ERROR_MESSAGES, HTTP_STATUS } = require('../utils/constants');
const { asyncHandler } = require('../middleware/errorHandler');

// Get restaurants near user location
const getRestaurants = asyncHandler(async (req, res) => {
    const { lat, lng, radius = 5, cuisine, search, veg_only, rating, page = 1, limit = 20 } = req.query;

    // Build base query
    let query = `
        SELECT 
            r.id,
            r.name,
            r.description,
            r.cuisine_types,
            r.address_line1,
            r.city,
            r.rating,
            r.total_reviews,
            r.min_order_amount,
            r.delivery_fee,
            r.avg_preparation_time,
            r.is_open,
            r.is_veg_only,
            r.image_url,
            r.opening_time,
            r.closing_time
        FROM restaurants r
        WHERE r.is_open = 1
    `;

    const queryParams = [];

    // Add filters
    if (cuisine) {
        query += ` AND r.cuisine_types LIKE ?`;
        queryParams.push(`%${cuisine}%`);
    }

    if (search) {
        query += ` AND (r.name LIKE ? OR r.description LIKE ?)`;
        queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (veg_only === 'true') {
        query += ` AND r.is_veg_only = 1`;
    }

    if (rating) {
        query += ` AND r.rating >= ?`;
        queryParams.push(rating);
    }

    // Get restaurants
    const restaurants = await database.all(query, queryParams);

    // Calculate distances and filter by radius
    const restaurantsWithDistance = restaurants
        .map(restaurant => {
            const distance = calculateDistance(lat, lng, restaurant.latitude, restaurant.longitude);
            return {
                ...restaurant,
                distance: distance.toFixed(1),
                cuisine: safeJsonParse(restaurant.cuisine_types, []),
                isOpen: isRestaurantOpen(restaurant.opening_time, restaurant.closing_time),
                avgDeliveryTime: `${restaurant.avg_preparation_time + Math.ceil(distance * 3)}-${restaurant.avg_preparation_time + Math.ceil(distance * 3) + 5} mins`
            };
        })
        .filter(restaurant => parseFloat(restaurant.distance) <= radius)
        .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

    // Apply pagination
    const pagination = generatePagination(page, limit, restaurantsWithDistance.length);
    const paginatedRestaurants = restaurantsWithDistance.slice(
        pagination.offset,
        pagination.offset + pagination.limit
    );

    // Format response
    const formattedRestaurants = paginatedRestaurants.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        rating: restaurant.rating,
        avgDeliveryTime: restaurant.avgDeliveryTime,
        minOrder: restaurant.min_order_amount,
        deliveryFee: restaurant.delivery_fee,
        image: restaurant.image_url,
        isOpen: restaurant.isOpen,
        distance: `${restaurant.distance} km`
    }));

    res.status(HTTP_STATUS.OK).json({
        success: true,
        count: paginatedRestaurants.length,
        total: restaurantsWithDistance.length,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            totalPages: pagination.totalPages,
            hasNext: pagination.hasNext,
            hasPrev: pagination.hasPrev
        },
        restaurants: formattedRestaurants
    });
});

// Get restaurant details with menu
const getRestaurantDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Get restaurant details
    const restaurant = await database.get(`
        SELECT 
            r.*,
            COUNT(DISTINCT rv.id) as total_reviews_count
        FROM restaurants r
        LEFT JOIN reviews rv ON r.id = rv.restaurant_id
        WHERE r.id = ?
        GROUP BY r.id
    `, [id]);

    if (!restaurant) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message: ERROR_MESSAGES.RESTAURANT_NOT_FOUND
        });
    }

    // Get menu categories
    const categories = await database.all(`
        SELECT id, name, description, display_order
        FROM menu_categories
        WHERE restaurant_id = ? AND is_active = 1
        ORDER BY display_order, name
    `, [id]);

    // Get menu items for each category
    const menu = [];
    for (const category of categories) {
        const items = await database.all(`
            SELECT 
                id, name, description, price, is_veg, is_available,
                image_url, preparation_time, calories, allergens
            FROM menu_items
            WHERE restaurant_id = ? AND category_id = ?
            ORDER BY name
        `, [id, category.id]);

        // Format items
        const formattedItems = items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            isVeg: item.is_veg === 1,
            isAvailable: item.is_available === 1,
            image: item.image_url,
            preparationTime: item.preparation_time,
            calories: item.calories,
            allergens: safeJsonParse(item.allergens, [])
        }));

        menu.push({
            category: category.name,
            description: category.description,
            items: formattedItems
        });
    }

    // Format restaurant data
    const formattedRestaurant = {
        id: restaurant.id,
        name: restaurant.name,
        cuisine: safeJsonParse(restaurant.cuisine_types, []),
        rating: restaurant.rating,
        totalReviews: restaurant.total_reviews_count,
        description: restaurant.description,
        address: `${restaurant.address_line1}, ${restaurant.city}`,
        operatingHours: {
            opening: restaurant.opening_time,
            closing: restaurant.closing_time
        },
        minOrder: restaurant.min_order_amount,
        deliveryFee: restaurant.delivery_fee,
        avgPreparationTime: restaurant.avg_preparation_time,
        isOpen: isRestaurantOpen(restaurant.opening_time, restaurant.closing_time),
        isVegOnly: restaurant.is_veg_only === 1,
        image: restaurant.image_url,
        phone: restaurant.phone,
        email: restaurant.email
    };

    res.status(HTTP_STATUS.OK).json({
        success: true,
        restaurant: formattedRestaurant,
        menu
    });
});

// Search restaurants and dishes
const search = asyncHandler(async (req, res) => {
    const { query, lat, lng, page = 1, limit = 20 } = req.query;

    // Search restaurants
    const restaurants = await database.all(`
        SELECT 
            id, name, cuisine_types, rating, delivery_fee, 
            min_order_amount, image_url, latitude, longitude
        FROM restaurants
        WHERE (name LIKE ? OR description LIKE ? OR cuisine_types LIKE ?)
        AND is_open = 1
        ORDER BY rating DESC
        LIMIT ?
    `, [`%${query}%`, `%${query}%`, `%${query}%`, limit]);

    // Search dishes
    const dishes = await database.all(`
        SELECT 
            mi.id as itemId,
            mi.name,
            mi.price,
            mi.is_veg,
            mi.image_url,
            r.id as restaurantId,
            r.name as restaurantName,
            r.rating as restaurantRating
        FROM menu_items mi
        JOIN restaurants r ON mi.restaurant_id = r.id
        WHERE mi.name LIKE ? AND mi.is_available = 1 AND r.is_open = 1
        ORDER BY r.rating DESC
        LIMIT ?
    `, [`%${query}%`, limit]);

    // Calculate distances for restaurants
    const restaurantsWithDistance = restaurants.map(restaurant => {
        const distance = lat && lng ? calculateDistance(lat, lng, restaurant.latitude, restaurant.longitude) : null;
        return {
            id: restaurant.id,
            name: restaurant.name,
            cuisine: safeJsonParse(restaurant.cuisine_types, []),
            rating: restaurant.rating,
            deliveryFee: restaurant.delivery_fee,
            minOrder: restaurant.min_order_amount,
            image: restaurant.image_url,
            distance: distance ? `${distance.toFixed(1)} km` : null
        };
    });

    // Format dishes
    const formattedDishes = dishes.map(dish => ({
        itemId: dish.itemId,
        name: dish.name,
        restaurantName: dish.restaurantName,
        price: dish.price,
        rating: dish.restaurantRating,
        isVeg: dish.is_veg === 1,
        image: dish.image_url
    }));

    res.status(HTTP_STATUS.OK).json({
        success: true,
        query,
        restaurants: restaurantsWithDistance,
        dishes: formattedDishes,
        total: {
            restaurants: restaurants.length,
            dishes: dishes.length
        }
    });
});

// Get restaurant reviews
const getRestaurantReviews = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if restaurant exists
    const restaurant = await database.get(
        'SELECT id, name FROM restaurants WHERE id = ?',
        [restaurantId]
    );

    if (!restaurant) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message: ERROR_MESSAGES.RESTAURANT_NOT_FOUND
        });
    }

    // Get reviews with pagination
    const offset = (page - 1) * limit;
    const reviews = await database.all(`
        SELECT 
            r.id,
            r.restaurant_rating,
            r.food_rating,
            r.delivery_rating,
            r.overall_rating,
            r.comment,
            r.created_at,
            u.name as userName
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.restaurant_id = ?
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
    `, [restaurantId, limit, offset]);

    // Get total count
    const totalResult = await database.get(
        'SELECT COUNT(*) as total FROM reviews WHERE restaurant_id = ?',
        [restaurantId]
    );

    const total = totalResult.total;
    const totalPages = Math.ceil(total / limit);

    // Format reviews
    const formattedReviews = reviews.map(review => ({
        id: review.id,
        restaurantRating: review.restaurant_rating,
        foodRating: review.food_rating,
        deliveryRating: review.delivery_rating,
        overallRating: review.overall_rating,
        comment: review.comment,
        userName: review.userName,
        createdAt: review.created_at
    }));

    res.status(HTTP_STATUS.OK).json({
        success: true,
        restaurant: {
            id: restaurant.id,
            name: restaurant.name
        },
        reviews: formattedReviews,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    });
});

module.exports = {
    getRestaurants,
    getRestaurantDetails,
    search,
    getRestaurantReviews
}; 