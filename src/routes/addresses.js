const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// All address routes require authentication
router.use(authenticateToken);

router.get('/', addressController.getAddresses);
router.post('/', validate('address'), addressController.addAddress);
router.get('/:addressId', addressController.getAddressById);
router.put('/:addressId', validate('address'), addressController.updateAddress);
router.delete('/:addressId', addressController.deleteAddress);
router.put('/:addressId/set-default', addressController.setDefaultAddress);

module.exports = router; 