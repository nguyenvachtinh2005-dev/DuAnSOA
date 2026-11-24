
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const careRoutes = require('./routes/careRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://127.0.0.1:5500',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ki???m tra t??nh tr???ng service
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Care Service ??ang ho???t ?????ng!',
        service: 'care-service',
        port: process.env.PORT || 3004
    });
});

// API qu???n l?? d???ch v??? ch??m s??c
app.use('/api/care', careRoutes);

// API kh??ng t???n t???i
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Kh??ng t??m th???y API y??u c???u.'
    });
});

// X??? l?? l???i
app.use(errorMiddleware);

module.exports = app;
