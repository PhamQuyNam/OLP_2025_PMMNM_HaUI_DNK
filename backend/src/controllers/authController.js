// SPDX-License-Identifier: Apache-2.0
/**
 * Copyright 2025 Haui.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

const JWT_SECRET = process.env.JWT_SECRET || "secret";

const register = async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const existingUser = await UserModel.findUserByEmail(email);
        if (existingUser) return res.status(400).json({ message: "Email tồn tại" });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const newUser = await UserModel.createUser(username, email, hash, role || 'CITIZEN');
        res.status(201).json({ message: "Đăng ký thành công", user: newUser });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server khi đăng ký" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findUserByEmail(email);
        if (!user) return res.status(400).json({ message: "Email hoặc mật khẩu không chính xác!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Email hoặc mật khẩu không chính xác!" });

        // Token này chứa ID và Role của user, hết hạn sau 1 ngày
        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: "Đăng nhập thành công",
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server khi đăng nhập" });
    }
};

module.exports = { register, login };