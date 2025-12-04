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
const mapController = require('../controllers/mapController');

/**
 * @swagger
 * tags:
 *   - name: Map
 *     description: API Dữ liệu Bản đồ (GeoJSON Standard)
 */

/**
 * @swagger
 * /api/map/zones:
 *   get:
 *     summary: Lấy danh sách Vùng nguy cơ (Risk Zones)
 *     description: Trả về dữ liệu bản đồ các vùng rủi ro (Hương Sơn, Kỳ Anh...) dưới dạng chuẩn GeoJSON (Polygons). Dùng để vẽ lớp nền (Layer) trên bản đồ.
 *     tags: [Map]
 *     responses:
 *       200:
 *         description: GeoJSON FeatureCollection thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: FeatureCollection
 *                 features:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: Feature
 *                       geometry:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: Polygon
 *                           coordinates:
 *                             type: array
 *                             items:
 *                               type: array
 *                               items:
 *                                 type: array
 *                                 items:
 *                                   type: number
 *                       properties:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                             example: "Huyện Hương Sơn"
 *                           risk_level:
 *                             type: string
 *                             enum: [HIGH, MEDIUM, LOW]
 *                           risk_type:
 *                             type: string
 *                             enum: [LANDSLIDE, FLOOD]
 *       500:
 *         description: Lỗi Server
 */
router.get('/zones', mapController.getRiskZones);

/**
 * @swagger
 * /api/map/points:
 *   get:
 *     summary: Lấy danh sách Điểm xung yếu (Vulnerable Points)
 *     description: Trả về các điểm (trường học, bệnh viện, cầu...) nằm trong vùng nguy hiểm dạng GeoJSON (Point).
 *     tags: [Map]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [SCHOOL, HOSPITAL, MARKET, BRIDGE, RESIDENTIAL, OTHER]
 *         description: (Tùy chọn) Lọc theo loại công trình
 *     responses:
 *       200:
 *         description: GeoJSON FeatureCollection thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: FeatureCollection
 *                 features:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: Feature
 *                       geometry:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: Point
 *                           coordinates:
 *                             type: array
 *                             example: [105.34, 18.45]  # [Lon, Lat]
 *                             items:
 *                               type: number
 *                       properties:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                             example: "Trường THPT Hương Sơn"
 *                           type:
 *                             type: string
 *                             example: "SCHOOL"
 *                           risk_type:
 *                             type: string
 *                             example: "LANDSLIDE"
 *       500:
 *         description: Lỗi Server
 */
router.get('/points', mapController.getVulnerablePoints);

module.exports = router;