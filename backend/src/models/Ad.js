const mongoose = require('mongoose');

const adSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Ad title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Ad description is required'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        image: {
            type: String, // URL/path to image
            required: [true, 'Ad image is required'],
        },
        visitLink: {
            type: String,
            required: [true, 'Visit link is required'],
            match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
        },

        // Classification
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required'],
        },
        platform: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Platform',
            required: [true, 'Platform is required'],
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

        // Status & approval
        status: {
            type: String,
            enum: ['pending', 'active', 'paused', 'rejected', 'expired'],
            default: 'pending',
        },
        rejectionReason: {
            type: String,
            default: null,
        },

        // Campaign association
        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Campaign',
            default: null,
        },

        // Created by (admin or client)
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Scheduling
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date,
            default: null,
        },

        tags: [String],

        generatedImages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'GeneratedImage'
            }
        ]
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
adSchema.index({ status: 1, category: 1, platform: 1 });
adSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Ad', adSchema);
