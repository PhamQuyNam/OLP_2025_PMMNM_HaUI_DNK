/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
 */

const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sosController');

/**
 * @swagger
 * tags:
 *   - name: Safety
 *     description: Quản lý SOS và Điểm an toàn
 */

/**
 * @swagger
 * /api/safety/sos/request:
 *   post:
 *     summary: Gửi mã OTP xác thực trước khi gửi tín hiệu SOS
 *     description: |
 *       API này sẽ gửi mã OTP đến email của người dùng.
 *       OTP được dùng để xác thực trước khi hệ thống chấp nhận tín hiệu SOS.
 *     tags: [Safety]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: OTP đã được gửi đến email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP đã được gửi"
 *                 expires_in:
 *                   type: number
 *                   example: 120
 *       400:
 *         description: Thiếu email hoặc định dạng không hợp lệ
 *       500:
 *         description: Lỗi hệ thống khi gửi OTP
 */

router.post("/sos/request", sosController.requestSOS);

/**
 * @swagger
 * /api/safety/sos:
 *   post:
 *     summary: Xác thực OTP và gửi tín hiệu SOS (Dành cho người dân)
 *     description: |
 *       Người dùng phải nhập đúng mã OTP đã được gửi qua email để xác thực trước khi hệ thống chấp nhận tín hiệu SOS.
 *     tags: [Safety]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lat
 *               - lon
 *               - email
 *               - otp
 *             properties:
 *               lat:
 *                 type: number
 *                 example: 18.3436
 *               lon:
 *                 type: number
 *                 example: 105.9002
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               message:
 *                 type: string
 *                 example: "Tôi bị mắc kẹt, nước dâng cao."
 *               userId:
 *                 type: string
 *                 example: "user_123"
 *     responses:
 *       200:
 *         description: Xác thực OTP thành công và tín hiệu SOS đã được gửi
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc OTP sai / hết hạn
 *       500:
 *         description: Lỗi máy chủ
 */

router.post('/sos', sosController.handleSOS);

/**
 * @swagger
 * /api/safety/sos/active:
 *   get:
 *     summary: Lấy danh sách SOS đang chờ cứu (Dành cho Manager)
 *     description: Trả về tọa độ các nạn nhân đang kêu cứu để hiển thị lên bản đồ tác chiến.
 *     tags: [Safety]
 *     responses:
 *       200:
 *         description: Danh sách SOS
 */

router.get('/sos/active', sosController.getActiveSOS);

/**
 * @swagger
 * /api/safety/sos/{id}/resolve:
 *   patch:
 *     summary: Xác nhận đã cứu hộ xong (Dành cho Manager)
 *     tags: [Safety]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID SOS cần cập nhật
 *     responses:
 *       200:
 *         description: Trạng thái chuyển sang RESCUED
 */

router.patch('/sos/:id/resolve', sosController.resolveSOS);

module.exports = router;