require('dotenv').config();
const app = require('./app');
const db = require('./config/database');

const PORT = Number(process.env.PORT) || 3005;

async function startServer() {
  try {
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();

    console.log('Kết nối MySQL (soa_homecare_db) thành công.');
    app.listen(PORT, () => {
      console.log(`Schedule Service đang chạy tại http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Không thể khởi động Schedule Service:', error.message);
    process.exit(1);
  }
}

startServer();