const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const caregiverRoutes = require('./routes/caregiverRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'caregiver-management-service', port: PORT });
});

app.use('/api/caregivers', caregiverRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Caregiver Management Service đang chạy tại cổng ${PORT}`);
});