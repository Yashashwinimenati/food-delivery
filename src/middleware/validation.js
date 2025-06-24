const Joi = require('joi');
const { HTTP_STATUS, VALIDATION_RULES } = require('../utils/constants');

// Validation schemas
const schemas = {
    // User registration
    register: Joi.object({
        name: Joi.string().min(2).max(100).required()
            .messages({
                'string.min': 'Name must be at least 2 characters long',
                'string.max': 'Name cannot exceed 100 characters',
                'any.required': 'Name is required'
            }),
        email: Joi.string().email().required()
            .messages({
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is required'
            }),
        password: Joi.string().min(VALIDATION_RULES.PASSWORD_MIN_LENGTH).required()
            .messages({
                'string.min': `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`,
                'any.required': 'Password is required'
            }),
        phone: Joi.string().pattern(VALIDATION_RULES.PHONE_REGEX).required()
            .messages({
                'string.pattern.base': 'Please provide a valid phone number',
                'any.required': 'Phone number is required'
            })
    }),

    // User login
    login: Joi.object({
        email: Joi.string().email().required()
            .messages({
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is required'
            }),
        password: Joi.string().required()
            .messages({
                'any.required': 'Password is required'
            })
    }),

    // Address creation/update
    address: Joi.object({
        type: Joi.string().valid('home', 'work', 'other').default('home')
            .messages({
                'any.only': 'Address type must be home, work, or other'
            }),
        address_line1: Joi.string().min(5).max(255).required()
            .messages({
                'string.min': 'Address line 1 must be at least 5 characters long',
                'string.max': 'Address line 1 cannot exceed 255 characters',
                'any.required': 'Address line 1 is required'
            }),
        address_line2: Joi.string().max(255).optional()
            .messages({
                'string.max': 'Address line 2 cannot exceed 255 characters'
            }),
        city: Joi.string().min(2).max(100).required()
            .messages({
                'string.min': 'City must be at least 2 characters long',
                'string.max': 'City cannot exceed 100 characters',
                'any.required': 'City is required'
            }),
        state: Joi.string().min(2).max(100).required()
            .messages({
                'string.min': 'State must be at least 2 characters long',
                'string.max': 'State cannot exceed 100 characters',
                'any.required': 'State is required'
            }),
        pincode: Joi.string().pattern(VALIDATION_RULES.PINCODE_REGEX).required()
            .messages({
                'string.pattern.base': 'Please provide a valid 6-digit pincode',
                'any.required': 'Pincode is required'
            }),
        latitude: Joi.number().min(-90).max(90).required()
            .messages({
                'number.min': 'Latitude must be between -90 and 90',
                'number.max': 'Latitude must be between -90 and 90',
                'any.required': 'Latitude is required'
            }),
        longitude: Joi.number().min(-180).max(180).required()
            .messages({
                'number.min': 'Longitude must be between -180 and 180',
                'number.max': 'Longitude must be between -180 and 180',
                'any.required': 'Longitude is required'
            })
    }),

    // Restaurant search
    restaurantSearch: Joi.object({
        lat: Joi.number().min(-90).max(90).required()
            .messages({
                'number.min': 'Latitude must be between -90 and 90',
                'number.max': 'Latitude must be between -90 and 90',
                'any.required': 'Latitude is required'
            }),
        lng: Joi.number().min(-180).max(180).required()
            .messages({
                'number.min': 'Longitude must be between -180 and 180',
                'number.max': 'Longitude must be between -180 and 180',
                'any.required': 'Longitude is required'
            }),
        radius: Joi.number().min(1).max(50).default(5)
            .messages({
                'number.min': 'Search radius must be at least 1 km',
                'number.max': 'Search radius cannot exceed 50 km'
            }),
        cuisine: Joi.string().optional(),
        search: Joi.string().min(2).max(100).optional()
            .messages({
                'string.min': 'Search term must be at least 2 characters long',
                'string.max': 'Search term cannot exceed 100 characters'
            }),
        veg_only: Joi.boolean().optional(),
        rating: Joi.number().min(1).max(5).optional()
            .messages({
                'number.min': 'Rating must be at least 1',
                'number.max': 'Rating cannot exceed 5'
            }),
        page: Joi.number().integer().min(1).default(1)
            .messages({
                'number.integer': 'Page must be an integer',
                'number.min': 'Page must be at least 1'
            }),
        limit: Joi.number().integer().min(1).max(50).default(20)
            .messages({
                'number.integer': 'Limit must be an integer',
                'number.min': 'Limit must be at least 1',
                'number.max': 'Limit cannot exceed 50'
            })
    }),

    // Cart operations
    addToCart: Joi.object({
        restaurantId: Joi.number().integer().positive().required()
            .messages({
                'number.integer': 'Restaurant ID must be an integer',
                'number.positive': 'Restaurant ID must be positive',
                'any.required': 'Restaurant ID is required'
            }),
        itemId: Joi.number().integer().positive().required()
            .messages({
                'number.integer': 'Item ID must be an integer',
                'number.positive': 'Item ID must be positive',
                'any.required': 'Item ID is required'
            }),
        quantity: Joi.number().integer().min(1).max(10).default(1)
            .messages({
                'number.integer': 'Quantity must be an integer',
                'number.min': 'Quantity must be at least 1',
                'number.max': 'Quantity cannot exceed 10'
            }),
        specialInstructions: Joi.string().max(500).optional()
            .messages({
                'string.max': 'Special instructions cannot exceed 500 characters'
            })
    }),

    updateCartItem: Joi.object({
        quantity: Joi.number().integer().min(1).max(10).required()
            .messages({
                'number.integer': 'Quantity must be an integer',
                'number.min': 'Quantity must be at least 1',
                'number.max': 'Quantity cannot exceed 10',
                'any.required': 'Quantity is required'
            }),
        specialInstructions: Joi.string().max(500).optional()
            .messages({
                'string.max': 'Special instructions cannot exceed 500 characters'
            })
    }),

    // Order creation
    createOrder: Joi.object({
        addressId: Joi.number().integer().positive().required()
            .messages({
                'number.integer': 'Address ID must be an integer',
                'number.positive': 'Address ID must be positive',
                'any.required': 'Address ID is required'
            }),
        paymentMethod: Joi.string().valid('cash', 'card', 'upi', 'wallet').required()
            .messages({
                'any.only': 'Payment method must be cash, card, upi, or wallet',
                'any.required': 'Payment method is required'
            }),
        specialInstructions: Joi.string().max(500).optional()
            .messages({
                'string.max': 'Special instructions cannot exceed 500 characters'
            })
    }),

    // Payment processing
    processPayment: Joi.object({
        orderId: Joi.string().required()
            .messages({
                'any.required': 'Order ID is required'
            }),
        paymentMethod: Joi.string().valid('cash', 'card', 'upi', 'wallet').required()
            .messages({
                'any.only': 'Payment method must be cash, card, upi, or wallet',
                'any.required': 'Payment method is required'
            }),
        paymentDetails: Joi.object({
            cardNumber: Joi.string().pattern(/^\d{16}$/).optional()
                .messages({
                    'string.pattern.base': 'Card number must be 16 digits'
                }),
            expiryMonth: Joi.string().pattern(/^(0[1-9]|1[0-2])$/).optional()
                .messages({
                    'string.pattern.base': 'Expiry month must be 01-12'
                }),
            expiryYear: Joi.string().pattern(/^\d{4}$/).optional()
                .messages({
                    'string.pattern.base': 'Expiry year must be 4 digits'
                }),
            cvv: Joi.string().pattern(/^\d{3,4}$/).optional()
                .messages({
                    'string.pattern.base': 'CVV must be 3 or 4 digits'
                }),
            upiId: Joi.string().email().optional()
                .messages({
                    'string.email': 'UPI ID must be a valid email format'
                })
        }).optional()
    }),

    // Review submission
    review: Joi.object({
        orderId: Joi.string().required()
            .messages({
                'any.required': 'Order ID is required'
            }),
        restaurantRating: Joi.number().integer().min(1).max(5).required()
            .messages({
                'number.integer': 'Restaurant rating must be an integer',
                'number.min': 'Restaurant rating must be at least 1',
                'number.max': 'Restaurant rating cannot exceed 5',
                'any.required': 'Restaurant rating is required'
            }),
        foodRating: Joi.number().integer().min(1).max(5).required()
            .messages({
                'number.integer': 'Food rating must be an integer',
                'number.min': 'Food rating must be at least 1',
                'number.max': 'Food rating cannot exceed 5',
                'any.required': 'Food rating is required'
            }),
        deliveryRating: Joi.number().integer().min(1).max(5).required()
            .messages({
                'number.integer': 'Delivery rating must be an integer',
                'number.min': 'Delivery rating must be at least 1',
                'number.max': 'Delivery rating cannot exceed 5',
                'any.required': 'Delivery rating is required'
            }),
        comment: Joi.string().max(1000).optional()
            .messages({
                'string.max': 'Comment cannot exceed 1000 characters'
            })
    }),

    // Search
    search: Joi.object({
        query: Joi.string().min(2).max(100).required()
            .messages({
                'string.min': 'Search query must be at least 2 characters long',
                'string.max': 'Search query cannot exceed 100 characters',
                'any.required': 'Search query is required'
            }),
        lat: Joi.number().min(-90).max(90).optional()
            .messages({
                'number.min': 'Latitude must be between -90 and 90',
                'number.max': 'Latitude must be between -90 and 90'
            }),
        lng: Joi.number().min(-180).max(180).optional()
            .messages({
                'number.min': 'Longitude must be between -180 and 180',
                'number.max': 'Longitude must be between -180 and 180'
            }),
        page: Joi.number().integer().min(1).default(1)
            .messages({
                'number.integer': 'Page must be an integer',
                'number.min': 'Page must be at least 1'
            }),
        limit: Joi.number().integer().min(1).max(50).default(20)
            .messages({
                'number.integer': 'Limit must be an integer',
                'number.min': 'Limit must be at least 1',
                'number.max': 'Limit cannot exceed 50'
            })
    })
};

// Validation middleware factory
const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Validation schema not found'
            });
        }

        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Validation failed',
                errors: errorDetails
            });
        }

        // Replace request body with validated data
        req.body = value;
        next();
    };
};

// Query validation middleware factory
const validateQuery = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Validation schema not found'
            });
        }

        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Query validation failed',
                errors: errorDetails
            });
        }

        // Replace request query with validated data
        req.query = value;
        next();
    };
};

module.exports = {
    validate,
    validateQuery,
    schemas
}; 