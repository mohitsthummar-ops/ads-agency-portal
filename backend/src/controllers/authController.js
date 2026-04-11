const { validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
} = require('../services/authService');

// ─── @route   POST /api/auth/register ─────────────────────────────────────────
exports.register = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendError(res, 400, 'Validation failed', { errors: errors.array() });
    }
    await registerUser(req.body, res);
});

// ─── @route   POST /api/auth/login ────────────────────────────────────────────
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return sendError(res, 400, 'Please provide email and password');
    }
    await loginUser({ email, password }, res);
});

// ─── @route   GET /api/auth/me ────────────────────────────────────────────────
exports.getMe = asyncHandler(async (req, res) => {
    // Generate a new token for the user (in case the old one is expiring)
    const token = req.user.getSignedJwtToken();
    sendSuccess(res, 200, 'User profile fetched', {
        user: req.user,
        token: token
    });
});

// ─── @route   POST /api/auth/logout ───────────────────────────────────────────
exports.logout = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });
    sendSuccess(res, 200, 'Logged out successfully');
};

// ─── @route   POST /api/auth/forgot-password ─────────────────────────────────
exports.forgotPassword = asyncHandler(async (req, res) => {
    await forgotPassword(req.body.email, process.env.CLIENT_URL, res);
});

// ─── @route   PUT /api/auth/reset-password/:token ────────────────────────────
exports.resetPassword = asyncHandler(async (req, res) => {
    await resetPassword(req.params.token, req.body.password, res);
});
