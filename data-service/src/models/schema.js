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

    } catch (err) {
        console.error("❌ Error creating data tables:", err.message);
    }
};

module.exports = createTables ;