const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback',
            proxy: true,
        },
        async (accessToken, refreshToken, profile, done) => {
            const { id, displayName, emails, photos } = profile;
            const email = emails[0].value;
            const profileImage = photos[0]?.value;

            try {
                // Check if user already exists with this googleId or email
                let user = await User.findOne({
                    $or: [
                        { googleId: id },
                        { email: email }
                    ]
                });

                if (user) {
                    // Update user if they exist
                    user.googleId = id;
                    user.name = displayName;
                    user.avatar = profileImage || user.avatar;
                    user.lastLogin = Date.now();
                    user.loginProvider = 'google';
                    await user.save();
                    return done(null, user);
                }

                // Create new user if not found
                user = await User.create({
                    googleId: id,
                    name: displayName,
                    email: email,
                    avatar: profileImage,
                    loginProvider: 'google',
                    lastLogin: Date.now(),
                    isEmailVerified: true, // Google emails are typically verified
                });

                // Send welcome email (fire and forget)
                const { sendWelcomeEmail } = require('../utils/email');
                try {
                    await sendWelcomeEmail(user.email, user.name);
                } catch (error) {
                    console.error('Failed to send welcome email via Google OAuth:', error.message);
                }

                done(null, user);
            } catch (err) {
                console.error('Error in Google Strategy:', err);
                done(err, null);
            }
        }
    )
);

module.exports = passport;
