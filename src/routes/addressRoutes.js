const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// All address routes require authentication
router.use(authenticateToken);

// Address operations
router.post('/', validate('address'), addressController.addAddress);
router.get('/', addressController.getAddresses);
router.get('/:id', addressController.getAddressById);
router.put('/:id', validate('address'), addressController.updateAddress);
router.put('/:id/set-default', addressController.setDefaultAddress);
router.delete('/:id', addressController.deleteAddress);

module.exports = router; 