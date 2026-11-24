const express = require('express');
const cors = require('cors');

const accountRoutes = require('./routes/accountRoutes');

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || '*'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kiểm tra trạng thái Account Service
app.get('/api/accounts/health', (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Account Service đang hoạt động!'
    });
});

// Account APIs
app.use('/api/accounts', accountRoutes);

// Xử lý API không tồn tại
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: 'API không tồn tại.'
    });
});

module.exports = app;