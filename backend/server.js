// SPDX-License-Identifier: Apache-2.0
/**
 * Copyright 2025 Haui.DNK
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

// Import logic tạo bảng
const createTables = require('./src/models/schema');

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const mapRoutes = require('./src/routes/mapRoutes');
const historyRoutes = require('./src/routes/historyRoutes');
const weatherRoutes = require('./src/routes/weatherRoutes');
const reportRoutes = require('./src/routes/reportRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Sử dụng Routes
app.use('/api/auth', authRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/reports', reportRoutes);

const PORT = 3000;
// --- KHỞI ĐỘNG SERVER ---
//Dùng hàm async để đợi tạo bảng xong mới chạy server
const startServer = async () => {

    // Tự động tạo bảng nếu chưa có
    await createTables();

    // Bắt đầu lắng nghe
    app.listen(PORT, () => {
        console.log(`Backend API structure v2 running on port ${PORT}`);
    });
};

startServer();