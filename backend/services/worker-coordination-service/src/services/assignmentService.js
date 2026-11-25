
const pool = require('../config/database');

function createError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

// Tạo phân công người chăm sóc
async function createAssignment(data, adminId) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Kiểm tra booking
        const [bookings] = await connection.execute(
            `SELECT b.*, a.province, a.district
             FROM bookings b
             JOIN user_addresses a ON a.id = b.address_id
             WHERE b.id = ?
             FOR UPDATE`,
            [data.booking_id]
        );

        if (!bookings.length) {
            throw createError('Không tìm thấy booking.', 404);
        }

        const booking = bookings[0];

        if (booking.booking_status !== 'PENDING') {
            throw createError(
                'Chỉ có thể phân công booking đang ở trạng thái PENDING.'
            );
        }

        // Kiểm tra người chăm sóc
        const [caregivers] = await connection.execute(
            `SELECT cp.id, cp.user_id, cp.verification_status,
                    uc.account_status
             FROM caregiver_profiles cp
             JOIN user_credentials uc ON uc.id = cp.user_id
             WHERE cp.id = ?
             FOR UPDATE`,
            [data.caregiver_id]
        );

        if (!caregivers.length) {
            throw createError('Không tìm thấy người chăm sóc.', 404);
        }

        const caregiver = caregivers[0];

        if (caregiver.verification_status !== 'APPROVED') {
            throw createError(
                'Người chăm sóc chưa được xác minh hoặc chưa được duyệt.'
            );
        }

        if (caregiver.account_status !== 'ACTIVE') {
            throw createError('Tài khoản người chăm sóc không hoạt động.');
        }

        // Kiểm tra dịch vụ người chăm sóc đăng ký
        const [services] = await connection.execute(
            `SELECT id
             FROM caregiver_services
             WHERE caregiver_id = ?
               AND care_service_id = ?`,
            [data.caregiver_id, booking.care_service_id]
        );

        if (!services.length) {
            throw createError(
                'Người chăm sóc chưa đăng ký cung cấp dịch vụ này.'
            );
        }

        // Kiểm tra khu vực hoạt động
        const [areas] = await connection.execute(
            `SELECT id
             FROM caregiver_service_areas
             WHERE caregiver_id = ?
               AND province = ?
               AND (district IS NULL OR district = ?)
             LIMIT 1`,
            [
                data.caregiver_id,
                booking.province,
                booking.district
            ]
        );

        if (!areas.length) {
            throw createError(
                'Người chăm sóc không hoạt động tại khu vực của booking.'
            );
        }

        // Kiểm tra lịch làm việc
        const [schedules] = await connection.execute(
            `SELECT id
             FROM caregiver_schedules
             WHERE caregiver_id = ?
               AND work_date = DATE(?)
               AND schedule_status = 'AVAILABLE'
               AND start_time <= TIME(?)
               AND end_time >= TIME(?)
             LIMIT 1`,
            [
                data.caregiver_id,
                booking.scheduled_start,
                booking.scheduled_start,
                booking.scheduled_end
            ]
        );

        if (!schedules.length) {
            throw createError(
                'Người chăm sóc không có lịch trống phù hợp với booking.'
            );
        }

        // Kiểm tra trùng lịch phân công
        const [conflicts] = await connection.execute(
            `SELECT ba.id
             FROM booking_assignments ba
             JOIN bookings b ON b.id = ba.booking_id
             WHERE ba.caregiver_id = ?
               AND ba.assignment_status IN ('ASSIGNED', 'ACCEPTED')
               AND b.booking_status NOT IN ('CANCELLED', 'COMPLETED')
               AND b.scheduled_start < ?
               AND b.scheduled_end > ?
             LIMIT 1`,
            [
                data.caregiver_id,
                booking.scheduled_end,
                booking.scheduled_start
            ]
        );

        if (conflicts.length) {
            throw createError(
                'Người chăm sóc đã có lịch được phân công trùng thời gian.'
            );
        }

        // Kiểm tra booking đã được phân công hay chưa
        const [existing] = await connection.execute(
            `SELECT id
             FROM booking_assignments
             WHERE booking_id = ?
               AND assignment_status IN ('ASSIGNED', 'ACCEPTED')
             LIMIT 1
             FOR UPDATE`,
            [data.booking_id]
        );

        if (existing.length) {
            throw createError(
                'Booking này đã có người chăm sóc được phân công.'
            );
        }

        // Tạo phân công
        const [result] = await connection.execute(
            `INSERT INTO booking_assignments
                (booking_id, caregiver_id, assigned_by,
                 assignment_status, note)
             VALUES (?, ?, ?, 'ASSIGNED', ?)`,
            [
                data.booking_id,
                data.caregiver_id,
                adminId,
                data.note || null
            ]
        );

        await connection.commit();

        return getAssignmentById(result.insertId);

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Lấy chi tiết phân công
async function getAssignmentById(id) {
    const [rows] = await pool.execute(
        `SELECT
            ba.id,
            ba.booking_id,
            ba.caregiver_id,
            ba.assigned_by,
            ba.assignment_status,
            ba.assigned_at,
            ba.responded_at,
            ba.note,
            cp.user_id AS caregiver_user_id,
            COALESCE(up.full_name, uc.email) AS caregiver_name,
            uc.email AS caregiver_email,
            b.customer_id,
            b.scheduled_start,
            b.scheduled_end,
            b.booking_status,
            cs.name AS service_name
         FROM booking_assignments ba
         JOIN caregiver_profiles cp ON cp.id = ba.caregiver_id
         LEFT JOIN user_profiles up ON up.user_id = cp.user_id
         JOIN user_credentials uc ON uc.id = cp.user_id
         JOIN bookings b ON b.id = ba.booking_id
         JOIN care_services cs ON cs.id = b.care_service_id
         WHERE ba.id = ?`,
        [id]
    );

    return rows[0] || null;
}

