const db = require('../config/database');

function createError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

// Kiểm tra người dùng đã có hồ sơ hay chưa
async function ensureProfileExists(userId) {
    const [rows] = await db.execute(
        'SELECT user_id FROM user_profiles WHERE user_id = ?',
        [userId]
    );

    if (rows.length === 0) {
        throw createError(
            'Vui lòng cập nhật thông tin cá nhân trước.',
            400
        );
    }
}

// ==================== USER PROFILE ====================

async function getProfile(userId) {
    const [rows] = await db.execute(
        `SELECT user_id, full_name, phone, date_of_birth,
                gender, avatar_url, created_at, updated_at
         FROM user_profiles
         WHERE user_id = ?`,
        [userId]
    );

    return rows[0] || null;
}

async function updateProfile(userId, data) {
    const {
        full_name,
        phone = null,
        date_of_birth = null,
        gender = null,
        avatar_url = null
    } = data;

    if (!full_name || full_name.trim().length < 2) {
        throw createError('Họ và tên phải có ít nhất 2 ký tự.');
    }

    const validGenders = ['MALE', 'FEMALE', 'OTHER'];

    if (gender && !validGenders.includes(gender)) {
        throw createError('Giới tính không hợp lệ.');
    }

    try {
        await db.execute(
            `INSERT INTO user_profiles
                (user_id, full_name, phone, date_of_birth, gender, avatar_url)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                full_name = VALUES(full_name),
                phone = VALUES(phone),
                date_of_birth = VALUES(date_of_birth),
                gender = VALUES(gender),
                avatar_url = VALUES(avatar_url)`,
            [
                userId,
                full_name.trim(),
                phone,
                date_of_birth,
                gender,
                avatar_url
            ]
        );

        return await getProfile(userId);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw createError('Số điện thoại đã được sử dụng.', 409);
        }

        throw error;
    }
}

// ==================== CARE RECIPIENTS ====================

async function getRecipients(userId) {
    const [rows] = await db.execute(
        `SELECT id, customer_id, full_name, relationship,
                date_of_birth, gender, medical_notes,
                emergency_contact_name, emergency_contact_phone,
                created_at, updated_at
         FROM care_recipients
         WHERE customer_id = ?
         ORDER BY id DESC`,
        [userId]
    );

    return rows;
}

async function getRecipientById(userId, recipientId) {
    const [rows] = await db.execute(
        `SELECT *
         FROM care_recipients
         WHERE id = ? AND customer_id = ?`,
        [recipientId, userId]
    );

    if (rows.length === 0) {
        throw createError('Không tìm thấy người cần chăm sóc.', 404);
    }

    return rows[0];
}

