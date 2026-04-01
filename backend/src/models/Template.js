const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        platform: { type: String, required: true },
        industry: { type: String, required: true },
        audience: { type: String, required: true },
        description: { type: String },
        offerDetails: { type: String },
        hashtags: [{ type: String }],
        imageUrl: { type: String, required: true },
        imageStyle: { type: String, default: 'Instagram Post' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Template', templateSchema);
