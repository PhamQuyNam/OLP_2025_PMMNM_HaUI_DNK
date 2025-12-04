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

// Xử lý tín hiệu SOS
const handleSOS = async (req, res) => {
    const { lat, lon, phone, message, userId } = req.body;

    if (!lat || !lon) {
        return res.status(400).json({ message: "Thiếu tọa độ GPS" });
    }

    try {
        // BƯỚC 1: Lưu tín hiệu SOS vào Database (Để Manager biết)
        const insertQuery = `
            INSERT INTO sos_signals (user_id, phone, message, geom, status)
            VALUES ($1, $2, $3, ST_SetSRID(ST_Point($4, $5), 4326), 'ACTIVE')
            RETURNING id;
        `;
        await pool.query(insertQuery, [userId || 'anonymous', phone, message, lon, lat]);

        // BƯỚC 2: Tìm các điểm an toàn trong bán kính 10km (10000m)
        // Sắp xếp theo khoảng cách gần nhất
        const findZoneQuery = `
            SELECT
                id, name, type,
                ST_Distance(
                    geom::geography,
                    ST_SetSRID(ST_Point($1, $2), 4326)::geography
                ) as distance_meters,
                ST_Y(geom) as lat,
                ST_X(geom) as lon
            FROM safe_zones
            WHERE ST_DWithin(
                geom,
                ST_SetSRID(ST_Point($1, $2), 4326),
                0.09 -- ~10km (1 độ = 111km)
            )
            ORDER BY geom <-> ST_SetSRID(ST_Point($1, $2), 4326);
        `;

        const safeZones = await pool.query(findZoneQuery, [lon, lat]);

        // BƯỚC 4: Trả kết quả ngay cho người dân
        res.json({
            message: "Tín hiệu SOS đã được gửi! Hãy di chuyển đến các điểm sau:",
            your_location: { lat, lon },
            nearest_safe_zones: safeZones.rows.map(z => ({
                name: z.name,
                type: z.type,
                distance: `${Math.round(z.distance_meters)}m`,
                lat: z.lat,
                lon: z.lon
            }))
        });

    } catch (err) {
        console.error("SOS Error:", err);
        res.status(500).json({ error: "Lỗi xử lý SOS" });
    }
};

// 2. [MỚI] Manager lấy danh sách SOS đang kích hoạt (Active)
const getActiveSOS = async (req, res) => {
    try {
        const query = `
            SELECT
                id,
                user_id,
                phone,
                message,
                status,
                created_at,
                ST_X(geom) as lon,
                ST_Y(geom) as lat
            FROM sos_signals
            WHERE status = 'ACTIVE' -- Chỉ lấy những người chưa được cứu
            ORDER BY created_at DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Lỗi lấy dữ liệu SOS" });
    }
};

// 3. [MỚI] Manager đánh dấu đã cứu hộ xong
const resolveSOS = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("UPDATE sos_signals SET status = 'RESCUED' WHERE id = $1", [id]);
        res.json({ message: "Đã xác nhận cứu hộ thành công!" });
    } catch (err) {
        res.status(500).json({ error: "Lỗi cập nhật trạng thái" });
    }
};

module.exports = { handleSOS, getActiveSOS, resolveSOS };