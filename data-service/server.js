require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import logic tạo bảng
const createTables = require('./src/models/schema');

// Import Routes
const mapRoutes = require('./src/routes/mapRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Sử dụng Routes
app.use('/api', mapRoutes);

const PORT = process.env.PORT || 3002;
// --- KHỞI ĐỘNG SERVER ---
//Dùng hàm async để đợi tạo bảng xong mới chạy server
const startServer = async () => {

    // Tự động tạo bảng nếu chưa có
    await createTables();

    // Bắt đầu lắng nghe
    app.listen(PORT, () => {
        console.log(`Backend API structure v2 running on port ${PORT}`);
    });
};

startServer();