const db = require('../config/database');

class CaregiverServiceModel {
  static async findByCaregiverId(caregiverId) {
    const [rows] = await db.execute(
      'SELECT * FROM caregiver_services WHERE caregiver_id = ? ORDER BY created_at DESC',
      [caregiverId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM caregiver_services WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async findByCaregiverAndService(caregiverId, careServiceId) {
    const [rows] = await db.execute(
      `SELECT * FROM caregiver_services
       WHERE caregiver_id = ? AND care_service_id = ?`,
      [caregiverId, careServiceId]
    );
    return rows[0] || null;
  }

  static async create(data) {
    const {
      caregiver_id,
      care_service_id,
      custom_price = null,
    } = data;

    const [result] = await db.execute(
      `INSERT INTO caregiver_services (
        caregiver_id, care_service_id, custom_price
      ) VALUES (?, ?, ?)`,
      [caregiver_id, care_service_id, custom_price]
    );

    return this.findById(result.insertId);
  }

  static async updateCustomPrice(id, customPrice) {
    await db.execute(
      'UPDATE caregiver_services SET custom_price = ? WHERE id = ?',
      [customPrice, id]
    );
    return this.findById(id);
  }

  static async deleteById(id) {
    const [result] = await db.execute(
      'DELETE FROM caregiver_services WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = CaregiverServiceModel;