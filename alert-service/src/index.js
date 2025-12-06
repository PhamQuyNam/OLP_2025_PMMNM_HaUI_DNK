/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const alertRoutes = require('./routes/alertRoutes');
const { createAlertTables } = require('./models/schema'); // Nhớ import hàm tạo bảng
const swaggerSpecs = require('./config/swagger');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/alerts', alertRoutes);

app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpecs);
});



const PORT = process.env.PORT || 3005; // Chạy cổng 3005

const startServer = async () => {
    await createAlertTables(); // Tự tạo bảng active_alerts và alert_archive
    app.listen(PORT, () => {
        console.log(`🚨 Alert Service running on port ${PORT}`);
    });
};

startServer();