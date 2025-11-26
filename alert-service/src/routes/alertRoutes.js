const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

// GET /api/alerts (Dân xem - Chỉ hiện Approved)
router.get('/', alertController.getPublicAlerts);

// 1. API nội bộ: Nhận cảnh báo từ Notification Service
// URL: POST /api/alerts/internal/receive
router.post('/internal/receive', alertController.receiveAlert);

// 2. API cho Manager: Xem danh sách chờ duyệt
// URL: GET /api/alerts/pending
router.get('/pending', alertController.getPendingAlerts);

// 3. API cho Manager: Duyệt hoặc Từ chối cảnh báo
// URL: PATCH /api/alerts/:id/review
router.patch('/:id/review', alertController.approveAlert);

module.exports = router;