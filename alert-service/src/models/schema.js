/**
 * Copyright 2025 Haui.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
const pool = require('../config/db');

const createAlertTables = async () => {
    // 1. Bảng NÓNG: Chỉ chứa việc cần làm ngay
    await pool.query(`
        CREATE TABLE IF NOT EXISTS active_alerts (
            id SERIAL PRIMARY KEY,
            station_name VARCHAR(100),
            risk_type VARCHAR(50),
            alert_level VARCHAR(20),
            rain_value FLOAT,
            description TEXT,
            impacted_points JSONB,
            status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, REJECTED
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 2. Bảng LẠNH: Kho lưu trữ vĩnh viễn
    await pool.query(`
        CREATE TABLE IF NOT EXISTS alert_archive (
            id SERIAL PRIMARY KEY,
            station_name VARCHAR(100),
            risk_type VARCHAR(50),
            alert_level VARCHAR(20),
            rain_value FLOAT,
            description TEXT,
            impacted_points JSONB,
            status VARCHAR(20) DEFAULT 'APPROVED',
            approved_by VARCHAR(50), -- Ai là người chịu trách nhiệm vụ này?
            archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời điểm lưu kho
            original_created_at TIMESTAMP -- Thời điểm xảy ra sự cố thực tế
        );
    `);

    console.log("✅ Alert Service: Tables created (Active & Archive).");
};

module.exports = { createAlertTables };