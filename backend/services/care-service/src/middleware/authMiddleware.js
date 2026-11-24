
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Vui l??ng ????ng nh???p ????? ti???p t???c.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        if (!req.user.userId || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: 'Token kh??ng h???p l???.'
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token kh??ng h???p l??? ho???c ???? h???t h???n.'
        });
    }
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'B???n kh??ng c?? quy???n th???c hi???n ch???c n??ng n??y.'
            });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles
};
