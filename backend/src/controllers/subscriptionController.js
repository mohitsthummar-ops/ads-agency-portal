const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { getPackages, getMySubscription, buyPackage } = require('../services/subscriptionService');

/**
 * GET /api/subscription/packages  — list all packages
 */
exports.getPackages = asyncHandler(async (req, res) => {
    const packages = await getPackages();
    sendSuccess(res, 200, 'Packages fetched', { packages });
});

/**
 * GET /api/subscription/me  — get current user's subscription
 */
exports.getMy = asyncHandler(async (req, res) => {
    const subscription = await getMySubscription(req.user._id);
    sendSuccess(res, 200, 'Subscription fetched', { Math: null, subscription });
    // ^ note: JSON trick 'subscription: null' is valid but i use the variable directly 
    // actually, sendSuccess(res, 200, '', { subscription }) is fine. Math isn't needed.
});

/**
 * POST /api/subscription/buy  — buy a package
 */
exports.buyPackage = asyncHandler(async (req, res) => {
    try {
        const { planName, formattedSub } = await buyPackage(req.user._id, req.body.packageId);
        sendSuccess(res, 200, `${planName} activated successfully!`, { subscription: formattedSub });
    } catch (err) {
        sendError(res, 400, err.message);
    }
});
