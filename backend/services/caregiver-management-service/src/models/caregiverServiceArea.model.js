const db = require('../config/database');

class CaregiverServiceAreaModel {
  static async findByCaregiverId(caregiverId) {
    const [rows] = await db.execute(
      'SELECT * FROM caregiver_service_areas WHERE caregiver_id = ? ORDER BY created_at DESC',
      [caregiverId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM caregiver_service_areas WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async findByArea({ province, district = null }) {
    if (district === null) {
      const [rows] = await db.execute(
        `SELECT * FROM caregiver_service_areas
         WHERE province = ? AND district IS NULL`,
        [province]
      );
      return rows;
    }

    const [rows] = await db.execute(
      `SELECT * FROM caregiver_service_areas
       WHERE province = ? AND district = ?`,
      [province, district]
    );
    return rows;
  }

  static async create(data) {
    const {
      caregiver_id,
      province,
      district = null,
    } = data;

    const [result] = await db.execute(
      `INSERT INTO caregiver_service_areas (
        caregiver_id, province, district
      ) VALUES (?, ?, ?)`,
      [caregiver_id, province, district]
    );

    return this.findById(result.insertId);
  }

  static async deleteById(id) {
    const [result] = await db.execute(
      'DELETE FROM caregiver_service_areas WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = CaregiverServiceAreaModel;