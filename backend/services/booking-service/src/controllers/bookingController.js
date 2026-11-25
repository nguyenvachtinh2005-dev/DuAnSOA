const BookingService = require('../services/bookingService');
const { AppError } = require('../middleware/errorMiddleware');

async function create(req, res, next) {
  try {
    const booking = await BookingService.createBooking(req.user, req.validatedBooking);
    res.status(201).json({
      success: true,
      message: 'Tạo yêu cầu đặt lịch thành công.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const bookings = await BookingService.listBookings(req.user, req.query);
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách booking thành công.',
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const booking = await BookingService.getBookingById(req.user, req.bookingId);
    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết booking thành công.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    const reason = req.body?.cancellation_reason;
    if (reason !== undefined && reason !== null && typeof reason !== 'string') {
      throw new AppError('cancellation_reason phải là chuỗi ký tự.', 400);
    }

    const booking = await BookingService.cancelBooking(
      req.user,
      req.bookingId,
      reason?.trim() || null
    );

    res.status(200).json({
      success: true,
      message: 'Hủy booking thành công.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { booking_status, note } = req.body || {};

    if (typeof booking_status !== 'string') {
      throw new AppError('booking_status là bắt buộc.', 400);
    }
    if (note !== undefined && note !== null && typeof note !== 'string') {
      throw new AppError('note phải là chuỗi ký tự.', 400);
    }

    const booking = await BookingService.updateBookingStatus(
      req.user,
      req.bookingId,
      booking_status,
      note?.trim() || null
    );

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái booking thành công.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getById, cancel, updateStatus };
