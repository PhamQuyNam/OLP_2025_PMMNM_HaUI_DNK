const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Lấy token từ header (chuẩn là: "Authorization: Bearer <token>")
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: "Truy cập bị từ chối. Vui lòng đăng nhập." });
    }

    try {
        // Cắt bỏ chữ "Bearer " nếu client có gửi kèm
        const tokenString = token.startsWith("Bearer ") ? token.slice(7, token.length) : token;

        // Giải mã token
        const verified = jwt.verify(tokenString, process.env.JWT_SECRET);

        // Gắn thông tin user (id, role) vào request để các controller phía sau sử dụng
        req.user = verified;

        next(); // Cho phép đi tiếp
    } catch (err) {
        res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
};

module.exports = verifyToken;