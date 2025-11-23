const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

router.get('/risk-zones', mapController.getZones);

module.exports = router;