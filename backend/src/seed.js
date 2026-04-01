/**
 * Database Seed Script
 * Populates all MongoDB collections with sample data matching the new clean schema
 * Run: node seed.js or node src/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const Category = require('./models/Category');
const Platform = require('./models/Platform');
const Ad = require('./models/Ad');
const Campaign = require('./models/Campaign');
const Transaction = require('./models/Transaction');
const User = require('./models/User');
const SubscriptionPlan = require('./models/SubscriptionPlan');
const UserSubscription = require('./models/UserSubscription');
const GeneratedImage = require('./models/GeneratedImage');
const AdRequest = require('./models/AdRequest');

async function seed() {
    await connectDB();
    console.log('🌱 Starting database seed...\n');

    // Clear out existing data for a fresh seed
    await User.deleteMany({});
    await SubscriptionPlan.deleteMany({});
    await UserSubscription.deleteMany({});
    await GeneratedImage.deleteMany({});
    await Campaign.deleteMany({});
    await Ad.deleteMany({});
    await AdRequest.deleteMany({});
    await Category.deleteMany({});
    await Platform.deleteMany({});

    console.log('🧹 Database cleared...\n');

    // ═══════════════════════════════════════════════════════════
    //  1. CATEGORIES & PLATFORMS
    // ═══════════════════════════════════════════════════════════
    await Category.create([
        { name: 'Electronics', type: 'Electronics', icon: '💻', color: '#3b82f6', description: 'Gadgets, devices, and tech products' },
        { name: 'Fashion', type: 'Fashion', icon: '👗', color: '#ec4899', description: 'Clothing, shoes, and accessories' },
        { name: 'Real Estate', type: 'Real Estate', icon: '🏠', color: '#10b981', description: 'Property and homes' }
    ]);
    const categories = await Category.find();

    await Platform.create([
        { name: 'Instagram', icon: '📸', website: 'https://www.instagram.com' },
        { name: 'Facebook', icon: '📘', website: 'https://www.facebook.com' },
        { name: 'LinkedIn', icon: '💼', website: 'https://www.linkedin.com' }
    ]);
    const platforms = await Platform.find();

    // ═══════════════════════════════════════════════════════════
    //  2. USERS (Admin and Client)
    // ═══════════════════════════════════════════════════════════
    const adminUser = await User.create({
        name: 'Nikon Admin',
        email: 'nikonlinemarket@gmail.com',
        password: 'admin 123',
        role: 'admin',
        isEmailVerified: true,
    });
    console.log('✅ Admin user created (nikonlinemarket@gmail.com / admin123)');

    const adminUser2 = await User.create({
        name: 'Kaushal Admin',
        email: 'kaushalpthummar@gmail.com',
        password: 'admin 123',
        role: 'admin',
        isEmailVerified: true,
    });
    console.log('✅ Admin user created (kaushalpthummar@gmal.com / admin123)');

    const userMohit = await User.create({
        name: 'Mohit Thummar',
        email: 'mohitsthummar@gmail.com',
        password: 'password123',
        role: 'client',
        isEmailVerified: true,
    });
    console.log('✅ User mohitsthummar@gmail.com created with admin role');

    const clientUser = await User.create({
        name: 'John Client',
        email: 'client@gmail.com',
        password: 'client123',
        role: 'client',
        companyName: 'Acme Corp',
        isEmailVerified: true,
    });
    console.log('✅ Client user created (client@gmail.com / client123)');

    // ═══════════════════════════════════════════════════════════
    //  3. SUBSCRIPTION PLANS & USER SUBSCRIPTIONS
    // ═══════════════════════════════════════════════════════════
    await SubscriptionPlan.create([
        {
            name: 'Demo',
            price: 0,
            adLimit: 5,
            imageGenerationLimit: 10,
            duration: 7
        },
        {
            name: '1 Month',
            price: 299,
            adLimit: 100,
            imageGenerationLimit: 250,
            duration: 30
        },
        {
            name: '6 Months',
            price: 999,
            adLimit: 1000,
            imageGenerationLimit: 2000,
            duration: 180
        },
        {
            name: '1 Year',
            price: 1999,
            adLimit: 2000,
            imageGenerationLimit: 5000,
            duration: 365
        }
    ]);
    const plans = await SubscriptionPlan.find();
    const demoPlan = plans.find(p => p.name === 'Demo');
    const oneMonthPlan = plans.find(p => p.name === '1 Month');

    // Sub for mohitsthummar (Active Demo Plan)
    await UserSubscription.create({
        user: userMohit._id,
        plan: demoPlan._id,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        usage: { adsCreated: 0, imagesGenerated: 0 },
        status: 'active'
    });

    // Sub for client (Active Pro Plan)
    await UserSubscription.create({
        user: clientUser._id,
        plan: oneMonthPlan._id,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usage: { adsCreated: 5, imagesGenerated: 12 },
        status: 'active'
    });
    console.log('✅ Demo and Pro Subscriptions created for accounts');

    // ═══════════════════════════════════════════════════════════
    //  4. CAMPAIGNS, ADS, REQUESTS, IMAGES
    // ═══════════════════════════════════════════════════════════

    // Request
    const adReq = await AdRequest.create({
        user: clientUser._id,
        title: 'Spring Tech Launch',
        businessName: 'Acme Corp',
        description: 'New laptop models reveal.',
        targetAudience: 'Tech enthusiasts, 18-35 years old',
        status: 'completed',
    });

    // Image
    const genImage = await GeneratedImage.create({
        user: clientUser._id,
        adRequest: adReq._id,
        imageUrl: '/uploads/ads/sample-macbook.jpg',
        promptUsed: 'A futuristic laptop glowing on a sleek office desk, ultra-realistic.'
    });
    adReq.generatedImages.push(genImage._id);
    await adReq.save();

    // Campaign
    const now = new Date();
    const camp = await Campaign.create({
        client: clientUser._id,
        status: 'active',
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 2, 0),
        targetAudience: { genders: ['all'], ageGroups: ['18-35'], interests: ['Electronics'] },
    });

    // Ad
    const ad = await Ad.create({
        title: 'MacBook Pro 2026',
        description: 'Experience the ultimate performance.',
        image: '/uploads/ads/sample-macbook.jpg',
        visitLink: 'https://www.acme.com',
        category: categories[0]._id,
        platform: platforms[0]._id,
        targetAudience: { genders: ['all'], ageGroups: ['18-35'], interests: ['Electronics'] },
        status: 'active',
        campaign: camp._id,
        createdBy: adminUser._id,
        generatedImages: [genImage._id]
    });
    camp.ads.push(ad._id);
    await camp.save();

    console.log('✅ Campaigns, Ads, AdRequests, and GeneratedImages created');

    console.log('\n════════════════════════════════════════════');
    console.log('  🎉 Database seeding completed!');
    console.log('════════════════════════════════════════════\n');
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
});
