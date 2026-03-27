const bcrypt = require('bcryptjs');
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

         // --- Thực thi ---
        await pool.query(createUsersTable);
        console.log("✅ Checked/Created table 'users'");

        // 2. TẠO TÀI KHOẢN ADMIN MẶC ĐỊNH (Seeding)
        // Kiểm tra xem đã có tài khoản MANAGER nào chưa?
        const checkAdmin = await pool.query("SELECT * FROM users WHERE role = 'MANAGER' LIMIT 1");

        if (checkAdmin.rows.length === 0) {
            console.log("🌱 Chưa có Admin. Đang khởi tạo tài khoản quản lý mặc định...");

            // Thông tin Admin mặc định (Nên đưa vào biến môi trường .env)
            const adminUsername = process.env.DEFAULT_ADMIN_USER || "SuperAdmin";
            const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@gmail.com";
            const adminPassPlain = process.env.DEFAULT_ADMIN_PASS || "admin@123"; // Mật khẩu gốc
            const adminPhone = "0999888777";

            // Mã hóa mật khẩu (Bắt buộc)
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassPlain, salt);

            // Chèn vào Database
            const insertQuery = `
                INSERT INTO users (username, email, password, role, phone, geom)
                VALUES ($1, $2, $3, $4, $5, NULL) -- Admin không cần tọa độ (NULL)
            `;

            await pool.query(insertQuery, [adminUsername, adminEmail, hashedPassword, 'MANAGER', adminPhone]);

            console.log(`🚀 Đã tạo Admin thành công!`);
            console.log(`   📧 Email: ${adminEmail}`);
            console.log(`   🔑 Pass: ${adminPassPlain}`);
        } else {
            console.log("ℹ️ Tài khoản Admin (MANAGER) đã tồn tại. Bỏ qua bước tạo.");
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS otp_codes (
                email VARCHAR(255) NOT NULL,
                otp VARCHAR(6) NOT NULL,
                expires_at TIMESTAMP NOT NULL
            );
        `);

    } catch (err) {
        console.error("❌ Lỗi khi khởi tạo bảng:", err.message);
    }
};

module.exports = createTables;