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
 * /api/safety/sos:
 *   post:
 *     summary: Gửi tín hiệu SOS (Dành cho Dân)
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
 *             properties:
 *               lat:
 *                 type: number
 *                 example: 18.3436
 *               lon:
 *                 type: number
 *                 example: 105.9002
 *               phone:
 *                 type: string
 *                 example: "0987654321"
 *               message:
 *                 type: string
 *                 example: "Tôi bị mắc kẹt, nước dâng cao."
 *     responses:
 *       200:
 *         description: Thành công, trả về danh sách điểm an toàn
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