
const express = require('express');

const router = express.Router();

const categoryController = require('../controllers/categoryController');
const careController = require('../controllers/careController');

const {
    authenticateToken,
    authorizeRoles
} = require('../middleware/authMiddleware');

// Middleware x??c ?????nh ng?????i d??ng ???? ????ng nh???p (n???u c??).
// C??c API GET v???n cho ph??p truy c???p c??ng khai.
const optionalAuthentication = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next();
    }

    return authenticateToken(req, res, next);
};

// =============================
// CATEGORY ROUTES
// =============================

// L???y danh s??ch danh m???c
router.get(
    '/categories',
    optionalAuthentication,
    categoryController.getAll
);

// L???y chi ti???t danh m???c
router.get(
    '/categories/:id',
    optionalAuthentication,
    categoryController.getById
);

// Th??m danh m???c - ADMIN
router.post(
    '/categories',
    authenticateToken,
    authorizeRoles('ADMIN'),
    categoryController.create
);

// C???p nh???t danh m???c - ADMIN
router.put(
    '/categories/:id',
    authenticateToken,
    authorizeRoles('ADMIN'),
    categoryController.update
);

// B???t/t???t danh m???c - ADMIN
router.patch(
    '/categories/:id/status',
    authenticateToken,
    authorizeRoles('ADMIN'),
    categoryController.updateStatus
);

// X??a danh m???c - ADMIN
router.delete(
    '/categories/:id',
    authenticateToken,
    authorizeRoles('ADMIN'),
    categoryController.delete
);

// =============================
// CARE SERVICE ROUTES
// =============================

// L???y danh s??ch d???ch v???
router.get(
    '/services',
    optionalAuthentication,
    careController.getAll
);

// L???y d???ch v??? theo ID
router.get(
    '/services/:id',
    optionalAuthentication,
    careController.getById
);

// L???y d???ch v??? theo danh m???c
router.get(
    '/categories/:categoryId/services',
    optionalAuthentication,
    careController.getByCategory
);

// Th??m d???ch v??? - ADMIN
router.post(
    '/services',
    authenticateToken,
    authorizeRoles('ADMIN'),
    careController.create
);

// C???p nh???t d???ch v??? - ADMIN
router.put(
    '/services/:id',
    authenticateToken,
    authorizeRoles('ADMIN'),
    careController.update
);

// B???t/t???t d???ch v??? - ADMIN
router.patch(
    '/services/:id/status',
    authenticateToken,
    authorizeRoles('ADMIN'),
    careController.updateStatus
);

// X??a d???ch v??? - ADMIN
router.delete(
    '/services/:id',
    authenticateToken,
    authorizeRoles('ADMIN'),
    careController.delete
);

module.exports = router;
