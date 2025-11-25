const pool = require('../config/db');

const findUserByEmail = async (email) => {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);
    return result.rows[0];
};

const createUser = async (user) => {
    const { username, email, password, role, phone, lat, lon } = user;

    // Query thông minh: Nếu có lat/lon thì tạo điểm, không thì để NULL
    const query = `
        INSERT INTO users (username, email, password, role, phone, geom)
        VALUES ($1, $2, $3, $4, $5,
            CASE
                WHEN $6::float IS NOT NULL AND $7::float IS NOT NULL
                THEN ST_SetSRID(ST_Point($7::float, $6::float), 4326)
                ELSE NULL
            END
        )
        RETURNING id, username, email, role, phone;
    `;

    const values = [username, email, password, role || 'CITIZEN', phone, lat, lon];
    const result = await pool.query(query, values);
    return result.rows[0];
};

module.exports = { findUserByEmail, createUser };