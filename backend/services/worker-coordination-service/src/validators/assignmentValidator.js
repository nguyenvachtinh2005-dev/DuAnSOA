function validateCreateAssignment(req, res, next) {
    const { booking_id, caregiver_id } = req.body;

    if (!Number.isInteger(Number(booking_id)) || Number(booking_id) <= 0) {
        return res.status(400).json({
            success: false,
            message: 'booking_id phải là số nguyên dương.'
        });
    }

    if (!Number.isInteger(Number(caregiver_id)) || Number(caregiver_id) <= 0) {
        return res.status(400).json({
            success: false,
            message: 'caregiver_id phải là số nguyên dương.'
        });
    }

    if (req.body.note !== undefined && typeof req.body.note !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'note phải là chuỗi ký tự.'
        });
    }

    next();
}

function validateAssignmentResponse(req, res, next) {
    const { note } = req.body;

    if (note !== undefined && typeof note !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'note phải là chuỗi ký tự.'
        });
    }

    next();
}

module.exports = {
    validateCreateAssignment,
    validateAssignmentResponse
};
