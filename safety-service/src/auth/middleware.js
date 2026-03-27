const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Lấy token từ Header: "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Chưa đăng nhập (Thiếu Token)" });
    }

    try {
        // Giải mã Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Giả sử token chứa { id, role } và ta cần query DB lấy email cho chắc chắn
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
};

module.exports = verifyToken;