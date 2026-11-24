
const errorMiddleware = (err, req, res, next) => {
    console.error('Care Service Error:', err);

    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            success: false,
            message: 'T??n danh m???c ???? t???n t???i.'
        });
    }

    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({
            success: false,
            message: 'Kh??ng th??? x??a d??? li???u ??ang ???????c s??? d???ng.'
        });
    }

    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: statusCode === 500
            ? '???? x???y ra l???i t??? m??y ch???.'
            : err.message
    });
};

module.exports = errorMiddleware;
