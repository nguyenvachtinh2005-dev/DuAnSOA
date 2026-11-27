function errorMiddleware(err, req, res, next) {
    console.error('[Gateway Error]:', err);
    if (res.headersSent) {
        return next(err);
    }
    return res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Lỗi máy chủ tại API Gateway.'
    });
}

module.exports = errorMiddleware;