require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { logSystem } = require('./utils/logger');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adRoutes = require('./routes/ads');
const categoryRoutes = require('./routes/categories');
const platformRoutes = require('./routes/platforms');
const transactionRoutes = require('./routes/transactions');
const adminRoutes = require('./routes/admin');
const adRequestRoutes = require('./routes/adRequests');
const subscriptionRoutes = require('./routes/subscription');
const templateRoutes = require('./routes/templates');

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "img-src": ["'self'", "data:", "https://image.pollinations.ai", "https://*.pollinations.ai"],
            },
        },
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

// CORS
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map(o => o.trim());

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g. Postman, curl) and whitelisted origins
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`CORS blocked: ${origin}`));
            }
        },
        credentials: true,
    })
);

// Body parser
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Cookie parser
app.use(cookieParser());

// Sanitize data (Prevent NoSQL Injection)
app.use(mongoSanitize());

// Session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Global Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again in 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// Stricter Auth Rate Limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many login/register attempts, please try again in 15 minutes',
});
app.use('/api/auth', authLimiter);

// Logger (dev only)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Static files (uploaded images)
const fs = require('fs');
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Root Auth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`, session: false }),
    (req, res) => {
        // Issue a JWT so frontend can use it directly (avoids cross-origin session cookie issue)
        const token = req.user.getSignedJwtToken();
        const user = encodeURIComponent(JSON.stringify({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            avatar: req.user.avatar,
        }));
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/callback?token=${token}&user=${user}`);
    }
);

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login`);
    });
});

// API Routes
app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ success: true, user: req.user });
    } else {
        res.status(401).json({ success: false, message: 'Not authenticated' });
    }
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ad-requests', adRequestRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/templates', templateRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Ad Agency API is running 🚀', timestamp: new Date() });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Ad Agency Management Portal API',
        version: '1.0.0',
        health: '/api/health'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    logSystem(`Server started in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    logSystem(`Unhandled Rejection: ${err.message}`, 'ERROR');
    server.close(() => {
        logSystem('Server shutdown due to unhandled rejection', 'WARNING');
        process.exit(1);
    });
});
