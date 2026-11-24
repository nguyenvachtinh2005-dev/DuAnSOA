
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+07:00'
});

// Ki???m tra k???t n???i MySQL
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();

        console.log('Care Service: K???t n???i MySQL th??nh c??ng!');

        connection.release();
    } catch (error) {
        console.error('Care Service: K???t n???i MySQL th???t b???i:', error.message);
        throw error;
    }
};

module.exports = {
    pool,
    testConnection
};
