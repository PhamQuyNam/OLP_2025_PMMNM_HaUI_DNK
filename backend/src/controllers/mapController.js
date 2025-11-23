const MapModel = require('../models/MapModel');

const getZones = async (req, res) => {
    try {
        const data = await MapModel.getRiskZones();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getZones };