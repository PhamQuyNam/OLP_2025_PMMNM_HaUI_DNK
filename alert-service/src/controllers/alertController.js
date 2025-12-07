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

// Hàm phụ trợ: Xóa cảnh báo trên Orion (Để bản đồ mất chấm đỏ)
const deleteFromOrion = async (stationName) => {
    const cleanName = stationName.replace(/[^a-zA-Z0-9]/g, '_');
    const entityId = `urn:ngsi-ld:DisasterWarning:${cleanName}`;
    const orionUrl = `${ORION_HOST}/ngsi-ld/v1/entities/${entityId}`;

    try {
        await axios.delete(orionUrl);
        console.log(`🗑️ Đã gỡ cảnh báo trên Orion cho trạm: ${stationName}`);
    } catch (e) {
        if (e.response && e.response.status !== 404) {
            console.error("❌ Lỗi xóa Orion:", e.message);
        }
    }
};

const pushToOrion = async (alertData) => {
    const orionUrl = `${ORION_HOST}/ngsi-ld/v1/entities`;
    const cleanName = alertData.station_name.replace(/[^a-zA-Z0-9]/g, '_');
    const entityId = `urn:ngsi-ld:DisasterWarning:${cleanName}`;

    const entity = {
        "id": entityId,
        "type": "DisasterWarning",
        "alertType": { "type": "Property", "value": alertData.station_name },
        "severity": { "type": "Property", "value": alertData.alert_level },
        "description": { "type": "Property", "value": alertData.description },
        "alertDate": { "type": "Property", "value": new Date().toISOString() },
        "impactedPoints": { "type": "Property", "value": alertData.impacted_points },
        "estimatedToa": { "type": "Property", "value": alertData.estimated_toa_hours },
        "rain24h": { "type": "Property", "value": alertData.rain_24h },
        "analysisData": { "type": "Property", "value": alertData.context_data },
        "@context": ["https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"]
    };

    try {
        await axios.post(orionUrl, entity, { headers: { 'Content-Type': 'application/ld+json' } });
        console.log("✅ Đã phát broadcast lên Orion");
    } catch (e) {
        if (e.response && (e.response.status === 422 || e.response.status === 409)) {
             try {
                await axios.delete(`${orionUrl}/${entityId}`);
                await axios.post(orionUrl, entity, { headers: { 'Content-Type': 'application/ld+json' } });
                console.log("♻️ Đã cập nhật broadcast trên Orion");
             } catch (delErr) { console.error("❌ Lỗi cập nhật Orion:", delErr.message); }
        } else {
            console.error("❌ Lỗi đẩy Orion:", e.message);
        }
    }
};

// --- API CONTROLLERS ---

