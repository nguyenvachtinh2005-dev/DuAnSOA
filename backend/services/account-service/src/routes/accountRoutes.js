const express = require('express');
const router = express.Router();

const accountController = require('../controllers/accountController');

const {
    authenticateToken,
    authorizeRoles
} = require('../middleware/authMiddleware');

// Tất cả API bên dưới đều yêu cầu JWT hợp lệ
router.use(authenticateToken);

// ==================== USER PROFILE ====================

router.get(
    '/profile',
    authorizeRoles('CUSTOMER', 'CAREGIVER', 'ADMIN'),
    accountController.getProfile
);

router.put(
    '/profile',
    authorizeRoles('CUSTOMER', 'CAREGIVER', 'ADMIN'),
    accountController.updateProfile
);

// ==================== CARE RECIPIENTS ====================
// Chỉ CUSTOMER được quản lý người cần chăm sóc

router.get(
    '/recipients',
    authorizeRoles('CUSTOMER'),
    accountController.getRecipients
);

router.get(
    '/recipients/:id',
    authorizeRoles('CUSTOMER'),
    accountController.getRecipientById
);

router.post(
    '/recipients',
    authorizeRoles('CUSTOMER'),
    accountController.createRecipient
);

router.put(
    '/recipients/:id',
    authorizeRoles('CUSTOMER'),
    accountController.updateRecipient
);

router.delete(
    '/recipients/:id',
    authorizeRoles('CUSTOMER'),
    accountController.deleteRecipient
);

// ==================== USER ADDRESSES ====================

router.get(
    '/addresses',
    authorizeRoles('CUSTOMER', 'CAREGIVER'),
    accountController.getAddresses
);

router.post(
    '/addresses',
    authorizeRoles('CUSTOMER', 'CAREGIVER'),
    accountController.createAddress
);

router.put(
    '/addresses/:id',
    authorizeRoles('CUSTOMER', 'CAREGIVER'),
    accountController.updateAddress
);

router.delete(
    '/addresses/:id',
    authorizeRoles('CUSTOMER', 'CAREGIVER'),
    accountController.deleteAddress
);

module.exports = router;