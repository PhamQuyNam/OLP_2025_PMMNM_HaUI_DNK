const pool = require('../config/db');

const createUser = async (username, email, hashedPassword, role) => {
    const query = `
        INSERT INTO users (username, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, username, email, role;
    `;
    const res = await pool.query(query, [username, email, hashedPassword, role]);
    return res.rows[0];
};

const findUserByEmail = async (email) => {
    const query = `SELECT * FROM users WHERE email = $1`;
    const res = await pool.query(query, [email]);
    return res.rows[0];
};

module.exports = { createUser, findUserByEmail };