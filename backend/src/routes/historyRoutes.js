const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

// Định nghĩa đường dẫn
// GET /api/history/
router.get('/', historyController.getHistory);

// GET /api/history/stats
router.get('/stats', historyController.getStats);

module.exports = router;