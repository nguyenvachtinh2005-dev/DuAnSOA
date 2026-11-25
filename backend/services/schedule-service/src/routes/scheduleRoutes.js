const express = require('express');
const ScheduleController = require('../controllers/scheduleController');
const { authenticate } = require('../middleware/authMiddleware');
const {
  validateCreateSchedule,
  validateUpdateSchedule,
  validateIdParam,
} = require('../validators/scheduleValidator');

const router = express.Router();

router.use(authenticate);

// Người chăm sóc xem lịch của mình; ADMIN xem tất cả hoặc lọc theo caregiver_id.
router.get('/', ScheduleController.list);
router.get('/:id', validateIdParam('id'), ScheduleController.getById);
router.post('/', validateCreateSchedule, ScheduleController.create);
router.put('/:id', validateIdParam('id'), validateUpdateSchedule, ScheduleController.update);
router.delete('/:id', validateIdParam('id'), ScheduleController.remove);

module.exports = router;