const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

router.get('/realtime', weatherController.getRealtimeWeather);

module.exports = router;