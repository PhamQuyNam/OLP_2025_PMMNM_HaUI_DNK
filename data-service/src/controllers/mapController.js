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

// Lấy các vùng đa giác (Polygons) - Tô màu huyện/xã
const getRiskZones = async (req, res) => {
    try {
        const query = `
            SELECT jsonb_build_object(
                'type', 'FeatureCollection',
                'features', jsonb_agg(ST_AsGeoJSON(t.*)::jsonb)
            )
            FROM (SELECT id, name, risk_level, risk_type, geom FROM risk_zones) AS t;
        `;
        const result = await pool.query(query);
        res.json(result.rows[0].jsonb_build_object);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy các điểm xung yếu (Points) - Vẽ các icon nhỏ
const getVulnerablePoints = async (req, res) => {
    try {
        // Lấy thêm tham số type nếu muốn lọc (ví dụ chỉ lấy SCHOOL)
        const { type } = req.query;

        let queryText = `
            SELECT jsonb_build_object(
                'type', 'FeatureCollection',
                'features', jsonb_agg(ST_AsGeoJSON(t.*)::jsonb)
            )
            FROM (SELECT id, name, type, risk_type, geom FROM vulnerable_points
        `;

        if (type) {
            queryText += ` WHERE type = '${type}'`;
        }

        queryText += `) AS t;`;

        const result = await pool.query(queryText);
        res.json(result.rows[0].jsonb_build_object);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getRiskZones, getVulnerablePoints };