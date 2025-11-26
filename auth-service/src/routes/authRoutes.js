const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

// verifyToken sẽ chạy trước, nếu OK mới chạy đến controller
router.put('/update', verifyToken, authController.updateProfile);
router.delete('/delete', verifyToken, authController.deleteAccount);

module.exports = router;