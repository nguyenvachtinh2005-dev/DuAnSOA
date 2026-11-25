const express = require('express');
const BookingController = require('../controllers/bookingController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const {
  validateCreateBooking,
  validateIdParam,
} = require('../validators/bookingValidator');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  authorizeRoles('CUSTOMER'),
  validateCreateBooking,
  BookingController.create
);

router.get(
  '/',
  authorizeRoles('CUSTOMER', 'ADMIN'),
  BookingController.list
);

router.get(
  '/:id',
  authorizeRoles('CUSTOMER', 'ADMIN'),
  validateIdParam,
  BookingController.getById
);

router.patch(
  '/:id/cancel',
  authorizeRoles('CUSTOMER', 'ADMIN'),
  validateIdParam,
  BookingController.cancel
);

router.patch(
  '/:id/status',
  authorizeRoles('ADMIN'),
  validateIdParam,
  BookingController.updateStatus
);

module.exports = router;
