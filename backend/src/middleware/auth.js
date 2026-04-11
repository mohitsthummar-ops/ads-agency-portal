const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
    let token;

    if (req.isAuthenticated && req.isAuthenticated()) {
        if (req.user.isBlocked) {
            return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact support.' });
        }
        return next();
    }

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            console.error(`AUTH_ERROR: User not found for id ${decoded.id}`);
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        if (req.user.isBlocked) {
            return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact support.' });
        }

        // Update last login
        req.user.lastLogin = Date.now();
        await req.user.save({ validateBeforeSave: false });

        next();
    } catch (err) {
        console.error(`AUTH_ERROR: Token verification failed: ${err.message}`);
        return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};
