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

        // 3. (MỚI) Bảng Trạm Quan Trắc (Lưu vị trí các trạm đo mưa)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS monitoring_stations (
                id SERIAL PRIMARY KEY,
                station_id VARCHAR(100) UNIQUE, -- URN định danh (urn:ngsi-ld...)
                name VARCHAR(100),
                description TEXT,
                geom GEOMETRY(Point, 4326) -- Tọa độ trạm
            );
        `);
        console.log("✅ Data Service: Monitoring Stations table checked.");

        // 4. Bảng Thủy hệ (Sông, Suối, Kênh, Rạch)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS waterways (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                type VARCHAR(50), -- river, canal, stream
                geom GEOMETRY(LineString, 4326) -- Lưu hình dáng dòng sông
            );
        `);
        console.log("✅ Data Service: Waterways table checked.");

        // 7. Bảng Chỉ số Tĩnh của Trạm (Hồ sơ địa hình/thủy văn)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS station_static_metrics (
                station_id VARCHAR(100) PRIMARY KEY ,

                -- Nhóm Địa hình
                elevation FLOAT DEFAULT 0,      -- Độ cao (m)
                slope FLOAT DEFAULT 0,          -- Độ dốc (%)

                -- Nhóm Thủy văn
                dist_to_river FLOAT DEFAULT 0,  -- Khoảng cách đến sông (m)
                drainage_density FLOAT DEFAULT 0, -- Mật độ thoát nước (km/km2)

                -- Nhóm Bề mặt
                impervious_ratio FLOAT DEFAULT 0, -- Tỷ lệ bê tông hóa (%)

                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Data Service: Station Static Metrics table checked.");

    } catch (err) {
        console.error("❌ Error creating data tables:", err.message);
    }
};

module.exports = createTables ;