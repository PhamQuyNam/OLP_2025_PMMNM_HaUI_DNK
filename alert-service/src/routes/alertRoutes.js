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
 * /api/alerts:
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
 *                     enum: [MEDIUM, HIGH, CRITICAL]
 *                   description:
 *                     type: string
 *                   impacted_points:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         lat:
 *                           type: number
 *                         lon:
 *                           type: number
 *       500:
 *         description: Lỗi Server
 */
router.get('/', alertController.getPublicAlerts);

/**
 * @swagger
 * /api/alerts/internal/receive:
 *   post:
 *     summary: Nhận cảnh báo từ hệ thống phân tích (Internal Only)
 *     description: API này dành riêng cho Python Analysis Service gọi sang. Không dành cho người dùng.
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
 *                 example: "Trạm Hương Sơn"
 *               risk_type:
 *                 type: string
 *                 enum: [LANDSLIDE, FLOOD]
 *               level:
 *                 type: string
 *                 enum: [MEDIUM, HIGH, CRITICAL]
 *               rain_value:
 *                 type: number
 *                 example: 120.5
 *               description:
 *                 type: string
 *               impacted_points:
 *                 type: array
 *                 description: Danh sách các điểm bị ảnh hưởng
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     lat:
 *                       type: number
 *                     lon:
 *                       type: number
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
 *                 description: APPROVED để phát cảnh báo, REJECTED để hủy.
 *               managerName:
 *                 type: string
 *                 example: "Nguyen Van A"
 *     responses:
 *       200:
 *         description: Đã xử lý thành công (Nếu Approve thì đã gửi SMS và đẩy lên Map)
 *       400:
 *         description: Trạng thái không hợp lệ
 *       404:
 *         description: Cảnh báo không tồn tại
 *       500:
 *         description: Lỗi Server
 */
router.patch('/:id/review', alertController.approveAlert);

module.exports = router;