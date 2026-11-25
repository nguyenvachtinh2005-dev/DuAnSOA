const ScheduleService = require('../services/scheduleService');
const { AppError } = require('../middleware/errorMiddleware');

function validateListFilters(req) {
  const { from, to, schedule_status, caregiver_id } = req.query;

  if (from && !/^\d{4}-\d{2}-\d{2}$/.test(String(from))) {
    throw new AppError('from phải có định dạng YYYY-MM-DD.', 400);
  }
  if (to && !/^\d{4}-\d{2}-\d{2}$/.test(String(to))) {
    throw new AppError('to phải có định dạng YYYY-MM-DD.', 400);
  }
  if (from && to && String(from) > String(to)) {
    throw new AppError('from không được lớn hơn to.', 400);
  }
  if (schedule_status && !['AVAILABLE', 'UNAVAILABLE'].includes(schedule_status)) {
    throw new AppError('schedule_status chỉ nhận AVAILABLE hoặc UNAVAILABLE.', 400);
  }
  if (caregiver_id && (!Number.isInteger(Number(caregiver_id)) || Number(caregiver_id) <= 0)) {
    throw new AppError('caregiver_id phải là số nguyên dương.', 400);
  }
}

async function list(req, res, next) {
  try {
    validateListFilters(req);
    const schedules = await ScheduleService.listSchedules(req.user, req.query);
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách lịch làm việc thành công.',
      data: schedules,
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const schedule = await ScheduleService.getScheduleById(Number(req.params.id));
    if (!schedule) throw new AppError('Không tìm thấy lịch làm việc.', 404);

    await ScheduleService.assertCanAccessSchedule(req.user, schedule);

    res.status(200).json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const schedule = await ScheduleService.createSchedule(req.user, req.body);
    res.status(201).json({
      success: true,
      message: 'Tạo lịch làm việc thành công.',
      data: schedule,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const schedule = await ScheduleService.updateSchedule(
      req.user,
      Number(req.params.id),
      req.body
    );
    res.status(200).json({
      success: true,
      message: 'Cập nhật lịch làm việc thành công.',
      data: schedule,
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await ScheduleService.deleteSchedule(req.user, Number(req.params.id));
    res.status(200).json({
      success: true,
      message: 'Xóa lịch làm việc thành công.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };