
const authService = require('../services/authService');
const {
    validateRegister,
    validateLogin
} = require('../validators/authValidator');

async function register(req, res) {
    try {
        const validationError = validateRegister(req.body);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const result = await authService.register(req.body);

        return res.status(201).json({
            success: true,
            message: 'Đăng ký tài khoản thành công.',
            data: result
        });
    } catch (error) {
        const statusCode = error.message === 'Email đã được sử dụng.' ? 409 : 500;

        return res.status(statusCode).json({
            success: false,
            message: statusCode === 500
                ? 'Lỗi máy chủ khi đăng ký tài khoản.'
                : error.message
        });
    }
}

async function login(req, res) {
    try {
        const validationError = validateLogin(req.body);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const result = await authService.login(req.body);

        return res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công.',
            data: result
        });
    } catch (error) {
        const messages = [
            'Email hoặc mật khẩu không chính xác.',
            'Tài khoản đã bị khóa.',
            'Tài khoản đang chờ được phê duyệt.'
        ];

        const statusCode = messages.includes(error.message) ? 401 : 500;

        return res.status(statusCode).json({
            success: false,
            message: statusCode === 500
                ? 'Lỗi máy chủ khi đăng nhập.'
                : error.message
        });
    }
}

async function getMe(req, res) {
    try {
        const user = await authService.getCurrentUser(req.user.userId);

        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    register,
    login,
    getMe
};
