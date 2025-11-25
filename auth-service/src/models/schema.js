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
                phone VARCHAR(20),
                geom GEOMETRY(Point, 4326),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

         // --- Thực thi ---
        await pool.query(createUsersTable);
        console.log("✅ Checked/Created table 'users'");

    } catch (err) {
        console.error("❌ Lỗi khi khởi tạo bảng:", err.message);
    }
};

module.exports = createTables;