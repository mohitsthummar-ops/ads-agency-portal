const mongoose = require('mongoose');

const userSubscriptionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubscriptionPlan',
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        usage: {
            adsCreated: {
                type: Number,
                default: 0,
            },
            imagesGenerated: {
                type: Number,
                default: 0,
            },
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'cancelled'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

userSubscriptionSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('UserSubscription', userSubscriptionSchema);
