const SubscriptionPlan = require('../models/SubscriptionPlan');
const UserSubscription = require('../models/UserSubscription');
const { logActivity } = require('../utils/logger');

/**
 * Format subscription object for frontend consumption.
 */
const formatSubscription = (sub) => {
    if (!sub) return null;
    return {
        _id: sub._id,
        packageName: sub.plan?.name || 'Unknown',
        startDate: sub.startDate,
        expiryDate: sub.expiryDate,
        imageLimit: sub.plan?.imageGenerationLimit || 0,
        imagesUsed: sub.usage?.imagesGenerated || 0,
        status: sub.status === 'active' ? 'Active' : (sub.status === 'expired' ? 'Expired' : 'Cancelled'),
    };
};

/**
 * Get all available subscription packages.
 * Auto-seeds default plans if the database is empty.
 */
const getPackages = async () => {
    let plans = await SubscriptionPlan.find();

    // Enforce exactly 4 plans
    if (plans.length !== 4) {
        await SubscriptionPlan.deleteMany({});
        plans = await SubscriptionPlan.create([
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
    }

    return plans.map(p => ({
        id: p._id,
        label: p.name,
        price: p.price,
        imageLimit: p.imageGenerationLimit,
        duration: p.duration
    }));
};

/**
 * Get user's current active subscription.
 * Auto-expires if past expiry date.
 */
const getMySubscription = async (userId) => {
    const userSub = await UserSubscription.findOne({ user: userId, status: 'active' }).populate('plan');
    if (!userSub) return null;

    if (new Date() > new Date(userSub.expiryDate)) {
        userSub.status = 'expired';
        await userSub.save();
    }

    return formatSubscription(userSub);
};

/**
 * Buy (or activate) a package.
 */
const buyPackage = async (userId, packageId) => {
    const plan = await SubscriptionPlan.findById(packageId);
    if (!plan) throw new Error('Invalid package selected');

    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + plan.duration);

    await UserSubscription.updateMany({ user: userId, status: 'active' }, { status: 'cancelled' });

    const newSub = await UserSubscription.create({
        user: userId,
        plan: plan._id,
        startDate,
        expiryDate,
        usage: { adsCreated: 0, imagesGenerated: 0 },
        status: 'active'
    });

    const populatedSub = await UserSubscription.findById(newSub._id).populate('plan');
    logActivity(userId, `activated subscription package ${plan.name}`);
    return { planName: plan.name, formattedSub: formatSubscription(populatedSub) };
};

module.exports = {
    formatSubscription,
    getPackages,
    getMySubscription,
    buyPackage,
};
