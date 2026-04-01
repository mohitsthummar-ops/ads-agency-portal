const Ad = require('../models/Ad');
const { logActivity } = require('../utils/logger');

/**
 * Get all ads based on query parameters.
 */
const getAds = async (queryFilters, skip, limit) => {
    const { category, platform, status, search, campaign } = queryFilters;
    const query = {};
    if (category) query.category = category;
    if (platform) query.platform = platform;
    if (status) query.status = status;
    if (campaign) query.campaign = campaign;
    if (search) query.title = { $regex: search, $options: 'i' };

    const [ads, total] = await Promise.all([
        Ad.find(query)
            .populate('category', 'name color')
            .populate('platform', 'name icon')
            .populate('createdBy', 'name')
            .populate('generatedImages')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .lean(),
        Ad.countDocuments(query),
    ]);

    return { ads, total };
};

/**
 * Get a single ad by ID.
 */
const getAdById = async (id) => {
    return await Ad.findById(id)
        .populate('category', 'name color slug')
        .populate('platform', 'name icon website')
        .populate('createdBy', 'name')
        .populate('generatedImages');
};

/**
 * Create a new ad.
 */
const createAd = async (adData) => {
    const ad = await Ad.create(adData);
    logActivity(adData.createdBy, `created ad ${ad._id}`);
    return ad;
};

/**
 * Update an existing ad.
 */
const updateAd = async (id, updates, adminId = 'Unknown') => {
    const ad = await Ad.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (ad) logActivity(adminId, `updated ad ${id}`);
    return ad;
};

/**
 * Approve an ad.
 */
const approveAd = async (id, adminId = 'Unknown') => {
    const ad = await Ad.findByIdAndUpdate(
        id,
        { status: 'active', rejectionReason: null },
        { new: true }
    );
    if (ad) logActivity(adminId, `approved ad ${id}`);
    return ad;
};

/**
 * Reject an ad.
 */
const rejectAd = async (id, reason, adminId = 'Unknown') => {
    const ad = await Ad.findByIdAndUpdate(
        id,
        { status: 'rejected', rejectionReason: reason },
        { new: true }
    );
    if (ad) logActivity(adminId, `rejected ad ${id}`);
    return ad;
};

/**
 * Delete an ad.
 */
const deleteAd = async (id, adminId = 'Unknown') => {
    const ad = await Ad.findByIdAndDelete(id);
    if (ad) logActivity(adminId, `deleted ad ${id}`);
    return ad;
};

module.exports = {
    getAds,
    getAdById,
    createAd,
    updateAd,
    approveAd,
    rejectAd,
    deleteAd,
};
