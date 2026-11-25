const express = require('express');
const router = express.Router();

const assignmentController = require('../controllers/assignmentController');
const {
    authenticateToken,
    authorizeRoles
} = require('../middleware/authMiddleware');
const {
    validateCreateAssignment,
    validateAssignmentResponse
} = require('../validators/assignmentValidator');

router.use(authenticateToken);

router.get(
    '/',
    authorizeRoles('ADMIN', 'CAREGIVER'),
    assignmentController.getAssignments
);

router.post(
    '/',
    authorizeRoles('ADMIN'),
    validateCreateAssignment,
    assignmentController.createAssignment
);

router.get(
    '/:id',
    authorizeRoles('ADMIN', 'CAREGIVER'),
    assignmentController.getAssignmentById
);

router.patch(
    '/:id/accept',
    authorizeRoles('CAREGIVER'),
    validateAssignmentResponse,
    assignmentController.acceptAssignment
);

router.patch(
    '/:id/reject',
    authorizeRoles('CAREGIVER'),
    validateAssignmentResponse,
    assignmentController.rejectAssignment
);

router.patch(
    '/:id/cancel',
    authorizeRoles('ADMIN'),
    validateAssignmentResponse,
    assignmentController.cancelAssignment
);

module.exports = router;
