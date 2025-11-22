const pool = require('../config/db');

const createTables = async () => {
    try {
        // 1. Bảng Users (Người dùng)
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'CITIZEN',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // 2. Bảng Risk Zones (Vùng nguy cơ) - Yêu cầu Extension PostGIS
        // Lưu ý: Extension thường phải do Admin tạo (hoặc docker tạo),
        // nhưng ta cứ thêm lệnh này để chắc chắn.
        const createRiskZonesTable = `
            CREATE EXTENSION IF NOT EXISTS postgis;

            CREATE TABLE IF NOT EXISTS risk_zones (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                risk_level VARCHAR(20),
                geom GEOMETRY(Polygon, 4326)
            );
        `;

        // --- 3. (MỚI) SEED DATA - Thêm dữ liệu mẫu nếu bảng rỗng ---
        const checkData = await pool.query('SELECT count(*) FROM risk_zones');
        if (parseInt(checkData.rows[0].count) === 0) {
            const insertQuery = `
                INSERT INTO risk_zones (name, risk_level, geom) VALUES
                ('Khu vực A - Sườn đồi dốc', 'HIGH', ST_GeomFromText('POLYGON((104.9 21.5, 104.95 21.5, 104.95 21.55, 104.9 21.55, 104.9 21.5))', 4326));
            `;
            await pool.query(insertQuery);
            console.log("🌱 Seeded sample data for 'risk_zones'");
        }

        // --- Thực thi ---
        await pool.query(createUsersTable);
        console.log("✅ Checked/Created table 'users'");

        await pool.query(createRiskZonesTable);
        console.log("✅ Checked/Created table 'risk_zones'");

    } catch (err) {
        console.error("❌ Lỗi khi khởi tạo bảng:", err.message);
    }
};

module.exports = createTables;