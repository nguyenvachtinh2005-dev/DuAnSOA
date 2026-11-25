const jwt = require('jsonwebtoken');
const { AppError } = require('./errorMiddleware');

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Vui lòng cung cấp Access Token Bearer.', 401);
    }

    const token = authHeader.slice(7).trim();
    if (!token) throw new AppError('Access Token không được để trống.', 401);
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET chưa được cấu hình trong .env');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = Number(decoded.userId || decoded.id || decoded.sub);
    const role = String(decoded.role || '').toUpperCase();

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new AppError('Thông tin người dùng trong token không hợp lệ.', 401);
    }
    if (!['CUSTOMER', 'CAREGIVER', 'ADMIN'].includes(role)) {
      throw new AppError('Token không chứa vai trò hợp lệ.', 401);
    }

    req.user = {
      id: userId,
      email: decoded.email || null,
      role,
    };
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token đã hết hạn.', 401));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Token không hợp lệ.', 401));
    }
    next(err);
  }
}

function authorizeRoles(...allowedRoles) {
  const roles = allowedRoles.map((role) => String(role).toUpperCase());
  return (req, res, next) => {
    if (!req.user) return next(new AppError('Chưa xác thực người dùng.', 401));
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Bạn không có quyền thực hiện chức năng này.', 403));
    }
    next();
  };
}

module.exports = { authenticate, authorizeRoles };
