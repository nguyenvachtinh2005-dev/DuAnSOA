const db = require('../config/database');
const { AppError } = require('../middleware/errorMiddleware');

const BOOKING_SELECT = `
  SELECT
    b.id, b.customer_id, b.recipient_id, b.address_id, b.care_service_id,
    b.scheduled_start, b.scheduled_end, b.duration_hours,
    b.unit_price, b.total_amount, b.booking_status,
    b.customer_note, b.cancellation_reason, b.created_at, b.updated_at,
    cr.full_name AS recipient_name,
    ua.detail_address, ua.ward, ua.district, ua.province,
    cs.name AS care_service_name
  FROM bookings b
  LEFT JOIN care_recipients cr ON cr.id = b.recipient_id
  LEFT JOIN user_addresses ua ON ua.id = b.address_id
  LEFT JOIN care_services cs ON cs.id = b.care_service_id
`;

function hoursBetween(start, end) {
  const startMs = new Date(`${start.replace(' ', 'T')}Z`).getTime();
  const endMs = new Date(`${end.replace(' ', 'T')}Z`).getTime();
  return (endMs - startMs) / 3600000;
}

async function createBooking(user, input) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [recipients] = await connection.execute(
      `SELECT id FROM care_recipients
       WHERE id = ? AND customer_id = ? FOR UPDATE`,
      [input.recipientId, user.id]
    );
    if (recipients.length === 0) {
      throw new AppError('Người được chăm sóc không tồn tại hoặc không thuộc tài khoản của bạn.', 404);
    }

    const [addresses] = await connection.execute(
      `SELECT id, recipient_id FROM user_addresses
       WHERE id = ? AND user_id = ? FOR UPDATE`,
      [input.addressId, user.id]
    );
    if (addresses.length === 0) {
      throw new AppError('Địa chỉ không tồn tại hoặc không thuộc tài khoản của bạn.', 404);
    }
    if (
      addresses[0].recipient_id !== null &&
      Number(addresses[0].recipient_id) !== input.recipientId
    ) {
      throw new AppError('Địa chỉ này không được liên kết với người cần chăm sóc đã chọn.', 400);
    }

    const [services] = await connection.execute(
      `SELECT id, name, price_per_hour
       FROM care_services
       WHERE id = ? AND service_status = 'ACTIVE'
       FOR UPDATE`,
      [input.careServiceId]
    );
    if (services.length === 0) {
      throw new AppError('Dịch vụ không tồn tại hoặc hiện không hoạt động.', 404);
    }

    const duration = hoursBetween(input.scheduledStart, input.scheduledEnd);
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new AppError('Khoảng thời gian đặt lịch không hợp lệ.', 400);
    }

    const durationHours = Math.round(duration * 100) / 100;
    const unitPrice = Number(services[0].price_per_hour);
    const totalAmount = Math.round(unitPrice * durationHours * 100) / 100;

    const [insert] = await connection.execute(
      `INSERT INTO bookings (
        customer_id, recipient_id, address_id, care_service_id,
        scheduled_start, scheduled_end, duration_hours,
        unit_price, total_amount, booking_status, customer_note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
      [
        user.id,
        input.recipientId,
        input.addressId,
        input.careServiceId,
        input.scheduledStart,
        input.scheduledEnd,
        durationHours,
        unitPrice,
        totalAmount,
        input.customerNote,
      ]
    );

    await connection.execute(
      `INSERT INTO booking_status_history
       (booking_id, old_status, new_status, changed_by, note)
       VALUES (?, NULL, 'PENDING', ?, ?)`,
      [insert.insertId, user.id, 'Khách hàng tạo yêu cầu đặt lịch.']
    );

    await connection.commit();
    return getBookingById(user, insert.insertId);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function listBookings(user, filters = {}) {
  const conditions = [];
  const params = [];

  if (user.role !== 'ADMIN') {
    conditions.push('b.customer_id = ?');
    params.push(user.id);
  } else if (filters.customer_id) {
    const customerId = Number(filters.customer_id);
    if (!Number.isInteger(customerId) || customerId <= 0) {
      throw new AppError('customer_id phải là số nguyên dương.', 400);
    }
    conditions.push('b.customer_id = ?');
    params.push(customerId);
  }

  if (filters.booking_status) {
    const statuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!statuses.includes(filters.booking_status)) {
      throw new AppError('booking_status không hợp lệ.', 400);
    }
    conditions.push('b.booking_status = ?');
    params.push(filters.booking_status);
  }

  if (filters.from) {
    conditions.push('DATE(b.scheduled_start) >= ?');
    params.push(filters.from);
  }
  if (filters.to) {
    conditions.push('DATE(b.scheduled_start) <= ?');
    params.push(filters.to);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await db.execute(
    `${BOOKING_SELECT} ${where} ORDER BY b.id DESC`,
    params
  );
  return rows;
}

async function getBookingById(user, bookingId) {
  const conditions = ['b.id = ?'];
  const params = [bookingId];

  if (user.role !== 'ADMIN') {
    conditions.push('b.customer_id = ?');
    params.push(user.id);
  }

  const [rows] = await db.execute(
    `${BOOKING_SELECT} WHERE ${conditions.join(' AND ')} LIMIT 1`,
    params
  );

  if (rows.length === 0) {
    throw new AppError('Không tìm thấy booking hoặc bạn không có quyền truy cập.', 404);
  }

  const [history] = await db.execute(
    `SELECT id, old_status, new_status, changed_by, note, changed_at
     FROM booking_status_history
     WHERE booking_id = ?
     ORDER BY id ASC`,
    [bookingId]
  );

  return { ...rows[0], status_history: history };
}

async function cancelBooking(user, bookingId, reason) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      'SELECT id, customer_id, booking_status FROM bookings WHERE id = ? FOR UPDATE',
      [bookingId]
    );

    if (rows.length === 0) throw new AppError('Không tìm thấy booking.', 404);

    const booking = rows[0];
    if (user.role !== 'ADMIN' && Number(booking.customer_id) !== user.id) {
      throw new AppError('Bạn không có quyền hủy booking này.', 403);
    }

    if (['COMPLETED', 'CANCELLED'].includes(booking.booking_status)) {
      throw new AppError('Booking đã kết thúc, không thể hủy.', 400);
    }

    if (
      user.role !== 'ADMIN' &&
      !['PENDING', 'CONFIRMED'].includes(booking.booking_status)
    ) {
      throw new AppError('Khách hàng chỉ được hủy booking đang PENDING hoặc CONFIRMED.', 400);
    }

    await connection.execute(
      `UPDATE bookings
       SET booking_status = 'CANCELLED', cancellation_reason = ?
       WHERE id = ?`,
      [reason || null, bookingId]
    );

    await connection.execute(
      `INSERT INTO booking_status_history
       (booking_id, old_status, new_status, changed_by, note)
       VALUES (?, ?, 'CANCELLED', ?, ?)`,
      [bookingId, booking.booking_status, user.id, reason || 'Booking đã bị hủy.']
    );

    await connection.commit();
    return getBookingById(user, bookingId);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function updateBookingStatus(user, bookingId, newStatus, note) {
  const allowedStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  if (!allowedStatuses.includes(newStatus)) {
    throw new AppError('booking_status không hợp lệ.', 400);
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      'SELECT id, booking_status FROM bookings WHERE id = ? FOR UPDATE',
      [bookingId]
    );
    if (rows.length === 0) throw new AppError('Không tìm thấy booking.', 404);

    const oldStatus = rows[0].booking_status;
    const transitions = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!transitions[oldStatus].includes(newStatus)) {
      throw new AppError(`Không thể chuyển trạng thái từ ${oldStatus} sang ${newStatus}.`, 400);
    }

    await connection.execute(
      'UPDATE bookings SET booking_status = ? WHERE id = ?',
      [newStatus, bookingId]
    );

    await connection.execute(
      `INSERT INTO booking_status_history
       (booking_id, old_status, new_status, changed_by, note)
       VALUES (?, ?, ?, ?, ?)`,
      [bookingId, oldStatus, newStatus, user.id, note || null]
    );

    await connection.commit();
    return getBookingById(user, bookingId);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  createBooking,
  listBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
};
