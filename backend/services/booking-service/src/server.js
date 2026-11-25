require('dotenv').config();

const app = require('./app');
const db = require('./config/database');

const PORT = Number(process.env.PORT) || 3006;

async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('Thiếu JWT_SECRET trong file .env');
    }

    const connection = await db.getConnection();
    await connection.ping();
    connection.release();

    console.log('Kết nối MySQL (soa_homecare_db) thành công.');

    app.listen(PORT, () => {
      console.log(`Booking Service đang chạy tại http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Không thể khởi động Booking Service:', error.message);
    process.exit(1);
  }
}

startServer();
