require('dotenv').config();

const app = require('./app');
const db = require('./config/database');

const PORT = process.env.PORT || 3002;

async function startServer() {
    try {
        await db.query('SELECT 1');

        console.log('MySQL Account Service kết nối thành công!');

        app.listen(PORT, () => {
            console.log(`Account Service: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Không thể kết nối MySQL:', error.message);
        process.exit(1);
    }
}

startServer();