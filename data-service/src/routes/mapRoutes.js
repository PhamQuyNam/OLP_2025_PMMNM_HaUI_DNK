const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

router.get('/zones', mapController.getRiskZones);
router.get('/points', mapController.getVulnerablePoints);

module.exports = router;