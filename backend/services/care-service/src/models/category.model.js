
const { pool } = require('../config/database');

const CareService = {
    async findAll(activeOnly = false) {
        let sql = `
            SELECT
                cs.id,
                cs.category_id,
                sc.name AS category_name,
                cs.name,
                cs.description,
                cs.price_per_hour,
                cs.service_status,
                cs.created_at,
                cs.updated_at
            FROM care_services cs
            INNER JOIN service_categories sc
                ON cs.category_id = sc.id
        `;

        if (activeOnly) {
            sql += `
                WHERE cs.service_status = 'ACTIVE'
                AND sc.is_active = 1
            `;
        }

        sql += ' ORDER BY cs.id ASC';

        const [rows] = await pool.query(sql);
        return rows;
    },

    async findById(id) {
        const [rows] = await pool.query(
            `SELECT
                cs.id,
                cs.category_id,
                sc.name AS category_name,
                cs.name,
                cs.description,
                cs.price_per_hour,
                cs.service_status,
                cs.created_at,
                cs.updated_at
             FROM care_services cs
             INNER JOIN service_categories sc
                ON cs.category_id = sc.id
             WHERE cs.id = ?`,
            [id]
        );

        return rows[0] || null;
    },

    async findByCategory(categoryId, activeOnly = false) {
        let sql = `
            SELECT
                id, category_id, name, description,
                price_per_hour, service_status,
                created_at, updated_at
            FROM care_services
            WHERE category_id = ?
        `;

        if (activeOnly) {
            sql += " AND service_status = 'ACTIVE'";
        }

        sql += ' ORDER BY id ASC';

        const [rows] = await pool.query(sql, [categoryId]);
        return rows;
    },

    async create(data) {
        const [result] = await pool.query(
            `INSERT INTO care_services
                (category_id, name, description, price_per_hour)
             VALUES (?, ?, ?, ?)`,
            [
                data.category_id,
                data.name,
                data.description || null,
                data.price_per_hour
            ]
        );

        return this.findById(result.insertId);
    },

    async update(id, data) {
        await pool.query(
            `UPDATE care_services
             SET category_id = ?,
                 name = ?,
                 description = ?,
                 price_per_hour = ?
             WHERE id = ?`,
            [
                data.category_id,
                data.name,
                data.description || null,
                data.price_per_hour,
                id
            ]
        );

        return this.findById(id);
    },

    async updateStatus(id, status) {
        await pool.query(
            `UPDATE care_services
             SET service_status = ?
             WHERE id = ?`,
            [status, id]
        );

        return this.findById(id);
    },

    async delete(id) {
        const [result] = await pool.query(
            'DELETE FROM care_services WHERE id = ?',
            [id]
        );

        return result.affectedRows > 0;
    }
};

module.exports = CareService;
