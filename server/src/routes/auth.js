const express = require('express');
const router = express.Router();
const { register, login, sendCode, verifyCodeAndLogin, getMe, updateMe, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/google', googleLogin);
router.post('/send-code', sendCode);
router.post('/verify-code', verifyCodeAndLogin);
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;
