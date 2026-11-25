const express = require('express');
const cors = require('cors');

const assignmentRoutes = require('./routes/assignmentRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Worker Coordination Service đang hoạt động!',
        service: 'worker-coordination-service',
        port: 3007
    });
});

app.use('/api/assignments', assignmentRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Không tìm thấy API được yêu cầu.'
    });
});

app.use(errorMiddleware);

module.exports = app;
