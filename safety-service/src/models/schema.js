/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
const pool = require("../config/db");

const createSafetyTables = async () => {
  try {
    await pool.query("CREATE EXTENSION IF NOT EXISTS postgis;");

    // 1. Bảng Điểm Cứu Trợ An Toàn (Static)
    await pool.query(`
            CREATE TABLE IF NOT EXISTS safe_zones (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                type VARCHAR(50), -- HOSPITAL, POLICE, SHELTER, HIGH_GROUND
                geom GEOMETRY(Point, 4326)
            );
        `);

    // 2. Bảng Tín hiệu SOS (Dynamic)
    await pool.query(`
            CREATE TABLE IF NOT EXISTS sos_signals (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(50),
                phone VARCHAR(20),
                message TEXT,
                status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, RESCUED
                geom GEOMETRY(Point, 4326),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

    console.log("✅ Safety Service: Tables ready.");
  } catch (err) {
    console.error("❌ Error creating safety tables:", err.message);
  }
};

module.exports = { createSafetyTables };