// Lấy danh sách phân công
async function getAssignments(user) {
    let sql = `
        SELECT
            ba.id,
            ba.booking_id,
            ba.caregiver_id,
            ba.assigned_by,
            ba.assignment_status,
            ba.assigned_at,
            ba.responded_at,
            ba.note,
            cp.user_id AS caregiver_user_id,
            COALESCE(up.full_name, uc.email) AS caregiver_name,
            uc.email AS caregiver_email,
            b.customer_id,
            b.scheduled_start,
            b.scheduled_end,
            b.booking_status,
            cs.name AS service_name
        FROM booking_assignments ba
        JOIN caregiver_profiles cp ON cp.id = ba.caregiver_id
        LEFT JOIN user_profiles up ON up.user_id = cp.user_id
        JOIN user_credentials uc ON uc.id = cp.user_id
        JOIN bookings b ON b.id = ba.booking_id
        JOIN care_services cs ON cs.id = b.care_service_id
        WHERE 1 = 1
    `;

    const params = [];

    // Caregiver chỉ xem phân công của chính mình
    if (user.role === 'CAREGIVER') {
        const [caregivers] = await pool.execute(
            `SELECT id
             FROM caregiver_profiles
             WHERE user_id = ?`,
            [user.id]
        );

        if (!caregivers.length) {
            return [];
        }

        sql += ' AND ba.caregiver_id = ?';
        params.push(caregivers[0].id);
    }

    // Admin xem tất cả và có thể lọc
    if (user.role === 'ADMIN') {
        if (user.booking_id) {
            sql += ' AND ba.booking_id = ?';
            params.push(user.booking_id);
        }

        if (user.assignment_status) {
            sql += ' AND ba.assignment_status = ?';
            params.push(user.assignment_status);
        }
    }

    sql += ' ORDER BY ba.assigned_at DESC';

    const [rows] = await pool.execute(sql, params);

    return rows;
}

// Caregiver chấp nhận hoặc từ chối phân công
async function respondAssignment(id, caregiverUserId, status, note) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [rows] = await connection.execute(
            `SELECT ba.*, cp.user_id
             FROM booking_assignments ba
             JOIN caregiver_profiles cp ON cp.id = ba.caregiver_id
             WHERE ba.id = ?
             FOR UPDATE`,
            [id]
        );

        if (!rows.length) {
            throw createError('Không tìm thấy phân công.', 404);
        }

        const assignment = rows[0];

        if (Number(assignment.user_id) !== Number(caregiverUserId)) {
            throw createError(
                'Bạn không có quyền phản hồi phân công này.',
                403
            );
        }

        if (assignment.assignment_status !== 'ASSIGNED') {
            throw createError(
                'Phân công này không còn ở trạng thái chờ phản hồi.'
            );
        }

        await connection.execute(
            `UPDATE booking_assignments
             SET assignment_status = ?,
                 responded_at = NOW(),
                 note = CASE
                    WHEN ? IS NULL OR ? = '' THEN note
                    ELSE ?
                 END
             WHERE id = ?`,
            [status, note || null, note || null, note || null, id]
        );

        await connection.commit();

        return getAssignmentById(id);

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Admin hủy phân công
async function cancelAssignment(id, note) {
    const [rows] = await pool.execute(
        `SELECT id, assignment_status
         FROM booking_assignments
         WHERE id = ?`,
        [id]
    );

    if (!rows.length) {
        throw createError('Không tìm thấy phân công.', 404);
    }

    if (!['ASSIGNED', 'ACCEPTED'].includes(rows[0].assignment_status)) {
        throw createError(
            'Không thể hủy phân công ở trạng thái hiện tại.'
        );
    }

    await pool.execute(
        `UPDATE booking_assignments
         SET assignment_status = 'CANCELLED',
             responded_at = NOW(),
             note = CASE
                WHEN ? IS NULL OR ? = '' THEN note
                ELSE ?
             END
         WHERE id = ?`,
        [note || null, note || null, note || null, id]
    );

    return getAssignmentById(id);
}

module.exports = {
    createAssignment,
    getAssignmentById,
    getAssignments,
    respondAssignment,
    cancelAssignment
};
