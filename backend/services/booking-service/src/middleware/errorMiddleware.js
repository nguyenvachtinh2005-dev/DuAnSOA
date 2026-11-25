class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

function notFoundHandler(req, res, next) {
  next(new AppError(`Không tìm thấy API: ${req.method} ${req.originalUrl}`, 404));
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const statusCode = Number(err.statusCode) || 500;
  if (statusCode >= 500) {
    console.error('[Booking Service Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? 'Lỗi máy chủ Booking Service.' : err.message,
  });
}

module.exports = { AppError, notFoundHandler, errorHandler };
