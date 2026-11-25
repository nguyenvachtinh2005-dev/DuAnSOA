const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : null;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Vui lòng đăng nhập để tiếp tục.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id || decoded.user_id || decoded.userId,
            role: decoded.role
        };

        if (!req.user.id || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: 'Token không chứa đầy đủ thông tin người dùng.'
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token không hợp lệ hoặc đã hết hạn.'
        });
    }
}

function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền thực hiện chức năng này.'
            });
        }

        next();
    };
}

module.exports = {
    authenticateToken,
    authorizeRoles
};
