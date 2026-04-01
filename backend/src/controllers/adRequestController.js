const fs = require('fs');
const path = require('path');
const AdRequest = require('../models/AdRequest');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { generateAIImage } = require('../services/adRequestService');
const { logActivity } = require('../utils/logger');

// ─── CLIENT ───────────────────────────────────────────────────────────────────

/** POST /api/ad-requests  — submit a new campaign request */
exports.submitRequest = asyncHandler(async (req, res) => {
    // 1. Check if user is blocked or has a subscription (uncomment if strict subscription is required)
    const UserSubscription = require('../models/UserSubscription');
    const userSub = await UserSubscription.findOne({ user: req.user._id, status: 'active' });
    if (!userSub) {
        return sendError(res, 403, 'You need an active subscription to submit campaign requests.');
    }

    // 2. Extract only allowed fields to prevent injection of 'status' or 'generatedImages'
    const { title, businessName, description, imageStyle, targetAudience, offerDetails, contactInfo } = req.body;
    
    if (!title || !businessName || !description) {
        return sendError(res, 400, 'Title, Business Name, and Description are required.');
    }

    const request = await AdRequest.create({
        title,
        businessName,
        description,
        imageStyle,
        targetAudience,
        offerDetails,
        contactInfo,
        user: req.user._id,
        status: 'pending', // Force pending
        generatedImages: [], // Clear any injected images
    });

    logActivity(req.user._id, `submitted campaign request ${request._id}`);
    sendSuccess(res, 201, 'Campaign request submitted successfully!', { request });
});

/** GET /api/ad-requests/mine  — get current user's requests */
exports.getMyRequests = asyncHandler(async (req, res) => {
    const requests = await AdRequest.find({ user: req.user._id }).populate('generatedImages').sort({ createdAt: -1 }).lean();
    const formatted = requests.map(r => ({
        ...r,
        generatedImageUrl: r.generatedImages?.[r.generatedImages.length - 1]?.imageUrl || null
    }));
    sendSuccess(res, 200, 'Requests fetched', { requests: formatted });
});

/** POST /api/ad-requests/:id/generate-image — AI Generator */
exports.generateAIImage = asyncHandler(async (req, res) => {
    try {
        const { imageUrl, imagesUsed } = await generateAIImage(req.params.id, req.user._id);
        sendSuccess(res, 200, 'Image generated successfully!', { imageUrl, imagesUsed });
    } catch (err) {
        sendError(res, 400, err.message);
    }
});

/** GET /api/ad-requests/download — Proxy download */
exports.proxyDownload = asyncHandler(async (req, res) => {
    const { url, filename } = req.query;
    if (!url) return sendError(res, 400, 'URL is required');

    if (url.startsWith('/uploads/')) {
        const absolutePath = path.join(process.cwd(), url);
        if (fs.existsSync(absolutePath)) {
            return res.download(absolutePath, filename || path.basename(url));
        }
        return sendError(res, 404, 'Local image not found');
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch external image');

    const buffer = await response.arrayBuffer();
    res.set({
        'Content-Type': response.headers.get('content-type') || 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename || `ad_download_${Date.now()}.jpg`}"`,
        'Content-Length': buffer.byteLength
    });
    res.send(Buffer.from(buffer));
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────

/** GET /api/ad-requests  — admin: list all requests */
exports.getAllRequests = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const requests = await AdRequest.find(filter)
        .populate('user', 'name email companyName')
        .populate('generatedImages')
        .sort({ createdAt: -1 })
        .lean();

    const formatted = requests.map(r => ({
        ...r,
        generatedImageUrl: r.generatedImages?.[r.generatedImages.length - 1]?.imageUrl || null
    }));

    sendSuccess(res, 200, 'Requests fetched', { requests: formatted });
});

/** PUT /api/ad-requests/:id/approve  — admin: approve request */
exports.approveRequest = asyncHandler(async (req, res) => {
    const request = await AdRequest.findById(req.params.id);
    if (!request) return sendError(res, 404, 'Request not found');
    if (request.status !== 'pending') return sendError(res, 400, 'Request is already processed');

    request.status = 'approved';
    if (req.body.adminNote) request.adminNote = req.body.adminNote;
    await request.save();
    logActivity(req.user.id, `approved campaign request ${request._id}`);
    sendSuccess(res, 200, 'Request approved! Client can now generate AI image.', { request });
});

/** PUT /api/ad-requests/:id/reject  — admin: reject with reason */
exports.rejectRequest = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    if (!reason) return sendError(res, 400, 'Rejection reason is required');
    const request = await AdRequest.findById(req.params.id);
    if (!request) return sendError(res, 404, 'Request not found');
    if (request.status !== 'pending') return sendError(res, 400, 'Request is already processed');

    request.status = 'rejected';
    request.adminNote = reason;
    await request.save();
    logActivity(req.user.id, `rejected campaign request ${request._id}`);
    sendSuccess(res, 200, 'Request rejected', { request });
});
