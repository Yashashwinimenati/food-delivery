const { HTTP_STATUS } = require('../utils/constants');

// Custom error class
class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        
        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params,
        user: req.user ? req.user.id : 'anonymous'
    });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new AppError(message, HTTP_STATUS.NOT_FOUND);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `Duplicate field value: ${field}. Please use another value.`;
        error = new AppError(message, HTTP_STATUS.CONFLICT);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new AppError(message, HTTP_STATUS.BAD_REQUEST);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new AppError(message, HTTP_STATUS.UNAUTHORIZED);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new AppError(message, HTTP_STATUS.UNAUTHORIZED);
    }

    // SQLite errors
    if (err.code === 'SQLITE_CONSTRAINT') {
        if (err.message.includes('UNIQUE constraint failed')) {
            const message = 'Duplicate entry. This record already exists.';
            error = new AppError(message, HTTP_STATUS.CONFLICT);
        } else if (err.message.includes('FOREIGN KEY constraint failed')) {
            const message = 'Referenced record does not exist.';
            error = new AppError(message, HTTP_STATUS.BAD_REQUEST);
        } else {
            const message = 'Database constraint violation.';
            error = new AppError(message, HTTP_STATUS.BAD_REQUEST);
        }
    }

    if (err.code === 'SQLITE_ERROR') {
        const message = 'Database operation failed.';
        error = new AppError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    // Rate limiting errors
    if (err.status === 429) {
        const message = 'Too many requests. Please try again later.';
        error = new AppError(message, HTTP_STATUS.TOO_MANY_REQUESTS || 429);
    }

    // Default error response
    const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Internal Server Error';

    // Development error response
    if (process.env.NODE_ENV === 'development') {
        return res.status(statusCode).json({
            success: false,
            message,
            error: err,
            stack: err.stack
        });
    }

    // Production error response
    res.status(statusCode).json({
        success: false,
        message: statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR 
            ? 'Internal Server Error' 
            : message
    });
};

// 404 handler for undefined routes
const notFound = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, HTTP_STATUS.NOT_FOUND);
    next(error);
};

// Async error wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Validation error handler
const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map(val => val.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

// Cast error handler
const handleCastError = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

// Duplicate key error handler
const handleDuplicateKeyError = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, HTTP_STATUS.CONFLICT);
};

// JWT error handler
const handleJWTError = () => {
    return new AppError('Invalid token. Please log in again!', HTTP_STATUS.UNAUTHORIZED);
};

// JWT expired error handler
const handleJWTExpiredError = () => {
    return new AppError('Your token has expired! Please log in again.', HTTP_STATUS.UNAUTHORIZED);
};

// Send error in development
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        success: false,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

// Send error in production
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    } else {
        // Programming or other unknown error: don't leak error details
        console.error('ERROR 💥', err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Something went wrong!'
        });
    }
};

module.exports = {
    AppError,
    errorHandler,
    notFound,
    asyncHandler,
    handleValidationError,
    handleCastError,
    handleDuplicateKeyError,
    handleJWTError,
    handleJWTExpiredError,
    sendErrorDev,
    sendErrorProd
}; 