// 1. NHẬN CẢNH BÁO TỪ PYTHON
const receiveAlert = async (req, res) => {
    const {
        station_name, risk_type, level, rain_value,
        description, impacted_points, estimated_toa_hours,
        rain_24h, flood_score, landslide_score, context_data
    } = req.body;

    const fullContextData = { ...context_data, flood_score, landslide_score };

    try {
        // TRƯỜNG HỢP 1: MỨC AN TOÀN (LOW) -> GỠ BỎ CẢNH BÁO
        if (level === 'LOW') {
            console.log(`✅ Trạm ${station_name} đã an toàn. Đang gỡ bỏ cảnh báo...`);
            await pool.query("DELETE FROM active_alerts WHERE station_name = $1", [station_name]);
            await pool.query("DELETE FROM alert_archive WHERE station_name = $1", [station_name]);
            await deleteFromOrion(station_name);
            return res.json({ message: "Đã gỡ bỏ cảnh báo (Trạng thái bình thường)." });
        }

        // 1. KIỂM TRA TRÙNG LẶP
        const checkDuplicateQuery = `
            SELECT id, alert_level, rain_value FROM active_alerts
            WHERE station_name = $1 AND risk_type = $2
            AND status IN ('PENDING', 'APPROVED')
            AND created_at >= NOW() - INTERVAL '1 HOURS'
        `;
        const existing = await pool.query(checkDuplicateQuery, [station_name, risk_type]);

        // 2. XỬ LÝ TRÙNG LẶP (CẬP NHẬT)
        if (existing.rows.length > 0) {
            const oldAlert = existing.rows[0];

            // A. Mức độ nguy hiểm TĂNG (VD: MEDIUM -> HIGH, HIGH -> CRITICAL)
            if (level !== oldAlert.alert_level) {
                const updateQuery = `
                    UPDATE active_alerts
                    SET alert_level = $1, rain_value = $2, description = $3,
                    estimated_toa_hours = $4, rain_24h = $5, context_data = $6,
                    created_at = NOW(), status = 'PENDING'
                    WHERE id = $7
                `;
                await pool.query(updateQuery, [
                    level, rain_value, description, estimated_toa_hours,
                    rain_24h, JSON.stringify(fullContextData), oldAlert.id
                ]);
                return res.json({ message: "Đã nâng cấp mức độ cảnh báo cũ (Level Up)." });
            }

            // B. Mức độ giữ nguyên -> Chỉ cập nhật số liệu
            const updateRainQuery = `
                UPDATE active_alerts
                SET rain_value = $1, estimated_toa_hours = $2, rain_24h = $3, context_data = $4
                WHERE id = $5
            `;
            await pool.query(updateRainQuery, [
                rain_value, estimated_toa_hours, rain_24h, JSON.stringify(fullContextData), oldAlert.id
            ]);
            return res.json({ message: "Cập nhật số liệu mới." });
        }

        // 3. TẠO CẢNH BÁO MỚI (Luôn là PENDING để Manager duyệt)
        const insertQuery = `
            INSERT INTO active_alerts
            (station_name, risk_type, alert_level, rain_value, description, impacted_points, estimated_toa_hours, status, rain_24h, context_data)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', $8, $9) RETURNING id;
        `;
        // Đã sửa lại đúng số lượng tham số ($1 -> $9)
        await pool.query(insertQuery, [
            station_name,
            risk_type,
            level,
            rain_value,
            description,
            JSON.stringify(impacted_points),
            estimated_toa_hours,
            rain_24h,
            JSON.stringify(fullContextData)
        ]);

        res.json({ message: "Đã tiếp nhận cảnh báo mới, chờ duyệt." });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Lỗi lưu DB: " + e.message });
    }
};

// 2. LẤY DANH SÁCH CẦN DUYỆT (Cho Manager)
const getPendingAlerts = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM active_alerts WHERE status = 'PENDING' ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 3. MANAGER DUYỆT (Approve)
const approveAlert = async (req, res) => {
    const { id } = req.params;
    const { managerName } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // B1: Lấy thông tin từ bảng NÓNG
        const resActive = await client.query("SELECT * FROM active_alerts WHERE id = $1", [id]);
        if (resActive.rows.length === 0) throw new Error("Cảnh báo không tồn tại");
        const alert = resActive.rows[0];

        // B2: Sao chép sang bảng LẠNH (Archive)
        // Đã bổ sung rain_24h và context_data vào câu lệnh INSERT
        const insertArchive = `
            INSERT INTO alert_archive
            (station_name, risk_type, alert_level, rain_value, description, impacted_points, estimated_toa_hours, approved_by, original_created_at, status, rain_24h, context_data)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'APPROVED', $10, $11)
        `;

        // Chú ý: alert.impacted_points và context_data lấy ra từ DB là Object,
        // nhưng khi INSERT lại vào JSONB cần stringify nếu dùng thư viện pg bản cũ,
        // bản mới thường tự hiểu. Để chắc ăn ta cứ stringify.
        await client.query(insertArchive, [
            alert.station_name, alert.risk_type, alert.alert_level, alert.rain_value,
            alert.description, JSON.stringify(alert.impacted_points), alert.estimated_toa_hours,
            managerName, alert.created_at,
            alert.rain_24h, JSON.stringify(alert.context_data)
        ]);

        // B3: Xóa khỏi bảng NÓNG
        await client.query("DELETE FROM active_alerts WHERE id = $1", [id]);

        // B4: Đẩy lên Orion
        await pushToOrion(alert);

        await client.query('COMMIT');
        res.json({ message: "Đã duyệt và lưu trữ thành công!" });

    } catch (e) {
        await client.query('ROLLBACK');
        console.error(e);
        res.status(500).json({ error: "Lỗi quy trình duyệt: " + e.message });
    } finally {
        client.release();
    }
};

// 4. API PUBLIC (Cho người dân)
const getPublicAlerts = async (req, res) => {
    try {
        const query = `
            SELECT * FROM alert_archive
            WHERE status = 'APPROVED'
            AND created_at >= NOW() - INTERVAL '24 HOURS'
            ORDER BY created_at DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Lỗi lấy danh sách cảnh báo public:", err.message);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

module.exports = { getPublicAlerts, receiveAlert, getPendingAlerts, approveAlert };