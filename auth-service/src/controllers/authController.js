/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const UserModel = require('../models/UserModel');
const { sendEmailOTP } = require("../controllers/email");

const requestOTP = async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Thiếu email" });

    try {
        const existingUser = await UserModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email này đã được đăng ký rồi" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Xóa OTP cũ của email này (nếu có) để tránh rác DB
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

        res.json({ message: "OTP Email đã gửi", otp_sent: "true" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi tạo OTP" });
    }
};

// API Đăng ký
const register = async (req, res) => {
    // Nhận thêm phone, lat, lon từ Frontend
    const { username, email, password, role, phone, lat, lon, otp} = req.body;

    try {
        // --- BƯỚC 1: CHECK OTP TRƯỚC (Tiết kiệm tài nguyên) ---
        const checkOTP = await pool.query(`
            SELECT * FROM otp_codes
            WHERE email = $1 AND otp = $2 AND expires_at > NOW()
        `, [email, otp]);

        if (checkOTP.rows.length === 0) {
            return res.status(400).json({ message: "Mã OTP sai hoặc đã hết hạn" });
        }
        // 2. Kiểm tra user tồn tại
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

         // Xóa OTP sau xác thực
        await pool.query(`DELETE FROM otp_codes WHERE email = $1`, [email]);

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

module.exports = { register, login, updateProfile, deleteAccount, requestOTP };