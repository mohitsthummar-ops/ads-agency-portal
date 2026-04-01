const mongoose = require('mongoose');

const generatedImageSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        adRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AdRequest',
            default: null,
        },
        ad: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ad',
            default: null,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        promptUsed: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

generatedImageSchema.index({ user: 1 });
generatedImageSchema.index({ adRequest: 1 });

module.exports = mongoose.model('GeneratedImage', generatedImageSchema);
