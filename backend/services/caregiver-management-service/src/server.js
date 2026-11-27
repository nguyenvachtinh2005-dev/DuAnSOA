require('dotenv').config();
const app = require('./app');
const db = require('./config/database');

const PORT = Number(process.env.PORT) || 3003;

const startServer = async () => {
  try {
    const connection = await db.getConnection();
    connection.release();
    console.log('Kết nối MySQL (soa_homecare_db) thành công');

    app.listen(PORT, () => {
      console.log(`Caregiver Management Service đang chạy tại cổng ${PORT}`);
    });
  } catch (err) {
    console.error('Không thể kết nối cơ sở dữ liệu:', err.message);
    process.exit(1);
  }
};

startServer();