class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode < 500 ? 'fail' : 'error';
  }
}

function notFoundHandler(req, res, next) {
  next(new AppError(`Không tìm thấy API: ${req.method} ${req.originalUrl}`, 404));
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Đã xảy ra lỗi máy chủ.',
  });
}

module.exports = { AppError, notFoundHandler, errorHandler };