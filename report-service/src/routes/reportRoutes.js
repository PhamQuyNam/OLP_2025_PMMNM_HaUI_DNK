const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// POST /api/reports (Dân gửi lên)
router.post('/', reportController.createReport);

// GET /api/reports (Quản lý xem)
router.get('/', reportController.getReports);

module.exports = router;