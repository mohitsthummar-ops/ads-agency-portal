const express = require('express');
const router = express.Router();
const {
    getProfile, updateProfile, changePassword, uploadAvatar,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect); // All user routes require auth

router.get('/profile', getProfile);
router.put('/profile', uploadAvatar, updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
