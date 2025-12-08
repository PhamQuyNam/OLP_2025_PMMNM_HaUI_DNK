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
const { createAlertTables } = require('./models/schema');
const swaggerSpecs = require('./config/swagger');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Chấp nhận mọi Frontend (Trong thực tế nên điền domain cụ thể)
        methods: ["GET", "POST", "PATCH", "DELETE"]
    }
});

io.on('connection', (socket) => {
    console.log(`⚡ Client connected to Socket: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use('/', alertRoutes);

app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpecs);
});

const PORT = process.env.PORT || 3005; // Chạy cổng 3005

const startServer = async () => {
    await createAlertTables(); // Tự tạo bảng active_alerts và alert_archive
    httpServer.listen(PORT, () => {
        console.log(`🚨 Alert Service (HTTP + Socket.IO) running on port ${PORT}`);
    });
};

startServer();