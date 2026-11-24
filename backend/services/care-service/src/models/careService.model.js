
const { pool } = require('../config/database');

const Category = {
    async findAll(activeOnly = false) {
        let sql = `
            SELECT id, name, description, is_active, created_at, updated_at
            FROM service_categories
        `;

        if (activeOnly) {
            sql += ' WHERE is_active = 1';
        }

        sql += ' ORDER BY id ASC';

        const [rows] = await pool.query(sql);
        return rows;
    },

    async findById(id) {
        const [rows] = await pool.query(
            'SELECT * FROM service_categories WHERE id = ?',
            [id]
        );

        return rows[0] || null;
    },

    async create(data) {
        const [result] = await pool.query(
            `INSERT INTO service_categories (name, description)
             VALUES (?, ?)`,
            [data.name, data.description || null]
        );

        return this.findById(result.insertId);
    },

    async update(id, data) {
        await pool.query(
            `UPDATE service_categories
             SET name = ?, description = ?
             WHERE id = ?`,
            [data.name, data.description || null, id]
        );

        return this.findById(id);
    },

    async updateStatus(id, isActive) {
        await pool.query(
            `UPDATE service_categories
             SET is_active = ?
             WHERE id = ?`,
            [isActive, id]
        );

        return this.findById(id);
    },

    async delete(id) {
        const [result] = await pool.query(
            'DELETE FROM service_categories WHERE id = ?',
            [id]
        );

        return result.affectedRows > 0;
    }
};

module.exports = Category;
