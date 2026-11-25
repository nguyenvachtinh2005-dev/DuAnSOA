const express = require('express');
const cors = require('cors');
const bookingRoutes = require('./routes/bookingRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'booking-service',
    port: Number(process.env.PORT) || 3006,
  });
});

app.use('/api/bookings', bookingRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
