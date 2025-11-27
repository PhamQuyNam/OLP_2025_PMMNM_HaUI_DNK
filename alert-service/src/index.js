require('dotenv').config();
const express = require('express');
const cors = require('cors');
const alertRoutes = require('./routes/alertRoutes');
const { createAlertTables } = require('./models/schema'); // Nhớ import hàm tạo bảng

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/alerts', alertRoutes);

const PORT = process.env.PORT || 3005; // Chạy cổng 3005

const startServer = async () => {
    await createAlertTables(); // Tự tạo bảng active_alerts và alert_archive
    app.listen(PORT, () => {
        console.log(`🚨 Alert Service running on port ${PORT}`);
    });
};

startServer();