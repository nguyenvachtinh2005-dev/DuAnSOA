
const { AppError } = require('../middleware/errorMiddleware');

// Kiểm tra ngày theo định dạng YYYY-MM-DD
function isValidDate(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const date = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const [year, month, day] = date.split('-').map(Number);

  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return false;
  }

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return day <= daysInMonth;
}

// Kiểm tra giờ HH:mm hoặc HH:mm:ss
function isValidTime(value) {
  return typeof value === 'string' &&
    /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value.trim());
}

// Chuyển giờ thành giây để so sánh
function timeToSeconds(value) {
  const parts = value.split(':').map(Number);

  return parts[0] * 3600 + parts[1] * 60 + (parts[2] || 0);
}

// Kiểm tra dữ liệu tạo lịch
function validateCreateSchedule(req, res, next) {
  const { work_date, start_time, end_time, schedule_status, note } = req.body || {};

  // DEBUG dữ liệu nhận từ Postman
  console.log('===== DEBUG WORK DATE =====');
  console.log('work_date:', work_date);
  console.log('typeof:', typeof work_date);
  console.log('Request body:', JSON.stringify(req.body));

  if (!work_date || !isValidDate(String(work_date))) {
    return next(new AppError(
      'work_date phải có định dạng YYYY-MM-DD và là ngày hợp lệ.',
      400
    ));
  }

  if (!start_time || !isValidTime(String(start_time))) {
    return next(new AppError(
      'start_time phải có định dạng HH:mm hoặc HH:mm:ss.',
      400
    ));
  }

  if (!end_time || !isValidTime(String(end_time))) {
    return next(new AppError(
      'end_time phải có định dạng HH:mm hoặc HH:mm:ss.',
      400
    ));
  }

  if (
    timeToSeconds(String(end_time)) <=
    timeToSeconds(String(start_time))
  ) {
    return next(new AppError(
      'end_time phải lớn hơn start_time trong cùng ngày.',
      400
    ));
  }

  if (
    schedule_status !== undefined &&
    !['AVAILABLE', 'UNAVAILABLE'].includes(schedule_status)
  ) {
    return next(new AppError(
      'schedule_status chỉ nhận AVAILABLE hoặc UNAVAILABLE.',
      400
    ));
  }

  if (note !== undefined && note !== null && typeof note !== 'string') {
    return next(new AppError('note phải là chuỗi ký tự.', 400));
  }

  next();
}

// Kiểm tra dữ liệu cập nhật lịch
function validateUpdateSchedule(req, res, next) {
  const allowed = [
    'work_date',
    'start_time',
    'end_time',
    'schedule_status',
    'note'
  ];

  const keys = Object.keys(req.body || {});

  if (
    keys.length === 0 ||
    keys.some((key) => !allowed.includes(key))
  ) {
    return next(new AppError(
      'Dữ liệu cập nhật trống hoặc chứa trường không được hỗ trợ.',
      400
    ));
  }

  const { work_date, start_time, end_time, schedule_status, note } = req.body;

  if (
    work_date !== undefined &&
    !isValidDate(String(work_date))
  ) {
    return next(new AppError(
      'work_date phải có định dạng YYYY-MM-DD và là ngày hợp lệ.',
      400
    ));
  }

  if (
    start_time !== undefined &&
    !isValidTime(String(start_time))
  ) {
    return next(new AppError(
      'start_time phải có định dạng HH:mm hoặc HH:mm:ss.',
      400
    ));
  }

  if (
    end_time !== undefined &&
    !isValidTime(String(end_time))
  ) {
    return next(new AppError(
      'end_time phải có định dạng HH:mm hoặc HH:mm:ss.',
      400
    ));
  }

  if (
    schedule_status !== undefined &&
    !['AVAILABLE', 'UNAVAILABLE'].includes(schedule_status)
  ) {
    return next(new AppError(
      'schedule_status chỉ nhận AVAILABLE hoặc UNAVAILABLE.',
      400
    ));
  }

  if (note !== undefined && note !== null && typeof note !== 'string') {
    return next(new AppError('note phải là chuỗi ký tự.', 400));
  }

  next();
}

// Kiểm tra ID trên URL
function validateIdParam(paramName = 'id') {
  return (req, res, next) => {
    const id = Number(req.params[paramName]);

    if (!Number.isInteger(id) || id <= 0) {
      return next(new AppError(
        `${paramName} phải là số nguyên dương.`,
        400
      ));
    }

    next();
  };
}

module.exports = {
  validateCreateSchedule,
  validateUpdateSchedule,
  validateIdParam
};
