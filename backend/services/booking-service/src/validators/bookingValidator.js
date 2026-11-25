const { AppError } = require('../middleware/errorMiddleware');

function positiveId(value, fieldName) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(`${fieldName} phải là số nguyên dương.`, 400);
  }
  return id;
}

function parseDateTime(value, fieldName) {
  if (typeof value !== 'string') {
    throw new AppError(`${fieldName} phải có định dạng YYYY-MM-DD HH:mm:ss.`, 400);
  }

  const normalized = value.trim();
  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/
  );

  if (!match) {
    throw new AppError(`${fieldName} phải có định dạng YYYY-MM-DD HH:mm:ss.`, 400);
  }

  const [, y, mo, d, h, mi, s = '00'] = match;
  const year = Number(y);
  const month = Number(mo);
  const day = Number(d);
  const hour = Number(h);
  const minute = Number(mi);
  const second = Number(s);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  if (
    year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth ||
    hour > 23 || minute > 59 || second > 59
  ) {
    throw new AppError(`${fieldName} không phải ngày giờ hợp lệ.`, 400);
  }

  return `${y}-${mo}-${d} ${h}:${mi}:${s}`;
}

function validateCreateBooking(req, res, next) {
  try {
    const body = req.body || {};
    positiveId(body.recipient_id, 'recipient_id');
    positiveId(body.address_id, 'address_id');
    positiveId(body.care_service_id, 'care_service_id');

    const start = parseDateTime(body.scheduled_start, 'scheduled_start');
    const end = parseDateTime(body.scheduled_end, 'scheduled_end');

    if (end <= start) {
      throw new AppError('scheduled_end phải lớn hơn scheduled_start.', 400);
    }

    if (
      body.customer_note !== undefined &&
      body.customer_note !== null &&
      typeof body.customer_note !== 'string'
    ) {
      throw new AppError('customer_note phải là chuỗi ký tự.', 400);
    }

    req.validatedBooking = {
      recipientId: Number(body.recipient_id),
      addressId: Number(body.address_id),
      careServiceId: Number(body.care_service_id),
      scheduledStart: start,
      scheduledEnd: end,
      customerNote: body.customer_note?.trim() || null,
    };
    next();
  } catch (err) {
    next(err);
  }
}

function validateIdParam(req, res, next) {
  try {
    req.bookingId = positiveId(req.params.id, 'id');
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  validateCreateBooking,
  validateIdParam,
  positiveId,
  parseDateTime,
};
