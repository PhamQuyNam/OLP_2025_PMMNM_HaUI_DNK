/**
 * Copyright 2025 Haui.DNK
 *
 * Licensed under the Apache License, Version 2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Quản lý tài khoản
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "nguyen_van_a"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@gmail.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 enum: [CITIZEN, MANAGER]
 *                 default: CITIZEN
 *               phone:
 *                 type: string
 *                 example: "0987654321"
 *               lat:
 *                 type: number
 *                 format: float
 *                 example: 18.34
 *               lon:
 *                 type: number
 *                 format: float
 *                 example: 105.90
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Email đã tồn tại hoặc thiếu thông tin
 *       500:
 *         description: Lỗi Server
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@gmail.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công (Trả về Token)
 *       400:
 *         description: Sai tài khoản hoặc mật khẩu
 *       500:
 *         description: Lỗi Server
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/update:
 *   put:
 *     summary: Cập nhật thông tin cá nhân (Cần Token)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               lat:
 *                 type: number
 *               lon:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi Server
 */
router.put('/update', verifyToken, authController.updateProfile);

/**
 * @swagger
 * /api/auth/delete:
 *   delete:
 *     summary: Xóa tài khoản (Cần Token)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đã xóa tài khoản
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi Server
 */
router.delete('/delete', verifyToken, authController.deleteAccount);

module.exports = router;
