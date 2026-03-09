const express = require('express');
const router = express.Router();
const { adminLogin, studentLogin, createAdmin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/admin/login', adminLogin);
router.post('/student/login', studentLogin);
router.get('/setup', createAdmin); // One-time setup
router.post('/setup', createAdmin); // One-time setup
router.get('/me', protect, getMe);

module.exports = router;
