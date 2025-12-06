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
const axios = require('axios');
ORION_HOST = process.env.ORION_HOST || 'http://orion:1026'

const receiveAlert = async (req, res) => {
    // 1. 🟢 BỔ SUNG estimated_toa_hours VÀO PHẦN NHẬN DỮ LIỆU TỪ PYTHON
    const { 
        station_name, 
        risk_type, 
        level, 
        rain_value, 
        description, 
        impacted_points, 
        estimated_toa_hours // 👈 ĐÃ THÊM
    } = req.body;

    try {
        // 1. KIỂM TRA TRÙNG LẶP (De-duplication Logic)
        const checkDuplicateQuery = `
            SELECT id, alert_level, rain_value FROM active_alerts
            WHERE station_name = $1
            AND risk_type = $2
            AND status IN ('PENDING', 'APPROVED')
            AND created_at >= NOW() - INTERVAL '1 HOURS'
        `;
        const existing = await pool.query(checkDuplicateQuery, [station_name, risk_type]);

        // 2. XỬ LÝ LOGIC TRÙNG LẶP
        if (existing.rows.length > 0) {
            const oldAlert = existing.rows[0];

            // TRƯỜNG HỢP A: Mức độ nguy hiểm TĂNG LÊN
            if (level === 'CRITICAL' && oldAlert.alert_level !== 'CRITICAL') {
                const updateQuery = `
                    UPDATE active_alerts
                    SET alert_level = $1, rain_value = $2, description = $3, 
                    estimated_toa_hours = $4, created_at = NOW(), status = 'PENDING' 
                    WHERE id = $5
                `;
                // ⚠️ CHÚ Ý: Các tham số đã được sắp xếp lại
                await pool.query(updateQuery, [
                    level, 
                    rain_value, 
                    description, 
                    estimated_toa_hours, 
                    oldAlert.id          
                ]);
                return res.json({ message: "Đã nâng cấp mức độ cảnh báo cũ (Level Up)." });
            }

            // TRƯỜNG HỢP B: BỎ QUA (Chỉ cập nhật lượng mưa/TOA mới nhất)
            const updateRainQuery = `
                UPDATE active_alerts 
                SET rain_value = $1, estimated_toa_hours = $2 
                WHERE id = $3
            `;
            await pool.query(updateRainQuery, [rain_value, estimated_toa_hours, oldAlert.id]); // 👈 THÊM estimated_toa_hours

            return res.json({ message: "Cảnh báo trùng lặp. Đã cập nhật số liệu mới, không tạo alert mới." });
        }

        // 3. NẾU KHÔNG TRÙNG -> TẠO MỚI NHƯ BÌNH THƯỜNG
        const insertQuery = `
            INSERT INTO active_alerts 
            (station_name, risk_type, alert_level, rain_value, description, impacted_points, estimated_toa_hours) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id; 
        `;
        await pool.query(insertQuery, [
            station_name, 
            risk_type, 
            level, 
            rain_value, 
            description, 
            JSON.stringify(impacted_points),
            estimated_toa_hours // 👈 THAM SỐ $7
        ]);

        res.json({ message: "Đã tiếp nhận cảnh báo mới, chờ duyệt." });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Lỗi lưu DB" });
    }
};

// 2. Lấy danh sách cần duyệt (Cho Manager)
const getPendingAlerts = async (req, res) => {
    const result = await pool.query("SELECT * FROM active_alerts WHERE status = 'PENDING' ORDER BY created_at DESC");
    res.json(result.rows);
};

// 3. Manager Duyệt (Hành động quan trọng)
const approveAlert = async (req, res) => {
    const { id } = req.params;
    const { managerName } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Bắt đầu giao dịch (Transaction)

        // B1: Lấy thông tin từ bảng NÓNG
        const resActive = await client.query("SELECT * FROM active_alerts WHERE id = $1", [id]);
        if (resActive.rows.length === 0) throw new Error("Cảnh báo không tồn tại");
        const alert = resActive.rows[0];

        // B2: Sao chép sang bảng LẠNH (Lưu trữ muôn đời)
        const insertArchive = `
            INSERT INTO alert_archive
            (station_name, risk_type, alert_level, rain_value, description, impacted_points, approved_by, original_created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        await client.query(insertArchive, [
            alert.station_name, alert.risk_type, alert.alert_level, alert.rain_value,
            alert.description, alert.impacted_points, managerName, alert.created_at
        ]);

        // B3: Xóa khỏi bảng NÓNG (Để danh sách pending sạch sẽ)
        await client.query("DELETE FROM active_alerts WHERE id = $1", [id]);

        // B4: Đẩy lên Orion (Để dân thấy trên bản đồ)
        await pushToOrion(alert);

        await client.query('COMMIT'); // Chốt đơn
        res.json({ message: "Đã duyệt và lưu trữ thành công!" });

    } catch (e) {
        await client.query('ROLLBACK'); // Nếu lỗi thì hoàn tác tất cả
        console.error(e);
        res.status(500).json({ error: "Lỗi quy trình duyệt" });
    } finally {
        client.release();
    }
};

// 1. API cho NGƯỜI DÂN (Chỉ xem cái đã duyệt)
const getPublicAlerts = async (req, res) => {
    try {
        const query = `
            SELECT * FROM alert_archive
            WHERE status = 'APPROVED' -- <--- CHỈ LẤY CÁI ĐÃ DUYỆT
            AND created_at >= NOW() - INTERVAL '24 HOURS'
            ORDER BY created_at DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};

const pushToOrion = async (alert) => {
    const orionUrl = `${process.env.ORION_HOST}/ngsi-ld/v1/entities`;

    const cleanStationName = alertData.station_name.replace(/[^a-zA-Z0-9]/g, '_');
    const entityId = `urn:ngsi-ld:DisasterWarning:${cleanStationName}`;

    const entity = {
        "id": entityId,
        "type": "DisasterWarning",
        "alertType": { "type": "Property", "value": alertData.station_name }, // Hoặc lấy title từ description
        "severity": { "type": "Property", "value": alertData.alert_level },
        "description": { "type": "Property", "value": alertData.description },
        "alertDate": { "type": "Property", "value": new Date().toISOString() },
        "impactedPoints": {
            "type": "Property",
            "value": alertData.impacted_points // PostGIS driver tự parse JSONB thành object rồi
        },
        "@context": ["https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"]
    };

    try {
        await axios.post(orionUrl, entity, {
            headers: { 'Content-Type': 'application/ld+json' }
        });
        console.log("✅ Đã phát broadcast lên Orion");
    } catch (e) {
        if (e.response && (e.response.status === 422 || e.response.status === 409)) {
             try {
                await axios.delete(`${orionUrl}/${entityId}`);
                await axios.post(orionUrl, entity, { headers: { 'Content-Type': 'application/ld+json' } });
                console.log("♻️ Đã cập nhật broadcast trên Orion");
             } catch (delErr) {
                 console.error("❌ Lỗi cập nhật Orion:", delErr.message);
             }
        } else {
            console.error("❌ Lỗi đẩy Orion:", e.message);
        }
    }
};

module.exports = { getPublicAlerts, receiveAlert, getPendingAlerts, approveAlert };