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

const updateUser = async (id, user) => {
    const { username, password, phone, lat, lon } = user;

    // Query sử dụng COALESCE: Nếu tham số truyền vào là NULL thì giữ nguyên giá trị cũ trong DB
    // Logic geom: Nếu có lat/lon mới thì cập nhật điểm mới, nếu không (ELSE geom) thì giữ vị trí cũ
    const query = `
        UPDATE users
        SET
            username = COALESCE($1, username),
            password = COALESCE($2, password),
            phone    = COALESCE($3, phone),
            geom     = CASE
                        WHEN $4::float IS NOT NULL AND $5::float IS NOT NULL
                        THEN ST_SetSRID(ST_Point($5::float, $4::float), 4326)
                        ELSE geom
                       END,
            updated_at = NOW()
        WHERE id = $6
        RETURNING id, username, email, role, phone;
    `;

    // Lưu ý thứ tự tham số khớp với $1, $2... trong query
    // lat là $4, lon là $5. Trong ST_Point phải là (lon, lat) => ($5, $4)
    const values = [username, password, phone, lat, lon, id];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const deleteUser = async (id) => {
    const query = "DELETE FROM users WHERE id = $1 RETURNING id";
    const result = await pool.query(query, [id]);

    // Nếu rowCount > 0 nghĩa là đã xóa thành công
    return result.rowCount > 0;
};

module.exports = { findUserByEmail, createUser, updateUser, deleteUser };