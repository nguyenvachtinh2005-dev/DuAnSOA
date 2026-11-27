const jwt = require('jsonwebtoken');

const publicPaths = [
    '/health',
    '/api/auth/login',
    '/api/auth/register'
];

function authMiddleware(req, res, next) {
    if (publicPaths.some((path) => req.originalUrl.startsWith(path))) {
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Thiếu hoặc sai định dạng Bearer token.'
        });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        // Có thể forward thông tin user qua header cho các service phía sau nếu cần
        req.headers['x-user-id'] = String(decoded.userId ?? '');
        req.headers['x-user-role'] = String(decoded.role ?? '');
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Token không hợp lệ hoặc đã hết hạn.'
        });
    }
}

module.exports = authMiddleware;