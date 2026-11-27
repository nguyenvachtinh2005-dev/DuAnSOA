const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const caregiverRoutes = require('./routes/caregiverRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'caregiver-management-service',
    port: Number(process.env.PORT) || 3003,
  });
});

app.use('/api/caregivers', caregiverRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;