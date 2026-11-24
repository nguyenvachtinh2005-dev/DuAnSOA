
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors({
    origin: [
        'http://localhost:5500',
        'http://127.0.0.1:5500'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Authentication Service is running.',
        service: 'authentication-service',
        port: Number(process.env.PORT) || 3001
    });
});

app.use('/api/auth', authRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint không tồn tại.'
    });
});

module.exports = app;
