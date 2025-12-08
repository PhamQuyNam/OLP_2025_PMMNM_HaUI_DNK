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
const alertController = require('../controllers/alertController');

/**
 * @swagger
 * tags:
 *   - name: Alerts
 *     description: Quản lý quy trình Cảnh báo (Workflow)
 */

/**
 * @swagger
 * /api/alerts/citizen:
 *   get:
 *     summary: Lấy danh sách cảnh báo công khai (Dành cho người dân)
 *     description: Chỉ trả về các cảnh báo đã được DUYỆT (APPROVED) và còn hiệu lực trong 24h.
 *     tags: [Alerts]
 *     responses:
 *       200:
 *         description: Danh sách cảnh báo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   station_name:
 *                     type: string
 *                   alert_level:
 *                     type: string
 *                     enum: [HIGH, VERY HIGH, CRITICAL]
 *                   description:
 *                     type: string
 *                   estimated_toa_hours:
 *                     type: number
 *                     format: float
 *                   rain_value:
 *                     type: number
 *                     description: Mưa 1h hiện tại
 *                   rain_24h:
 *                     type: number
 *                     description: Mưa tích lũy 24h
 *                   context_data:
 *                     type: object
 *                     description: Các chỉ số phân tích (Slope, TWI, Scores...)
 *       500:
 *         description: Lỗi Server
 */
router.get('/citizen', alertController.getPublicAlerts);


/**
 * @swagger
 * /api/alerts/internal/receive:
 *   post:
 *     summary: Nhận cảnh báo từ hệ thống phân tích (Internal Only)
 *     description: API này dành riêng cho Python Analysis Service gọi sang.
 *     tags: [Alerts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - station_name
 *               - risk_type
 *               - level
 *               - rain_value
 *             properties:
 *               station_name:
 *                 type: string
 *               risk_type:
 *                 type: string
 *                 enum: [LANDSLIDE, FLOOD]
 *               level:
 *                 type: string
 *                 enum: [HIGH, VERY HIGH, CRITICAL]
 *               rain_value:
 *                 type: number
 *               rain_24h:
 *                 type: number
 *               flood_score:
 *                 type: number
 *               landslide_score:
 *                 type: number
 *               context_data:
 *                 type: object
 *                 description: elevation, slope, twi, isr, soil_moisture...
 *               estimated_toa_hours:
 *                 type: number
 *                 format: float
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đã tiếp nhận hoặc cập nhật cảnh báo thành công
 *       500:
 *         description: Lỗi lưu Database
 */
router.post('/internal/receive', alertController.receiveAlert);


/**
 * @swagger
 * /api/alerts/pending:
 *   get:
 *     summary: Lấy danh sách cảnh báo chờ duyệt (Dành cho Manager)
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách các cảnh báo trạng thái PENDING
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   station_name:
 *                     type: string
 *                   alert_level:
 *                     type: string
 *                   rain_value:
 *                     type: number
 *                   rain_24h:
 *                     type: number
 *                   estimated_toa_hours:
 *                     type: number
 *                     format: float
 *                   context_data:
 *                     type: object
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Lỗi Server
 */
router.get('/pending', alertController.getPendingAlerts);

/**
 * @swagger
 * /api/alerts/{id}/review:
 *   patch:
 *     summary: Duyệt hoặc Từ chối cảnh báo (Dành cho Manager)
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của cảnh báo cần duyệt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - managerName
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *               managerName:
 *                 type: string
 *                 example: "Nguyen Van A"
 *     responses:
 *       200:
 *         description: Đã xử lý thành công
 *       400:
 *         description: Trạng thái không hợp lệ
 *       404:
 *         description: Cảnh báo không tồn tại
 *       500:
 *         description: Lỗi Server
 */
router.patch('/:id/review', alertController.approveAlert);

/**
 * @swagger
 * /api/alerts/history:
 *   get:
 *     summary: Lấy lịch sử cảnh báo đã xử lý (Dành cho Manager)
 *     description: Xem danh sách các cảnh báo đã được duyệt hoặc từ chối trong quá khứ.
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [APPROVED, REJECTED]
 *         description: Lọc theo trạng thái (bỏ trống để lấy tất cả)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Số lượng bản ghi tối đa
 *     responses:
 *       200:
 *         description: Danh sách lịch sử đã xử lý
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   station_name:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [APPROVED, REJECTED]
 *                   approved_by:
 *                     type: string
 *                   rain_value:
 *                     type: number
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Lỗi Server
 */
router.get('/history', alertController.getHistoryAlerts);

module.exports = router;
