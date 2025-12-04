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
const weatherController = require('../controllers/weatherController');

/**
 * @swagger
 * tags:
 *   - name: Weather
 *     description: Dữ liệu Thời tiết & Quan trắc Thời gian thực
 */

/**
 * @swagger
 * /api/weather/realtime:
 *   get:
 *     summary: Lấy dữ liệu mưa hiện tại từ các trạm quan trắc
 *     description: Trả về danh sách các trạm đo mưa tại TP Hà Tĩnh kèm theo trạng thái cảnh báo.
 *     tags: [Weather]
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "urn:ngsi-ld:RainObserved:HT_Center_Vincom"
 *                   name:
 *                     type: string
 *                     example: "Trạm Trung Tâm (Vincom)"
 *                   rain:
 *                     type: number
 *                     format: float
 *                     example: 45.5
 *                   lat:
 *                     type: number
 *                     format: float
 *                     example: 18.3436
 *                   lon:
 *                     type: number
 *                     format: float
 *                     example: 105.9002
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-11-25T10:30:00Z"
 *                   status:
 *                     type: string
 *                     enum: [SAFE, RAINY, WARNING, DANGER]
 *                     example: "DANGER"
 *                   displayColor:
 *                     type: string
 *                     enum: [GREEN, BLUE, ORANGE, RED]
 *                     example: "RED"
 *                   message:
 *                     type: string
 *                     example: "Đang mưa 45.5mm"
 *       500:
 *         description: Lỗi Server hoặc mất kết nối Orion
 */

router.get('/realtime', weatherController.getRealtimeWeather);

module.exports = router;