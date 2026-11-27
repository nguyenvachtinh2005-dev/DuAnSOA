
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function register({ email, password, role }) {
    const normalizedEmail = email.trim().toLowerCase();

    const [existingUsers] = await db.execute(
        'SELECT id FROM user_credentials WHERE email = ?',
        [normalizedEmail]
    );

    if (existingUsers.length > 0) {
        throw new Error('Email đã được sử dụng.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // CUSTOMER được kích hoạt ngay.
    // CAREGIVER chờ Admin duyệt hồ sơ.
    const accountStatus = role === 'CUSTOMER' ? 'ACTIVE' : 'PENDING';

    const [result] = await db.execute(
        `INSERT INTO user_credentials
        (email, password_hash, role, account_status, email_verified)
        VALUES (?, ?, ?, ?, ?)`,
        [normalizedEmail, passwordHash, role, accountStatus, false]
    );

    return {
        userId: result.insertId,
        email: normalizedEmail,
        role,
        accountStatus
    };
}

async function login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await db.execute(
        `SELECT id, email, password_hash, role,
                account_status, email_verified
         FROM user_credentials
         WHERE email = ?`,
        [normalizedEmail]
    );

    if (users.length === 0) {
        throw new Error('Email hoặc mật khẩu không chính xác.');
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!isPasswordValid) {
        throw new Error('Email hoặc mật khẩu không chính xác.');
    }

    if (user.account_status === 'LOCKED') {
        throw new Error('Tài khoản đã bị khóa.');
    }

    if (user.account_status === 'PENDING') {
        throw new Error('Tài khoản đang chờ được phê duyệt.');
    }

    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '1d'
        }
    );

    await db.execute(
        'UPDATE user_credentials SET last_login_at = NOW() WHERE id = ?',
        [user.id]
    );

    return {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            accountStatus: user.account_status,
            emailVerified: Boolean(user.email_verified)
        },
        token
    };
}

async function getCurrentUser(userId) {
    const [users] = await db.execute(
        `SELECT id, email, role, account_status, email_verified,
                created_at, last_login_at
         FROM user_credentials
         WHERE id = ?`,
        [userId]
    );

    if (users.length === 0) {
        throw new Error('Không tìm thấy tài khoản.');
    }

    const user = users[0];

    return {
        id: user.id,
        email: user.email,
        role: user.role,
        accountStatus: user.account_status,
        emailVerified: Boolean(user.email_verified),
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at
    };
}

module.exports = {
    register,
    login,
    getCurrentUser
};
