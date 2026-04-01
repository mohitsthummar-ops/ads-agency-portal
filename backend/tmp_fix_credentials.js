require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function fixCredentials() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const updates = [
            { old: 'kaushalpthummar@gmal.com', new_email: 'kaushalpthummar@gmail.com', pass: 'admin 123' },
            { old: 'kaushalpthummar@gmail.com', new_email: 'kaushalpthummar@gmail.com', pass: 'admin 123' },
            { old: 'nikonlinemarket@gmail.com', new_email: 'nikonlinemarket@gmail.com', pass: 'admin 123' }
        ];

        for (const up of updates) {
            const user = await User.findOne({ email: up.old });
            if (user) {
                user.email = up.new_email;
                user.password = up.pass;
                user.role = 'admin';
                await user.save();
                console.log(`✅ Updated ${up.new_email}`);
            } else {
                console.log(`ℹ️ User ${up.old} not found, checking next.`);
            }
        }

        console.log('✅ Finalizing updates...');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error fixing credentials:', err.message);
        process.exit(1);
    }
}

fixCredentials();
