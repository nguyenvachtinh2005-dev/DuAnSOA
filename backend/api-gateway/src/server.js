require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const loggerMiddleware = require('./middlewares/loggerMiddleware');
const authMiddleware = require('./middlewares/authMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// 1. Log mọi request đi vào Gateway
app.use(loggerMiddleware);

// 2. Endpoint kiểm tra trạng thái Gateway (công khai)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        gateway: 'api-gateway',
        targets: {
            auth: process.env.AUTH_SERVICE_URL,
            account: process.env.ACCOUNT_SERVICE_URL,
            caregiver: process.env.CAREGIVER_SERVICE_URL
        }
    });
});

// 3. Kiểm tra JWT cho các route được bảo vệ (trước khi proxy sang service)
app.use(authMiddleware);

// 4. Định tuyến tới từng microservice
const createServiceProxy = (pathPrefix, target, serviceName) =>
    createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: (path) =>
            path.startsWith(pathPrefix) ? path : `${pathPrefix}${path}`,
        on: {
            error: (err, req, res) => {
                console.error(
                    `[API Gateway] Lỗi kết nối tới ${serviceName} (${target}):`,
                    err.message
                );
                if (!res.headersSent) {
                    res.status(502).json({
                        success: false,
                        message: `Không thể kết nối tới ${serviceName}.`
                    });
                }
            }
        }
    });

app.use(
    '/api/auth',
    createServiceProxy('/api/auth', process.env.AUTH_SERVICE_URL, 'authentication-service')
);
app.use(
    '/api/accounts',
    createServiceProxy('/api/accounts', process.env.ACCOUNT_SERVICE_URL, 'account-service')
);
app.use(
    '/api/caregivers',
    createServiceProxy(
        '/api/caregivers',
        process.env.CAREGIVER_SERVICE_URL,
        'caregiver-management-service'
    )
);

// 5. Xử lý route không tồn tại
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route không tồn tại trên API Gateway.'
    });
});

// 6. Middleware xử lý lỗi tập trung (luôn đặt ở cuối cùng)
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`API Gateway đang chạy tại http://localhost:${PORT}`);
});