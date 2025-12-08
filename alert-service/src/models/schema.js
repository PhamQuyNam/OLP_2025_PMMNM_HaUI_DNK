/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
const pool = require('../config/db');

const createAlertTables = async () => {
    try {
        // 1. Bảng NÓNG: active_alerts
        await pool.query(`
            CREATE TABLE IF NOT EXISTS active_alerts (
                id SERIAL PRIMARY KEY,
                station_name VARCHAR(100),
                risk_type VARCHAR(50),
                alert_level VARCHAR(20),
                rain_value FLOAT,           -- Mưa 1h hiện tại
                rain_24h FLOAT DEFAULT 0,   -- <--- MỚI: Mưa tích lũy 24h
                description TEXT,
                estimated_toa_hours FLOAT,

                context_data JSONB DEFAULT '{}', -- <--- MỚI: Chứa slope, twi, scores...

                status VARCHAR(20) DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Bảng LẠNH: alert_archive
        await pool.query(`
            CREATE TABLE IF NOT EXISTS alert_archive (
                id SERIAL PRIMARY KEY,
                station_name VARCHAR(100),
                risk_type VARCHAR(50),
                alert_level VARCHAR(20),
                rain_value FLOAT,
                rain_24h FLOAT DEFAULT 0,   -- <--- MỚI
                description TEXT,
                estimated_toa_hours FLOAT,

                context_data JSONB DEFAULT '{}', -- <--- MỚI

                status VARCHAR(20) DEFAULT 'APPROVED',
                approved_by VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                original_created_at TIMESTAMP
            );
        `);

        console.log("✅ Alert Service: Tables created with FULL columns.");

    } catch (err) {
        console.error("❌ Error creating tables:", err.message);
    }
};

module.exports = { createAlertTables };