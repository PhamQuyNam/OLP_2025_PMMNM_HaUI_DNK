const pool = require('../config/db');

const createTables = async () => {
    try {
        await pool.query("CREATE EXTENSION IF NOT EXISTS postgis;");

        // 1. Bảng Vùng Nguy cơ (Lưu các huyện/xã)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS risk_zones (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                risk_level VARCHAR(20), -- HIGH, MEDIUM
                risk_type VARCHAR(50),  -- LANDSLIDE, FLOOD
                geom GEOMETRY(Polygon, 4326)
            );
        `);

        // 2. Bảng Điểm Xung Yếu (Lưu trường học, cầu, bệnh viện...)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS vulnerable_points (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                type VARCHAR(50),       -- SCHOOL, HOSPITAL...
                risk_type VARCHAR(20),  -- LANDSLIDE, FLOOD
                geom GEOMETRY(Point, 4326)
            );
        `);

        // 3. Bảng Lịch sử Lưu trữ (Kho lạnh)
        // Lưu ý: Bảng này chỉ để ĐỌC (Read-only) ở service này.
        // Việc GHI (Write) do alert-service và script Python đảm nhiệm.
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
                approved_by VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                original_created_at TIMESTAMP
            );
        `);

        console.log("✅ Data Service: GIS & History tables ready.");

    } catch (err) {
        console.error("❌ Error creating data tables:", err.message);
    }
};

module.exports = createTables ;