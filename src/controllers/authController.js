const database = require('../config/database');
const { hashPassword, comparePassword, generateToken } = require('../utils/helpers');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, HTTP_STATUS } = require('../utils/constants');
const { asyncHandler } = require('../middleware/errorHandler');

// Register a new user
const register = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await database.get(
        'SELECT id FROM users WHERE email = ?',
        [email]
    );

    if (existingUser) {
        return res.status(HTTP_STATUS.CONFLICT).json({
            success: false,
            message: 'User with this email already exists'
        });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const result = await database.run(
        'INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, phone]
    );

    res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.USER_REGISTERED,
        userId: result.id
    });
});

// Login user
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await database.get(
        'SELECT id, name, email, password_hash, phone FROM users WHERE email = ?',
        [email]
    );

    if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_CREDENTIALS
        });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_CREDENTIALS
        });
    }

    // Generate JWT token
    const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name
    });

    // Remove password from response
    delete user.password_hash;

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.USER_LOGGED_IN,
        token,
        user
    });
});

// Get current user profile
const getProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await database.get(
        'SELECT id, name, email, phone, created_at FROM users WHERE id = ?',
        [userId]
    );

    if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message: ERROR_MESSAGES.USER_NOT_FOUND
        });
    }

    res.status(HTTP_STATUS.OK).json({
        success: true,
        user
    });
});

// Update user profile
const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { name, phone } = req.body;

    // Check if user exists
    const existingUser = await database.get(
        'SELECT id FROM users WHERE id = ?',
        [userId]
    );

    if (!existingUser) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message: ERROR_MESSAGES.USER_NOT_FOUND
        });
    }

    // Update user
    await database.run(
        'UPDATE users SET name = ?, phone = ? WHERE id = ?',
        [name, phone, userId]
    );

    // Get updated user
    const updatedUser = await database.get(
        'SELECT id, name, email, phone, created_at FROM users WHERE id = ?',
        [userId]
    );

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
    });
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await database.get(
        'SELECT password_hash FROM users WHERE id = ?',
        [userId]
    );

    if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message: ERROR_MESSAGES.USER_NOT_FOUND
        });
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Current password is incorrect'
        });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await database.run(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [hashedNewPassword, userId]
    );

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Password changed successfully'
    });
});

// Logout (client-side token removal)
const logout = asyncHandler(async (req, res) => {
    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Logged out successfully'
    });
});

// Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Check if user exists
    const user = await database.get(
        'SELECT id, name, email FROM users WHERE email = ?',
        [email]
    );

    if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message: 'User with this email does not exist'
        });
    }

    // In a real application, you would:
    // 1. Generate a password reset token
    // 2. Store it in the database with expiration
    // 3. Send an email with the reset link
    // For now, we'll just return a success message

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Password reset instructions sent to your email'
    });
});

// Reset password
const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    // In a real application, you would:
    // 1. Validate the reset token
    // 2. Check if it's expired
    // 3. Update the user's password
    // For now, we'll just return a success message

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Password reset successfully'
    });
});

// Delete account
const deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Check if user exists
    const user = await database.get(
        'SELECT id FROM users WHERE id = ?',
        [userId]
    );

    if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message: ERROR_MESSAGES.USER_NOT_FOUND
        });
    }

    // Delete user (in a real application, you might want to soft delete)
    await database.run(
        'DELETE FROM users WHERE id = ?',
        [userId]
    );

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Account deleted successfully'
    });
});

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    logout,
    forgotPassword,
    resetPassword,
    deleteAccount
}; 