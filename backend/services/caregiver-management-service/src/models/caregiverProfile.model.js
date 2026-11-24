const db = require('../config/database');

class CaregiverProfileModel {
  static async findAll({ verificationStatus } = {}) {
    let sql = 'SELECT * FROM caregiver_profiles';
    const params = [];

    if (verificationStatus) {
      sql += ' WHERE verification_status = ?';
      params.push(verificationStatus);
    }

    sql += ' ORDER BY created_at DESC';
    const [rows] = await db.execute(sql, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM caregiver_profiles WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async findByUserId(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM caregiver_profiles WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  }

  static async create(data) {
    const {
      user_id,
      introduction = null,
      qualification = null,
      experience_years = 0,
      license_number = null,
      verification_status = 'PENDING',
      rejection_reason = null,
      approved_by = null,
      approved_at = null,
    } = data;

    const [result] = await db.execute(
      `INSERT INTO caregiver_profiles (
        user_id, introduction, qualification, experience_years,
        license_number, verification_status, rejection_reason,
        approved_by, approved_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        introduction,
        qualification,
        experience_years,
        license_number,
        verification_status,
        rejection_reason,
        approved_by,
        approved_at,
      ]
    );

    return this.findById(result.insertId);
  }

  static async updateById(id, data) {
    const allowedFields = [
      'introduction',
      'qualification',
      'experience_years',
      'license_number',
      'verification_status',
      'rejection_reason',
      'approved_by',
      'approved_at',
    ];

    const updates = [];
    const params = [];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        updates.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    await db.execute(
      `UPDATE caregiver_profiles SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  static async deleteById(id) {
    const [result] = await db.execute(
      'DELETE FROM caregiver_profiles WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = CaregiverProfileModel;