const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
    {
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Client is required'],
        },
        ads: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Ad',
            },
        ],

        // Campaign status
        status: {
            type: String,
            enum: ['draft', 'active', 'completed'],
            default: 'draft',
        },

        // Scheduling
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
        },

        // Targeting (Standardized)
        targetAudience: {
            genders: [
                { type: String },
            ],
            ageGroups: [
                { type: String },
            ],
            interests: [
                { type: String },
            ],
        },
    },
    {
        timestamps: true,
    }
);

campaignSchema.index({ client: 1, status: 1 });
campaignSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Campaign', campaignSchema);
