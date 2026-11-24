const db = require('../config/db');

class CaregiverDocumentModel {
  static async findByCaregiverId(caregiverId) {
    const [rows] = await db.execute(
      'SELECT * FROM caregiver_documents WHERE caregiver_id = ? ORDER BY uploaded_at DESC',
      [caregiverId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM caregiver_documents WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async create(data) {
    const {
      caregiver_id,
      document_type,
      document_name,
      document_url,
      verification_status = 'PENDING',
      rejection_reason = null,
      verified_at = null,
    } = data;

    const [result] = await db.execute(
      `INSERT INTO caregiver_documents (
        caregiver_id, document_type, document_name, document_url,
        verification_status, rejection_reason, verified_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        caregiver_id,
        document_type,
        document_name,
        document_url,
        verification_status,
        rejection_reason,
        verified_at,
      ]
    );

    return this.findById(result.insertId);
  }

  static async updateById(id, data) {
    const allowedFields = [
      'document_type',
      'document_name',
      'document_url',
      'verification_status',
      'rejection_reason',
      'verified_at',
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
      `UPDATE caregiver_documents SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  static async deleteById(id) {
    const [result] = await db.execute(
      'DELETE FROM caregiver_documents WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = CaregiverDocumentModel;