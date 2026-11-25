const assignmentService = require('../services/assignmentService');

async function createAssignment(req, res, next) {
    try {
        const assignment = await assignmentService.createAssignment(
            req.body,
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: 'Phân công người chăm sóc thành công.',
            data: assignment
        });
    } catch (error) {
        next(error);
    }
}

async function getAssignments(req, res, next) {
    try {
        const filters = {
            ...req.user,
            booking_id: req.query.booking_id,
            assignment_status: req.query.assignment_status
        };

        const assignments = await assignmentService.getAssignments(filters);

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách phân công thành công.',
            data: assignments
        });
    } catch (error) {
        next(error);
    }
}

async function getAssignmentById(req, res, next) {
    try {
        const assignment = await assignmentService.getAssignmentById(
            req.params.id
        );

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phân công.'
            });
        }

        if (
            req.user.role === 'CAREGIVER' &&
            Number(assignment.caregiver_user_id) !== Number(req.user.id)
        ) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xem phân công này.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lấy thông tin phân công thành công.',
            data: assignment
        });
    } catch (error) {
        next(error);
    }
}

async function acceptAssignment(req, res, next) {
    try {
        const assignment = await assignmentService.respondAssignment(
            req.params.id,
            req.user.id,
            'ACCEPTED',
            req.body.note
        );

        res.status(200).json({
            success: true,
            message: 'Bạn đã chấp nhận phân công.',
            data: assignment
        });
    } catch (error) {
        next(error);
    }
}

async function rejectAssignment(req, res, next) {
    try {
        const assignment = await assignmentService.respondAssignment(
            req.params.id,
            req.user.id,
            'REJECTED',
            req.body.note
        );

        res.status(200).json({
            success: true,
            message: 'Bạn đã từ chối phân công.',
            data: assignment
        });
    } catch (error) {
        next(error);
    }
}

async function cancelAssignment(req, res, next) {
    try {
        const assignment = await assignmentService.cancelAssignment(
            req.params.id,
            req.body.note
        );

        res.status(200).json({
            success: true,
            message: 'Hủy phân công thành công.',
            data: assignment
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createAssignment,
    getAssignments,
    getAssignmentById,
    acceptAssignment,
    rejectAssignment,
    cancelAssignment
};
