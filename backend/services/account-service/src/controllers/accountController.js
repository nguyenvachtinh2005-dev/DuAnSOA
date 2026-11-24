const accountService = require('../services/accountService');

function handleError(res, error) {
    console.error('Account Service Error:', error.message);

    return res.status(error.statusCode || 500).json({
        success: false,
        message: error.statusCode
            ? error.message
            : 'Đã xảy ra lỗi từ máy chủ.'
    });
}

function sendSuccess(res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
}

// ==================== PROFILE ====================

async function getProfile(req, res) {
    try {
        const result = await accountService.getProfile(req.user.userId);

        return sendSuccess(res, 'Lấy thông tin cá nhân thành công.', result);
    } catch (error) {
        return handleError(res, error);
    }
}

async function updateProfile(req, res) {
    try {
        const result = await accountService.updateProfile(
            req.user.userId,
            req.body
        );

        return sendSuccess(
            res,
            'Cập nhật thông tin cá nhân thành công.',
            result
        );
    } catch (error) {
        return handleError(res, error);
    }
}

// ==================== RECIPIENTS ====================

async function getRecipients(req, res) {
    try {
        const result = await accountService.getRecipients(req.user.userId);

        return sendSuccess(
            res,
            'Lấy danh sách người cần chăm sóc thành công.',
            result
        );
    } catch (error) {
        return handleError(res, error);
    }
}

async function getRecipientById(req, res) {
    try {
        const result = await accountService.getRecipientById(
            req.user.userId,
            req.params.id
        );

        return sendSuccess(res, 'Lấy thông tin thành công.', result);
    } catch (error) {
        return handleError(res, error);
    }
}

async function createRecipient(req, res) {
    try {
        const result = await accountService.createRecipient(
            req.user.userId,
            req.body
        );

        return sendSuccess(
            res,
            'Thêm người cần chăm sóc thành công.',
            result,
            201
        );
    } catch (error) {
        return handleError(res, error);
    }
}

async function updateRecipient(req, res) {
    try {
        const result = await accountService.updateRecipient(
            req.user.userId,
            req.params.id,
            req.body
        );

        return sendSuccess(
            res,
            'Cập nhật người cần chăm sóc thành công.',
            result
        );
    } catch (error) {
        return handleError(res, error);
    }
}

async function deleteRecipient(req, res) {
    try {
        await accountService.deleteRecipient(
            req.user.userId,
            req.params.id
        );

        return sendSuccess(
            res,
            'Xóa người cần chăm sóc thành công.'
        );
    } catch (error) {
        return handleError(res, error);
    }
}

// ==================== ADDRESSES ====================

async function getAddresses(req, res) {
    try {
        const result = await accountService.getAddresses(
            req.user.userId,
            req.user.role,
            req.query.recipient_id || null
        );

        return sendSuccess(res, 'Lấy danh sách địa chỉ thành công.', result);
    } catch (error) {
        return handleError(res, error);
    }
}

async function createAddress(req, res) {
    try {
        const result = await accountService.createAddress(
            req.user.userId,
            req.user.role,
            req.body
        );

        return sendSuccess(
            res,
            'Thêm địa chỉ thành công.',
            result,
            201
        );
    } catch (error) {
        return handleError(res, error);
    }
}

async function updateAddress(req, res) {
    try {
        const result = await accountService.updateAddress(
            req.user.userId,
            req.user.role,
            req.params.id,
            req.body
        );

        return sendSuccess(res, 'Cập nhật địa chỉ thành công.', result);
    } catch (error) {
        return handleError(res, error);
    }
}

async function deleteAddress(req, res) {
    try {
        await accountService.deleteAddress(
            req.user.userId,
            req.params.id
        );

        return sendSuccess(res, 'Xóa địa chỉ thành công.');
    } catch (error) {
        return handleError(res, error);
    }
}

module.exports = {
    getProfile,
    updateProfile,
    getRecipients,
    getRecipientById,
    createRecipient,
    updateRecipient,
    deleteRecipient,
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress
};