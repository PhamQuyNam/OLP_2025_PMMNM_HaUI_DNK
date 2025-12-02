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
            { expiresIn: '30d' }
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

const updateProfile = async (req, res) => {
    const userId = req.user.id; // Lấy ID từ token (do middleware gán vào)
    const { username, password, phone, lat, lon } = req.body;

    try {
        let updateData = { username, phone, lat, lon, password: null };

        // Nếu người dùng gửi password mới thì mã hóa, không thì để null
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await UserModel.updateUser(userId, updateData);

        if (!updatedUser) return res.status(404).json({ message: "Người dùng không tồn tại" });

        res.json({ message: "Cập nhật thành công", user: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server khi cập nhật" });
    }
};

const deleteAccount = async (req, res) => {
    const userId = req.user.id; // Lấy ID từ token

    try {
        // Gọi Model để xóa
        await UserModel.deleteUser(userId);

        res.json({ message: "Xóa tài khoản thành công" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server khi xóa tài khoản" });
    }
};

module.exports = { register, login, updateProfile, deleteAccount };