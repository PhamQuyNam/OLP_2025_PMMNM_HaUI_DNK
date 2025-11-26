// SPDX-License-Identifier: Apache-2.0
/**
 * Copyright 2025 Haui.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
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