async function createRecipient(userId, data) {
    await ensureProfileExists(userId);

    const {
        full_name,
        relationship = null,
        date_of_birth = null,
        gender = null,
        medical_notes = null,
        emergency_contact_name = null,
        emergency_contact_phone = null
    } = data;

    if (!full_name || full_name.trim().length < 2) {
        throw createError('Họ tên người cần chăm sóc không hợp lệ.');
    }

    const [result] = await db.execute(
        `INSERT INTO care_recipients
            (customer_id, full_name, relationship, date_of_birth,
             gender, medical_notes, emergency_contact_name,
             emergency_contact_phone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            userId,
            full_name.trim(),
            relationship,
            date_of_birth,
            gender,
            medical_notes,
            emergency_contact_name,
            emergency_contact_phone
        ]
    );

    return getRecipientById(userId, result.insertId);
}

async function updateRecipient(userId, recipientId, data) {
    const allowedFields = [
        'full_name',
        'relationship',
        'date_of_birth',
        'gender',
        'medical_notes',
        'emergency_contact_name',
        'emergency_contact_phone'
    ];

    const fields = [];
    const values = [];

    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(data, field)) {
            if (field === 'full_name' &&
                (!data[field] || data[field].trim().length < 2)) {
                throw createError('Họ tên không hợp lệ.');
            }

            fields.push(`${field} = ?`);
            values.push(
                field === 'full_name' ? data[field].trim() : data[field]
            );
        }
    }

    if (fields.length === 0) {
        throw createError('Không có thông tin cần cập nhật.');
    }

    values.push(recipientId, userId);

    const [result] = await db.execute(
        `UPDATE care_recipients
         SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND customer_id = ?`,
        values
    );

    if (result.affectedRows === 0) {
        throw createError('Không tìm thấy người cần chăm sóc.', 404);
    }

    return getRecipientById(userId, recipientId);
}

async function deleteRecipient(userId, recipientId) {
    const [result] = await db.execute(
        `DELETE FROM care_recipients
         WHERE id = ? AND customer_id = ?`,
        [recipientId, userId]
    );

    if (result.affectedRows === 0) {
        throw createError('Không tìm thấy người cần chăm sóc.', 404);
    }

    return true;
}

// ==================== USER ADDRESSES ====================

async function getAddresses(userId, role, recipientId = null) {
    let sql = `
        SELECT id, user_id, recipient_id, address_name,
               detail_address, ward, district, province,
               latitude, longitude, is_default,
               created_at, updated_at
        FROM user_addresses
        WHERE user_id = ?
    `;

    const params = [userId];

    if (role === 'CAREGIVER') {
        sql += ' AND recipient_id IS NULL';
    } else if (recipientId) {
        sql += ' AND recipient_id = ?';
        params.push(recipientId);
    }

    sql += ' ORDER BY is_default DESC, id DESC';

    const [rows] = await db.execute(sql, params);
    return rows;
}

async function validateRecipient(connection, userId, role, recipientId) {
    if (role === 'CAREGIVER' && recipientId) {
        throw createError(
            'Người chăm sóc không được gắn địa chỉ với người nhận chăm sóc.'
        );
    }

    if (recipientId) {
        const [rows] = await connection.execute(
            `SELECT id FROM care_recipients
             WHERE id = ? AND customer_id = ?`,
            [recipientId, userId]
        );

        if (rows.length === 0) {
            throw createError('Người cần chăm sóc không hợp lệ.', 404);
        }
    }
}

async function createAddress(userId, role, data) {
    await ensureProfileExists(userId);

    const {
        recipient_id = null,
        address_name = null,
        detail_address,
        ward = null,
        district = null,
        province,
        latitude = null,
        longitude = null,
        is_default = false
    } = data;

    if (!detail_address || !province) {
        throw createError('Địa chỉ chi tiết và tỉnh/thành phố là bắt buộc.');
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        await validateRecipient(
            connection,
            userId,
            role,
            recipient_id
        );

        if (is_default) {
            await connection.execute(
                `UPDATE user_addresses
                 SET is_default = 0
                 WHERE user_id = ?`,
                [userId]
            );
        }

        const [result] = await connection.execute(
            `INSERT INTO user_addresses
                (user_id, recipient_id, address_name, detail_address,
                 ward, district, province, latitude, longitude, is_default)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                recipient_id,
                address_name,
                detail_address,
                ward,
                district,
                province,
                latitude,
                longitude,
                is_default ? 1 : 0
            ]
        );

        await connection.commit();

        const [rows] = await db.execute(
            'SELECT * FROM user_addresses WHERE id = ? AND user_id = ?',
            [result.insertId, userId]
        );

        return rows[0];
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function updateAddress(userId, role, addressId, data) {
    const allowedFields = [
        'recipient_id',
        'address_name',
        'detail_address',
        'ward',
        'district',
        'province',
        'latitude',
        'longitude',
        'is_default'
    ];

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [existingRows] = await connection.execute(
            `SELECT * FROM user_addresses
             WHERE id = ? AND user_id = ?
             FOR UPDATE`,
            [addressId, userId]
        );

        if (existingRows.length === 0) {
            throw createError('Không tìm thấy địa chỉ.', 404);
        }

        const existing = existingRows[0];
        const recipientId = Object.prototype.hasOwnProperty.call(
            data,
            'recipient_id'
        ) ? data.recipient_id : existing.recipient_id;

        await validateRecipient(
            connection,
            userId,
            role,
            recipientId
        );

        const fields = [];
        const values = [];

        for (const field of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(data, field)) {
                fields.push(`${field} = ?`);

                if (field === 'is_default') {
                    values.push(data[field] ? 1 : 0);
                } else {
                    values.push(data[field]);
                }
            }
        }

        if (fields.length === 0) {
            throw createError('Không có thông tin cần cập nhật.');
        }

        if (data.is_default === true || data.is_default === 1) {
            await connection.execute(
                `UPDATE user_addresses
                 SET is_default = 0
                 WHERE user_id = ? AND id <> ?`,
                [userId, addressId]
            );
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(addressId, userId);

        await connection.execute(
            `UPDATE user_addresses
             SET ${fields.join(', ')}
             WHERE id = ? AND user_id = ?`,
            values
        );

        await connection.commit();

        const [rows] = await db.execute(
            'SELECT * FROM user_addresses WHERE id = ? AND user_id = ?',
            [addressId, userId]
        );

        return rows[0];
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function deleteAddress(userId, addressId) {
    const [result] = await db.execute(
        `DELETE FROM user_addresses
         WHERE id = ? AND user_id = ?`,
        [addressId, userId]
    );

    if (result.affectedRows === 0) {
        throw createError('Không tìm thấy địa chỉ.', 404);
    }

    return true;
}

module.exports = {
    getProfile,
    updateProfile,
    getRecipients,
    getRecipientById,
    createRecipient,
    updateRecipient,
    deleteRecipient,
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress
};