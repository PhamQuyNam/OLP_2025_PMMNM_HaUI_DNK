/**
 * Copyright 2025 Haui.DNK
 *
 * Licensed under the Apache License, Version 2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
 */

const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

/**
 * @swagger
 * tags:
 *   - name: Reports
 *     description: Quản lý Báo cáo sự cố từ cộng đồng (Crowdsourcing)
 */

/**
 * @swagger
 * /api/reports/send:
 *   post:
 *     summary: Gửi báo cáo sự cố mới (Dành cho Người dân)
 *     description: API cho phép người dân gửi thông tin, vị trí và mô tả sự cố thiên tai họ đang chứng kiến.
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - lat
 *               - lon
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [FLOOD, LANDSLIDE, STORM, OTHER]
 *                 example: FLOOD
 *                 description: Loại sự cố
 *               description:
 *                 type: string
 *                 example: "Nước ngập qua yên xe máy, dòng chảy mạnh."
 *               lat:
 *                 type: number
 *                 format: float
 *                 example: 18.3436
 *               lon:
 *                 type: number
 *                 format: float
 *                 example: 105.9002
 *               phone:
 *                 type: string
 *                 example: "0987654321"
 *     responses:
 *       201:
 *         description: Gửi báo cáo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Gửi báo cáo thành công!"
 *                 reportId:
 *                   type: string
 *                   example: "urn:ngsi-ld:CitizenReport:12345"
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       500:
 *         description: Lỗi Server hoặc lỗi kết nối Orion
 */

router.post("/send", reportController.createReport);

/**
 * @swagger
 * /api/reports/receive:
 *   get:
 *     summary: Lấy danh sách báo cáo (Dành cho Manager Dashboard)
 *     description: Trả về danh sách các báo cáo từ người dân để hiển thị lên bản đồ quản lý.
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Danh sách báo cáo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID định danh của báo cáo (NGSI-LD URN)
 *                   type:
 *                     type: string
 *                     example: FLOOD
 *                   desc:
 *                     type: string
 *                     example: "Nước dâng cao..."
 *                   status:
 *                     type: string
 *                     enum: [PENDING, VERIFIED, REJECTED]
 *                     example: PENDING
 *                   phone:
 *                     type: string
 *                     example: "0912345678"
 *                   time:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-11-23T10:00:00Z"
 *                   lat:
 *                     type: number
 *                     example: 18.3436
 *                   lon:
 *                     type: number
 *                     example: 105.9002
 *       500:
 *         description: Lỗi Server
 */

router.get("/receive", reportController.getReports);

/**
 * @swagger
 * /api/reports/{id}:
 *   delete:
 *     summary: Xóa một báo cáo
 *     description: Xóa vĩnh viễn báo cáo khỏi hệ thống (Orion).
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID đầy đủ của báo cáo (VD:urn:ngsi-ld:CitizenReport:...)
 *         example: "urn:ngsi-ld:CitizenReport:1234-5678"
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy báo cáo
 *       500:
 *         description: Lỗi Server
 */
router.delete("/:id", reportController.deleteReport);

module.exports = router;
