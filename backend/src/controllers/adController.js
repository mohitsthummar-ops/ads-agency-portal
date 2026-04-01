const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { createUploader } = require('../utils/upload');
const adService = require('../services/adService');

// ─── Multer for ad images ─────────────────────────────────────────────────────
exports.uploadAdImage = createUploader('ads', 'ad', 5).single('image');

// ─── @route   GET /api/ads ────────────────────────────────────────────────────
exports.getAllAds = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query, 12);
    const { ads, total } = await adService.getAds(req.query, skip, limit);
    const pagination = buildPaginationMeta(total, page, limit);

    sendSuccess(res, 200, 'Ads fetched successfully', { ads, pagination });
});

// ─── @route   GET /api/ads/:id ────────────────────────────────────────────────
exports.getAdById = asyncHandler(async (req, res) => {
    const ad = await adService.getAdById(req.params.id);
    if (!ad) return sendError(res, 404, 'Ad not found');
    sendSuccess(res, 200, 'Ad fetched successfully', { ad });
});

// ─── @route   POST /api/ads [Admin] ──────────────────────────────────────────
exports.createAd = asyncHandler(async (req, res) => {
    const adData = { ...req.body, createdBy: req.user.id };
    if (req.file) adData.image = `/uploads/ads/${req.file.filename}`;

    const ad = await adService.createAd(adData);
    sendSuccess(res, 201, 'Ad created successfully', { ad });
});

// ─── @route   PUT /api/ads/:id [Admin] ───────────────────────────────────────
exports.updateAd = asyncHandler(async (req, res) => {
    const updates = { ...req.body };
    if (req.file) updates.image = `/uploads/ads/${req.file.filename}`;

    const ad = await adService.updateAd(req.params.id, updates, req.user.id);
    if (!ad) return sendError(res, 404, 'Ad not found');
    sendSuccess(res, 200, 'Ad updated successfully', { ad });
});

// ─── @route   PUT /api/ads/:id/approve [Admin] ───────────────────────────────
exports.approveAd = asyncHandler(async (req, res) => {
    const ad = await adService.approveAd(req.params.id, req.user.id);
    if (!ad) return sendError(res, 404, 'Ad not found');
    sendSuccess(res, 200, 'Ad approved', { ad });
});

// ─── @route   PUT /api/ads/:id/reject [Admin] ────────────────────────────────
exports.rejectAd = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    if (!reason) return sendError(res, 400, 'Rejection reason is required');

    const ad = await adService.rejectAd(req.params.id, reason, req.user.id);
    if (!ad) return sendError(res, 404, 'Ad not found');
    sendSuccess(res, 200, 'Ad rejected', { ad });
});

// ─── @route   DELETE /api/ads/:id [Admin] ────────────────────────────────────
exports.deleteAd = asyncHandler(async (req, res) => {
    const ad = await adService.deleteAd(req.params.id, req.user.id);
    if (!ad) return sendError(res, 404, 'Ad not found');
    sendSuccess(res, 200, 'Ad deleted successfully');
});
