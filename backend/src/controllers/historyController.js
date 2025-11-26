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
const pool = require('../config/db');

// 1. Lấy danh sách lịch sử chi tiết
// Dùng cho: Bảng hiển thị lịch sử, Click vào xem chi tiết điểm
const getHistory = async (req, res) => {
    try {
        // Lấy 100 bản ghi mới nhất
        // PostGIS driver (pg) sẽ tự động parse cột JSONB 'impacted_points' thành Mảng JSON
        const query = `
            SELECT
                id,
                station_name,
                risk_type,
                alert_level,
                rain_value,
                description,
                impacted_points,
                created_at
            FROM alert_history
            ORDER BY created_at DESC
            LIMIT 100
        `;

        const result = await pool.query(query);

        // Trả về danh sách
        res.json(result.rows);

    } catch (err) {
        console.error("Lỗi lấy lịch sử:", err.message);
        res.status(500).json({ error: "Lỗi Server khi lấy dữ liệu lịch sử" });
    }
};

// 2. Lấy dữ liệu thống kê
// Dùng cho: Vẽ biểu đồ Dashboard (Pie Chart, Bar Chart)
const getStats = async (req, res) => {
    try {
        // Thống kê 1: Số lượng cảnh báo theo Loại rủi ro (Sạt lở vs Ngập lụt)
        // Dùng để vẽ Pie Chart
        const riskQuery = `
            SELECT risk_type, COUNT(*) as count
            FROM alert_history
            GROUP BY risk_type
        `;

        // Thống kê 2: Số lượng cảnh báo theo Mức độ (Medium, High, Critical)
        // Dùng để vẽ Bar Chart
        const levelQuery = `
            SELECT alert_level, COUNT(*) as count
            FROM alert_history
            GROUP BY alert_level
        `;

        // Chạy song song 2 query cho nhanh
        const [riskRes, levelRes] = await Promise.all([
            pool.query(riskQuery),
            pool.query(levelQuery)
        ]);

        res.json({
            by_risk_type: riskRes.rows,   // Ví dụ: [{risk_type: 'LANDSLIDE', count: 10}, ...]
            by_alert_level: levelRes.rows // Ví dụ: [{alert_level: 'CRITICAL', count: 2}, ...]
        });

    } catch (err) {
        console.error("Lỗi lấy thống kê:", err.message);
        res.status(500).json({ error: "Lỗi Server khi tính toán thống kê" });
    }
};

module.exports = { getHistory, getStats };