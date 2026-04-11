const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/email');
const { logActivity } = require('../utils/logger');
const { ADMIN_EMAILS } = require('../config/admin');

/**
 * Issue a JWT and set it as an httpOnly cookie.
 * Also returns the token in the JSON body for legacy frontend support.
 */
const sendToken = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const cookieOptions = {
        expires: new Date(
            Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    };

    res.status(statusCode)
        .cookie('token', token, cookieOptions)
        .json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
};

/**
 * Register a new user.
 */
const registerUser = async (userData, res) => {
    const { name, password } = userData;
    const email = userData.email.toLowerCase().trim();

    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // Role is fixed based on email; general registration is for clients only
    // Only pre-approved emails can be admins
    const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'client';

    // Spread userData to capture phone, companyName, etc. then override sensitive/calculated fields
    const user = await User.create({
        ...userData,
        email,
        password,
        role,
        loginProvider: 'local'
    });

    // Send welcome email (fire and forget, or await and catch)
    try {
        await sendWelcomeEmail(user.email, user.name);
    } catch (error) {
        console.error('Failed to send welcome email:', error.message);
    }

    logActivity(email, 'registered');
    sendToken(user, 201, res);
};

/**
 * Login a user with email + password.
 */
const loginUser = async ({ email, password }, res) => {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
        logActivity(email, 'failed login attempt (not found)', 'failure');
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        logActivity(email, 'failed login attempt (wrong password)', 'failure');
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
        return res.status(403).json({
            success: false,
            message: 'Your account has been blocked. Contact support.',
        });
    }

    logActivity(user.email, 'logged in successfully');

    // Self-healing: If email is in ADMIN_EMAILS list, ensure role is 'admin'
    if (ADMIN_EMAILS.includes(user.email.toLowerCase()) && user.role !== 'admin') {
        user.role = 'admin';
        await user.save(); // pre-save hook will also verify this
    }

    sendToken(user, 200, res);
};

/**
 * Initiate password reset: generate token, save to DB, send email.
 */
const forgotPassword = async (email, clientUrl, res) => {
    // Ensure we have a clientUrl, fallback to env or production default
    const url = clientUrl || process.env.CLIENT_URL || process.env.FRONTEND_URL || 'https://ads-agency-portal.vercel.app';

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ success: false, message: 'No account found with that email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${url.replace(/\/$/, '')}/reset-password/${resetToken}`;

    try {
        await sendPasswordResetEmail(user.email, user.name, resetUrl);
        logActivity(user.email, 'requested password reset');
        return res.status(200).json({ success: true, message: `Reset link sent to ${user.email}` });
    } catch (error) {
        console.error('FORGOT_PASSWORD_ERROR:', error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ success: false, message: 'Failed to send email. Check SMTP settings.' });
    }
};

/**
 * Reset user password using the plaintext token from the URL.
 */
const resetPassword = async (token, newPassword, res) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    logActivity(user.email, 'reset password successfully');
    sendToken(user, 200, res);
};

module.exports = { sendToken, registerUser, loginUser, forgotPassword, resetPassword };
