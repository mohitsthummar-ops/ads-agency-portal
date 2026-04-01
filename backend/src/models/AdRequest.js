const mongoose = require('mongoose');

const adRequestSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Campaign title is required'],
            trim: true,
            maxlength: [120, 'Title cannot exceed 120 characters'],
        },
        businessName: {
            type: String,
            required: [true, 'Business name is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        offerDetails: {
            type: String,
            trim: true,
        },
        contactInfo: {
            type: String,
            trim: true,
        },
        logoUrl: {
            type: String,
            trim: true,
        },
        imageStyle: {
            type: String,
            default: 'Instagram Post',
        },
        targetAudience: {
            type: String,
            trim: true,
        },
        deadline: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'completed'],
            default: 'pending',
        },
        adminNote: {
            type: String,
            trim: true,
        },
        generatedImages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'GeneratedImage'
            }
        ]
    },
    { timestamps: true }
);

adRequestSchema.index({ user: 1, status: 1 });
adRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('AdRequest', adRequestSchema);
