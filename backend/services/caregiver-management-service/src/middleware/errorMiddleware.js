class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

const notFoundHandler = (req, res, next) => {
  next(new AppError(`Không tìm thấy route: ${req.method} ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi máy chủ nội bộ';
  let details = err.details || null;

  // Xử lý lỗi đặc thù từ MySQL / mysql2
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Dữ liệu đã tồn tại trong hệ thống (trùng khóa duy nhất)';
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    statusCode = 400;
    message = 'Dữ liệu tham chiếu không hợp lệ hoặc đang được sử dụng';
  } else if (err.code === 'WARN_DATA_TRUNCATED' || err.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
    statusCode = 400;
    message = 'Giá trị dữ liệu không đúng định dạng cho phép của cơ sở dữ liệu';
  }

  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
    console.error('[ErrorMiddleware]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(process.env.NODE_ENV !== 'production' && err.stack && statusCode >= 500
      ? { stack: err.stack }
      : {}),
  });
};

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler,
};