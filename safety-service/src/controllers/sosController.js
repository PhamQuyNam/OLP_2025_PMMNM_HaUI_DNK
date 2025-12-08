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
const { sendEmailOTP } = require("../controllers/email");

// Hàm phụ trợ: Lấy email từ ID (Vì token có thể không chứa email)
const getUserEmail = async (userId) => {
    // Vì safety-service dùng chung DB với Auth, ta có thể query bảng users
    const res = await pool.query("SELECT email FROM users WHERE id = $1", [userId]);
    return res.rows[0]?.email;
};

const requestSOS = async (req, res) => {
    const userId = req.user.id;

    try {
        // Tự động lấy email từ DB
        const email = await getUserEmail(userId);

        if (!email) return res.status(404).json({ message: "Không tìm thấy email người dùng" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Xóa OTP cũ
        await pool.query("DELETE FROM otp_codes WHERE email = $1", [email]);

        // Lưu OTP 2 phút
        await pool.query(`
            INSERT INTO otp_codes (email, otp, expires_at)
            VALUES ($1, $2, NOW() + INTERVAL '2 minutes')
        `, [email, otp]);

        // Gửi email
        try {
            await sendEmailOTP(email, otp);
        } catch (mailErr) {
            console.log("Email error:", mailErr);
        }

        // Trả về email (đã che bớt) để người dùng biết kiểm tra hòm thư nào
        const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, "$1***$3");
        res.json({ message: `OTP đã gửi đến ${maskedEmail}`, otp_sent: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi tạo OTP" });
    }
};

// Xử lý tín hiệu SOS
const handleSOS = async (req, res) => {
    const userId = req.user.id; // Lấy ID từ Token
    const { lat, lon, phone, message, otp } = req.body;

    if (!lat || !lon) {
        return res.status(400).json({ message: "Thiếu tọa độ GPS" });
    }

    try {
        const email = await getUserEmail(userId);
        if (!email) return res.status(404).json({ message: "Tài khoản lỗi" });
         // Kiểm tra OTP
        const check = await pool.query(`
            SELECT * FROM otp_codes
            WHERE email = $1 AND otp = $2 AND expires_at > NOW()
            LIMIT 1
        `, [email, otp]);

        if (check.rows.length === 0) {
            return res.status(400).json({ message: "OTP sai hoặc đã hết hạn" });
        }

        // Xóa OTP sau xác thực
        await pool.query(`DELETE FROM otp_codes WHERE email = $1`, [email]);

        // BƯỚC 1: Lưu tín hiệu SOS vào Database (Để Manager biết)
        const insertQuery = `
            INSERT INTO sos_signals (user_id, phone, message, geom, status)
            VALUES ($1, $2, $3, ST_SetSRID(ST_Point($4, $5), 4326), 'ACTIVE')
            RETURNING id;
        `;
        await pool.query(insertQuery, [userId, phone, message, lon, lat]);

        // BƯỚC 2: Tìm các điểm an toàn trong bán kính 3km (3000m)
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
                0.027 -- ~3km (1 độ = 111km)
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

// 4. [MỚI] Manager lấy TOÀN BỘ lịch sử SOS (Cả đang chờ và đã cứu)
const getAllSOS = async (req, res) => {
    try {
        const query = `
            SELECT
                id,
                user_id,
                phone,
                message,
                status,       -- ACTIVE hoặc RESCUED
                created_at,
                ST_X(geom) as lon,
                ST_Y(geom) as lat
            FROM sos_signals
            ORDER BY created_at DESC; -- Mới nhất lên đầu
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Lỗi lấy lịch sử SOS:", err);
        res.status(500).json({ error: "Lỗi lấy dữ liệu SOS" });
    }
};

module.exports = { handleSOS, getActiveSOS, resolveSOS, requestSOS, getAllSOS };