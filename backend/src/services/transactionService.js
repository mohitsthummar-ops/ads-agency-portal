const crypto = require('crypto');
const Razorpay = require('razorpay');
const Transaction = require('../models/Transaction');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const UserSubscription = require('../models/UserSubscription');
const { logActivity } = require('../utils/logger');

// Initialize Razorpay instance lazily
const getRazorpayInstance = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keySecret === 'your_razorpay_key_secret') {
        const error = new Error('Razorpay is not configured. Please add valid keys to your .env file.');
        error.statusCode = 400; // Return 400 instead of 500
        throw error;
    }
    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });
};

/**
 * Handle subscription payment success actions.
 */
const handleSubscriptionPayment = async (userId, packageId) => {
    const plan = await SubscriptionPlan.findById(packageId);
    if (plan) {
        const startDate = new Date();
        const expiryDate = new Date(startDate);
        expiryDate.setDate(expiryDate.getDate() + plan.duration);

        await UserSubscription.updateMany({ user: userId, status: 'active' }, { status: 'cancelled' });

        await UserSubscription.create({
            user: userId,
            plan: plan._id,
            startDate,
            expiryDate,
            usage: { adsCreated: 0, imagesGenerated: 0 },
            status: 'active'
        });
        logActivity(userId, `completed payment for subscription package ${plan.name}`);
    }
};

/**
 * Validate Razorpay webhook signature.
 */
const validateWebhookSignature = (body, signature, secret) => {
    const expectedSig = crypto.createHmac('sha256', secret).update(body).digest('hex');
    return signature === expectedSig;
};

module.exports = {
    getRazorpayInstance,
    handleSubscriptionPayment,
    validateWebhookSignature,
};
