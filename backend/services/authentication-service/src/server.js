
require('dotenv').config();

const app = require('./app');
const db = require('./config/database');

const PORT = Number(process.env.PORT) || 3001;

async function startServer() {
    try {
        const connection = await db.getConnection();
        connection.release();

        app.listen(PORT, () => {
            console.log('================================');
            console.log('AUTHENTICATION SERVICE');
            console.log(`Server: http://localhost:${PORT}`);
            console.log(`Health: http://localhost:${PORT}/health`);
            console.log('Database: Connected');
            console.log('================================');
        });
    } catch (error) {
        console.error('Cannot start Authentication Service.');
        console.error(error.message);
        process.exit(1);
    }
}

startServer();
