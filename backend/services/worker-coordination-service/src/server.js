require('dotenv').config();

const app = require('./app');
const pool = require('./config/database');

const PORT = process.env.PORT || 3007;

async function startServer() {
    try {
        await pool.query('SELECT 1');
        console.log('Kết nối MySQL thành công!');

        app.listen(PORT, () => {
            console.log(
                `Worker Coordination Service: http://localhost:${PORT}`
            );
        });
    } catch (error) {
        console.error(
            'Không thể khởi động Worker Coordination Service:',
            error
        );
        process.exit(1);
    }
}

startServer();
