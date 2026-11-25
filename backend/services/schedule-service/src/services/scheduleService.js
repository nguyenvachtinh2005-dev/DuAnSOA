const db = require('../config/database');
const { AppError } = require('../middleware/errorMiddleware');

async function getCaregiverIdByUserId(userId) {
  const [rows] = await db.execute(
    'SELECT id FROM caregiver_profiles WHERE user_id = ? LIMIT 1',
    [userId]
  );
  if (!rows.length) {
    throw new AppError('Tài khoản chưa có hồ sơ người chăm sóc.', 404);
  }
  return Number(rows[0].id);
}

async function getScheduleById(scheduleId) {
  const [rows] = await db.execute(
    `SELECT id, caregiver_id, work_date, start_time, end_time,
            schedule_status, note, created_at, updated_at
     FROM caregiver_schedules
     WHERE id = ?`,
    [scheduleId]
  );
  return rows[0] || null;
}

async function ensureCanManageSchedule(user, schedule) {
  if (!schedule) throw new AppError('Không tìm thấy lịch làm việc.', 404);
  if (user.role === 'ADMIN') return;
  if (user.role !== 'CAREGIVER') {
    throw new AppError('Chỉ người chăm sóc hoặc ADMIN được quản lý lịch.', 403);
  }
  const caregiverId = await getCaregiverIdByUserId(user.id);
  if (Number(schedule.caregiver_id) !== caregiverId) {
    throw new AppError('Bạn không có quyền truy cập lịch làm việc này.', 403);
  }
}

async function assertCanAccessSchedule(user, schedule) {
  await ensureCanManageSchedule(user, schedule);
}

function timeToSeconds(value) {
  const parts = String(value).split(':').map(Number);
  return parts[0] * 3600 + parts[1] * 60 + (parts[2] || 0);
}

async function checkOverlap(caregiverId, workDate, startTime, endTime, excludeId = null) {
  let sql = `
    SELECT id
    FROM caregiver_schedules
    WHERE caregiver_id = ?
      AND work_date = ?
      AND start_time < ?
      AND end_time > ?`;
  const params = [caregiverId, workDate, endTime, startTime];

  if (excludeId !== null) {
    sql += ' AND id <> ?';
    params.push(excludeId);
  }

  sql += ' LIMIT 1';
  const [rows] = await db.execute(sql, params);
  if (rows.length) {
    throw new AppError('Khung giờ bị trùng với một lịch làm việc đã tồn tại.', 409);
  }
}

async function listSchedules(user, filters = {}) {
  let sql = `
    SELECT s.id, s.caregiver_id, s.work_date, s.start_time, s.end_time,
           s.schedule_status, s.note, s.created_at, s.updated_at,
           cp.user_id AS caregiver_user_id
    FROM caregiver_schedules s
    INNER JOIN caregiver_profiles cp ON cp.id = s.caregiver_id
    WHERE 1 = 1`;
  const params = [];

  if (user.role === 'CAREGIVER') {
    const caregiverId = await getCaregiverIdByUserId(user.id);
    sql += ' AND s.caregiver_id = ?';
    params.push(caregiverId);
  } else if (user.role !== 'ADMIN') {
    throw new AppError('Chỉ người chăm sóc hoặc ADMIN được xem lịch.', 403);
  } else if (filters.caregiver_id) {
    sql += ' AND s.caregiver_id = ?';
    params.push(Number(filters.caregiver_id));
  }

  if (filters.from) {
    sql += ' AND s.work_date >= ?';
    params.push(filters.from);
  }
  if (filters.to) {
    sql += ' AND s.work_date <= ?';
    params.push(filters.to);
  }
  if (filters.schedule_status) {
    sql += ' AND s.schedule_status = ?';
    params.push(filters.schedule_status);
  }

  sql += ' ORDER BY s.work_date ASC, s.start_time ASC, s.id ASC';
  const [rows] = await db.execute(sql, params);
  return rows;
}

async function createSchedule(user, data) {
  let caregiverId;

  if (user.role === 'CAREGIVER') {
    caregiverId = await getCaregiverIdByUserId(user.id);
  } else if (user.role === 'ADMIN') {
    caregiverId = Number(data.caregiver_id);
    if (!Number.isInteger(caregiverId) || caregiverId <= 0) {
      throw new AppError('ADMIN phải cung cấp caregiver_id là ID trong caregiver_profiles.', 400);
    }
    const [profiles] = await db.execute('SELECT id FROM caregiver_profiles WHERE id = ?', [caregiverId]);
    if (!profiles.length) throw new AppError('Không tìm thấy hồ sơ người chăm sóc.', 404);
  } else {
    throw new AppError('Chỉ người chăm sóc hoặc ADMIN được tạo lịch.', 403);
  }

  await checkOverlap(caregiverId, data.work_date, data.start_time, data.end_time);

  const [result] = await db.execute(
    `INSERT INTO caregiver_schedules
      (caregiver_id, work_date, start_time, end_time, schedule_status, note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      caregiverId,
      data.work_date,
      data.start_time,
      data.end_time,
      data.schedule_status || 'AVAILABLE',
      data.note || null,
    ]
  );

  return getScheduleById(result.insertId);
}

async function updateSchedule(user, scheduleId, data) {
  const current = await getScheduleById(scheduleId);
  await ensureCanManageSchedule(user, current);

  const updated = {
    work_date: data.work_date ?? current.work_date,
    start_time: data.start_time ?? current.start_time,
    end_time: data.end_time ?? current.end_time,
    schedule_status: data.schedule_status ?? current.schedule_status,
    note: data.note === undefined ? current.note : data.note,
  };

  if (timeToSeconds(updated.end_time) <= timeToSeconds(updated.start_time)) {
    throw new AppError('end_time phải lớn hơn start_time trong cùng ngày.', 400);
  }

  await checkOverlap(
    current.caregiver_id,
    updated.work_date,
    updated.start_time,
    updated.end_time,
    scheduleId
  );

  await db.execute(
    `UPDATE caregiver_schedules
     SET work_date = ?, start_time = ?, end_time = ?,
         schedule_status = ?, note = ?
     WHERE id = ?`,
    [
      updated.work_date,
      updated.start_time,
      updated.end_time,
      updated.schedule_status,
      updated.note,
      scheduleId,
    ]
  );

  return getScheduleById(scheduleId);
}

async function deleteSchedule(user, scheduleId) {
  const current = await getScheduleById(scheduleId);
  await ensureCanManageSchedule(user, current);
  await db.execute('DELETE FROM caregiver_schedules WHERE id = ?', [scheduleId]);
}

module.exports = {
  listSchedules,
  getScheduleById,
  assertCanAccessSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};