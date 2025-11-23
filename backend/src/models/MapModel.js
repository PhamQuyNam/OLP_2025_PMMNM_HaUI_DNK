const pool = require('../config/db');

const getRiskZones = async () => {
    const query = `
        SELECT jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(ST_AsGeoJSON(t.*)::jsonb)
        )
        FROM (SELECT id, name, risk_level, geom FROM risk_zones) AS t;
    `;
    const res = await pool.query(query);
    return res.rows[0].jsonb_build_object;
};

module.exports = { getRiskZones };