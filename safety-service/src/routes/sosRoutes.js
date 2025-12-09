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
const verifyToken = require('../auth/middleware');

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
 *     summary: Yêu cầu gửi mã OTP SOS (Cần đăng nhập)
 *     description: |
 *       Hệ thống sẽ tự động lấy Email từ Token đăng nhập của người dùng và gửi OTP về đó.
 *       Người dùng không cần nhập email thủ công.
 *     tags: [Safety]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OTP đã được gửi thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP đã gửi đến d***@gmail.com"
 *                 otp_sent:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Chưa đăng nhập (Thiếu Token)
 *       404:
 *         description: Không tìm thấy email người dùng trong DB
 *       500:
 *         description: Lỗi hệ thống khi gửi Email
 */
router.post('/sos/request', verifyToken, sosController.requestSOS);


/**
 * @swagger
 * /api/safety/sos:
 *   post:
 *     summary: Xác thực OTP và Gửi tín hiệu SOS (Cần đăng nhập)
 *     description: |
 *       Người dùng gửi tọa độ và mã OTP vừa nhận được.
 *       Hệ thống sẽ xác thực OTP, lưu tín hiệu cầu cứu và trả về các điểm an toàn gần nhất.
 *     tags: [Safety]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lat
 *               - lon
 *               - otp
 *             properties:
 *               lat:
 *                 type: number
 *                 format: float
 *                 example: 18.3436
 *               lon:
 *                 type: number
 *                 format: float
 *                 example: 105.9002
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               message:
 *                 type: string
 *                 example: "Nước ngập quá đầu người, cần cano gấp!"
 *               phone:
 *                 type: string
 *                 example: "0912345678"
 *     responses:
 *       200:
 *         description: SOS thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 your_location:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                     lon:
 *                       type: number
 *                 nearest_safe_zones:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       distance:
 *                         type: string
 *       400:
 *         description: OTP sai hoặc hết hạn
 *       401:
 *         description: Token không hợp lệ
 *       500:
 *         description: Lỗi Server
 */
router.post('/sos', verifyToken, sosController.handleSOS);


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

/**
 * @swagger
 * /api/safety/sos/all:
 *   get:
 *     summary: Lấy toàn bộ lịch sử tín hiệu SOS (Dành cho Manager)
 *     description: Trả về tất cả các tín hiệu cứu hộ (bao gồm cả ACTIVE và RESCUED) để phục vụ thống kê báo cáo.
 *     tags: [Safety]
 *     responses:
 *       200:
 *         description: Danh sách đầy đủ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   status:
 *                     type: string
 *                     enum: [ACTIVE, RESCUED]
 *                   phone:
 *                     type: string
 *                   lat:
 *                     type: number
 *                   lon:
 *                     type: number
 *       500:
 *         description: Lỗi Server
 */
router.get('/sos/all', sosController.getAllSOS);

/**
 * @swagger
 * /api/safety/sos/{id}:
 *   delete:
 *     summary: Xóa tín hiệu SOS (Dành cho Manager/Admin)
 *     description: Xóa vĩnh viễn một tín hiệu cầu cứu khỏi hệ thống.
 *     tags: [Safety]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của tín hiệu SOS
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy
 *       500:
 *         description: Lỗi Server
 */
router.delete('/sos/:id', verifyToken, sosController.deleteSOS);

module.exports = router;