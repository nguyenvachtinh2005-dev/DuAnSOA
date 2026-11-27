const jwt = require('jsonwebtoken');
const { AppError } = require('./errorMiddleware');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'dev-secret-key';
      const decoded = jwt.verify(token, secret);

      req.user = {
        id: Number(decoded.id || decoded.userId || decoded.sub),
        role: String(decoded.role || '').toUpperCase(),
        email: decoded.email || null,
      };
      return next();
    }

    // Hỗ trợ dev/test khi gọi nội bộ qua gateway hoặc test Postman bằng header
    if (process.env.ALLOW_HEADER_AUTH === 'true' && req.headers['x-user-id']) {
      req.user = {
        id: Number(req.headers['x-user-id']),
        role: String(req.headers['x-user-role'] || 'CAREGIVER').toUpperCase(),
        email: req.headers['x-user-email'] || null,
      };
      return next();
    }

    return next(new AppError('Thiếu token xác thực (Authorization Bearer token)', 401));
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token đã hết hạn', 401));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Token không hợp lệ', 401));
    }
    return next(err);
  }
};

const authorizeRoles = (...allowedRoles) => {
  const normalizedRoles = allowedRoles.map((r) => String(r).toUpperCase());
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new AppError('Chưa xác thực thông tin người dùng', 401));
    }

    if (!normalizedRoles.includes(req.user.role)) {
      return next(
        new AppError('Bạn không có quyền truy cập chức năng này', 403)
      );
    }

    return next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles,
};