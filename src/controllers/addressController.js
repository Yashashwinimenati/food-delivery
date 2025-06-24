const database = require('../config/database');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, HTTP_STATUS } = require('../utils/constants');
const { asyncHandler } = require('../middleware/errorHandler');

// Add delivery address
const addAddress = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { type, address_line1, address_line2, city, state, pincode, latitude, longitude } = req.body;

    // If this is the first address, make it default
    const existingAddresses = await database.all(
        'SELECT id FROM addresses WHERE user_id = ?',
        [userId]
    );

    const isDefault = existingAddresses.length === 0;

    // Create address
    const result = await database.run(`
        INSERT INTO addresses (
            user_id, type, address_line1, address_line2, city, state, 
            pincode, latitude, longitude, is_default
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, type, address_line1, address_line2, city, state, pincode, latitude, longitude, isDefault]);

    // Get created address
    const address = await database.get(
        'SELECT * FROM addresses WHERE id = ?',
        [result.id]
    );

    res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.ADDRESS_ADDED,
        address: {
            id: address.id,
            type: address.type,
            address_line1: address.address_line1,
            address_line2: address.address_line2,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            latitude: address.latitude,
            longitude: address.longitude,
            isDefault: address.is_default === 1
        }
    });
});

// Get user's addresses
const getAddresses = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const addresses = await database.all(`
        SELECT 
            id, type, address_line1, address_line2, city, state,
            pincode, latitude, longitude, is_default, created_at
        FROM addresses
        WHERE user_id = ?
        ORDER BY is_default DESC, created_at DESC
    `, [userId]);

    const formattedAddresses = addresses.map(address => ({
        id: address.id,
        type: address.type,
        address_line1: address.address_line1,
        address_line2: address.address_line2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        latitude: address.latitude,
        longitude: address.longitude,
        isDefault: address.is_default === 1,
        createdAt: address.created_at
    }));

    res.status(HTTP_STATUS.OK).json({
        success: true,
        addresses: formattedAddresses
    });
});

// Update address
const updateAddress = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { type, address_line1, address_line2, city, state, pincode, latitude, longitude } = req.body;

    // Check if address exists and belongs to user
    const existingAddress = await database.get(
        'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
        [id, userId]
    );

    if (!existingAddress) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message: 'Address not found'
        });
    }

    // Update address
    await database.run(`
        UPDATE addresses 
        SET type = ?, address_line1 = ?, address_line2 = ?, city = ?, 
            state = ?, pincode = ?, latitude = ?, longitude = ?
        WHERE id = ?
    `, [type, address_line1, address_line2, city, state, pincode, latitude, longitude, id]);

    // Get updated address
    const address = await database.get(
        'SELECT * FROM addresses WHERE id = ?',
        [id]
    );

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.ADDRESS_UPDATED,
        address: {
            id: address.id,
            type: address.type,
            address_line1: address.address_line1,
            address_line2: address.address_line2,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            latitude: address.latitude,
            longitude: address.longitude,
            isDefault: address.is_default === 1
        }
    });
});

// Set default address
const setDefaultAddress = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if address exists and belongs to user
    const address = await database.get(
        'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
        [id, userId]
    );

    if (!address) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message: 'Address not found'
        });
    }

    // Remove default from all addresses
    await database.run(
        'UPDATE addresses SET is_default = 0 WHERE user_id = ?',
        [userId]
    );

    // Set new default address
    await database.run(
        'UPDATE addresses SET is_default = 1 WHERE id = ?',
        [id]
    );

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Default address updated successfully'
    });
});

// Delete address
const deleteAddress = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if address exists and belongs to user
    const address = await database.get(
        'SELECT id, is_default FROM addresses WHERE id = ? AND user_id = ?',
        [id, userId]
    );

    if (!address) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message: 'Address not found'
        });
    }

    // Don't allow deletion of default address if it's the only address
    if (address.is_default) {
        const addressCount = await database.get(
            'SELECT COUNT(*) as count FROM addresses WHERE user_id = ?',
            [userId]
        );

        if (addressCount.count === 1) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Cannot delete the only address. Please add another address first.'
            });
        }
    }

    // Delete address
    await database.run(
        'DELETE FROM addresses WHERE id = ?',
        [id]
    );

    // If deleted address was default, set another address as default
    if (address.is_default) {
        const newDefault = await database.get(
            'SELECT id FROM addresses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
            [userId]
        );

        if (newDefault) {
            await database.run(
                'UPDATE addresses SET is_default = 1 WHERE id = ?',
                [newDefault.id]
            );
        }
    }

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Address deleted successfully'
    });
});

// Get address by ID
const getAddressById = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const address = await database.get(`
        SELECT 
            id, type, address_line1, address_line2, city, state,
            pincode, latitude, longitude, is_default, created_at
        FROM addresses
        WHERE id = ? AND user_id = ?
    `, [id, userId]);

    if (!address) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message: 'Address not found'
        });
    }

    res.status(HTTP_STATUS.OK).json({
        success: true,
        address: {
            id: address.id,
            type: address.type,
            address_line1: address.address_line1,
            address_line2: address.address_line2,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            latitude: address.latitude,
            longitude: address.longitude,
            isDefault: address.is_default === 1,
            createdAt: address.created_at
        }
    });
});

module.exports = {
    addAddress,
    getAddresses,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
    getAddressById
}; 