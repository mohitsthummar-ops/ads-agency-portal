const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    register, login, getMe, logout, forgotPassword, resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const registerValidators = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidators = [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
];

const passport = require('passport');

router.post('/register', registerValidators, register);
router.post('/login', loginValidators, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Emergency Cloud DB Fix (User can visit this if they can't access Render shell)
const User = require('../models/User');
router.get('/fix-admin-db', async (req, res) => {
    try {
        const email = 'kaushalpthummar@gmail.com';
        let adminUser = await User.findOne({ email });
        if (adminUser) {
            adminUser.password = 'admin123';
            adminUser.role = 'admin';
            await adminUser.save();
            res.json({ success: true, message: `Password for ${email} successfully repaired to admin123` });
        } else {
            await User.create({
                name: 'Kaushal Admin',
                email: email,
                password: 'admin123',
                role: 'admin',
                loginProvider: 'local',
            });
            res.json({ success: true, message: `User ${email} created with password admin123` });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Robust fallback for frontend URL (prefer production)
        const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://ads-agency-portal.vercel.app';
        // Successful authentication, redirect to frontend dashboard
        res.redirect(`${frontendUrl.replace(/\/$/, '')}/dashboard`);
    }
);

module.exports = router;
