
function validateRegister(data) {
    const { email, password, role } = data;

    if (!email || !password || !role) {
        return 'Email, mật khẩu và vai trò là bắt buộc.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return 'Email không đúng định dạng.';
    }

    if (password.length < 8) {
        return 'Mật khẩu phải có ít nhất 8 ký tự.';
    }

    if (!['CUSTOMER', 'CAREGIVER'].includes(role)) {
        return 'Vai trò chỉ được phép là CUSTOMER hoặc CAREGIVER.';
    }

    return null;
}

function validateLogin(data) {
    const { email, password } = data;

    if (!email || !password) {
        return 'Email và mật khẩu là bắt buộc.';
    }

    return null;
}

module.exports = {
    validateRegister,
    validateLogin
};
