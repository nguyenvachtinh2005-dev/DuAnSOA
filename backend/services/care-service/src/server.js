
require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = Number(process.env.PORT) || 3004;

const startServer = async () => {
    try {
        await testConnection();

        const server = app.listen(PORT, () => {
            console.log('====================================');
            console.log('CARE SERVICE STARTED SUCCESSFULLY');
            console.log(`Server: http://localhost:${PORT}`);
            console.log(`Health: http://localhost:${PORT}/health`);
            console.log(`API: http://localhost:${PORT}/api/care`);
            console.log('====================================');
        });

        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`C???ng ${PORT} ??ang ???????c s??? d???ng.`);
            } else {
                console.error('L???i kh???i ?????ng server:', error.message);
            }

            process.exit(1);
        });

    } catch (error) {
        console.error('Kh??ng th??? kh???i ?????ng Care Service:', error.message);
        process.exit(1);
    }
};

startServer();
