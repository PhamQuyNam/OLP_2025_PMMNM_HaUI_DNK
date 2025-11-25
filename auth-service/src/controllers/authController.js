const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

// API Đăng ký
const register = async (req, res) => {
    // Nhận thêm phone, lat, lon từ Frontend
    const { username, email, password, role, phone, lat, lon } = req.body;

    try {
        // 1. Kiểm tra user tồn tại
        const existingUser = await UserModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email đã được sử dụng" });
        }

        // 2. Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Gọi Model để lưu vào DB
        const newUser = await UserModel.createUser({
            username, email, password: hashedPassword, role, phone, lat, lon
        });

        res.status(201).json({ message: "Đăng ký thành công", user: newUser });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server khi đăng ký" });
    }
};

// API Đăng nhập
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Tìm user
        const user = await UserModel.findUserByEmail(email);
        if (!user) return res.status(400).json({ message: "Sai email hoặc mật khẩu" });

        // 2. So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Sai email hoặc mật khẩu" });

        // 3. Tạo Token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: "Đăng nhập thành công",
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                phone: user.phone
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server khi đăng nhập" });
    }
};

module.exports = { register, login };