const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Plan name is required'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
        },
        adLimit: {
            type: Number,
            required: [true, 'Ad limit is required'],
        },
        imageGenerationLimit: {
            type: Number,
            required: [true, 'Image generation limit is required'],
        },
        duration: {
            type: Number, // duration in days
            required: [true, 'Duration in days is required'],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
