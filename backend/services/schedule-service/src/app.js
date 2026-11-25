const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const scheduleRoutes = require('./routes/scheduleRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'schedule-service',
    port: Number(process.env.PORT) || 3005,
  });
});

app.use('/api/schedules', scheduleRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;