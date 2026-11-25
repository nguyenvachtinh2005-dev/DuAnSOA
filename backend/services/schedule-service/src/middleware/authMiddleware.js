
const jwt = require('jsonwebtoken');
const { AppError } = require('./errorMiddleware');

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // DEBUG: Không in token hoặc JWT_SECRET ra màn hình.
    console.log('\n========== SCHEDULE AUTH DEBUG ==========');
    console.log('Authorization exists:', !!authHeader);
    console.log('Authorization prefix:', authHeader?.slice(0, 7));
    console.log(
      'JWT_SECRET exists:',
      !!process.env.JWT_SECRET
    );
    console.log(
      'JWT_SECRET length:',
      process.env.JWT_SECRET?.length || 0
    );

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(
        new AppError('Vui lòng cung cấp Access Token Bearer.', 401)
      );
    }

    const token = authHeader.slice(7).trim();

    console.log('Token parts:', token.split('.').length);
    console.log('Token length:', token.length);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('JWT verification: SUCCESS');
    console.log('User ID:', decoded.userId || decoded.id || decoded.sub);
    console.log('Role:', decoded.role);
    console.log('========================================\n');

    const userId = Number(decoded.id || decoded.userId || decoded.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new AppError(
        'Thông tin người dùng trong token không hợp lệ.',
        401
      );
    }

    req.user = {
      id: userId,
      role: String(decoded.role || '').toUpperCase(),
      email: decoded.email || null,
    };

    if (!req.user.role) {
      throw new AppError(
        'Token không chứa thông tin phân quyền.',
        401
      );
    }

    next();
  } catch (err) {
    console.log('JWT verification error:', err.name, err.message);

    if (err instanceof AppError) return next(err);

    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token đã hết hạn.', 401));
    }

    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Token không hợp lệ.', 401));
    }

    return next(err);
  }
}

function authorizeRoles(...allowedRoles) {
  const roles = allowedRoles.map((role) => String(role).toUpperCase());

  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Chưa xác thực người dùng.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Bạn không có quyền thực hiện chức năng này.', 403)
      );
    }

    next();
  };
}

module.exports = { authenticate, authorizeRoles };
