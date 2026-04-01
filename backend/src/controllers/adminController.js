const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const adminService = require('../services/adminService');
const adService = require('../services/adService');
const Transaction = require('../models/Transaction');

// ─── @route   GET /api/admin/stats ───────────────────────────────────────────
exports.getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await adminService.getDashboardStats();
    sendSuccess(res, 200, 'Dashboard stats fetched successfully', stats);
});

// ─── @route   GET /api/admin/users ───────────────────────────────────────────
exports.getUsers = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query, 50);
    const { users, total } = await adminService.getUsers(req.query.search, skip, limit);
    const pagination = buildPaginationMeta(total, page, limit);

    sendSuccess(res, 200, 'Users fetched successfully', { users, total, pagination });
});

// ─── @route   PUT /api/admin/users/:id/block ─────────────────────────────────
exports.blockUser = asyncHandler(async (req, res) => {
    try {
        const isBlocked = await adminService.toggleUserBlock(req.params.id, req.user.id);
        sendSuccess(res, 200, isBlocked ? 'User blocked' : 'User unblocked', { isBlocked });
    } catch (err) {
        sendError(res, err.message === 'Cannot block an admin' ? 400 : 404, err.message);
    }
});

// ─── @route   DELETE /api/admin/users/:id ────────────────────────────────────
exports.deleteUser = asyncHandler(async (req, res) => {
    try {
        await adminService.deleteUser(req.params.id, req.user.id);
        sendSuccess(res, 200, 'User deleted');
    } catch (err) {
        sendError(res, err.message === 'Cannot delete an admin' ? 400 : 404, err.message);
    }
});

// ─── @route   GET /api/admin/ads ─────────────────────────────────────────────
exports.getAllAds = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query, 30);
    const { ads, total } = await adService.getAds(req.query, skip, limit);

    sendSuccess(res, 200, 'Ads fetched successfully', { ads, total });
});

// ─── @route   GET /api/admin/transactions ────────────────────────────────────
exports.getAllTransactions = asyncHandler(async (req, res) => {
    const transactions = await Transaction.find()
        .populate('user', 'name email')
        .sort('-createdAt')
        .limit(100)
        .lean();
    sendSuccess(res, 200, 'Transactions fetched successfully', { transactions });
});

// ─── Settings (in-memory for now) ─────────────
let _settings = {
    siteName: 'AdAgency Portal',
    siteEmail: 'hello@adagency.com',
    sitePhone: '+91 98765 43210',
    siteAddress: '123 Ad Street, Mumbai, India',
    heroBannerTitle: 'Power Your Brand With Smart Ads',
    heroBannerSubtitle: 'Discover, track, and manage campaigns all in one place.',
    heroBannerCTA: 'Get Started Free',
    announcementBar: '',
    privacyPolicy: '',
    termsConditions: '',
};

exports.getSettings = asyncHandler(async (req, res) => {
    sendSuccess(res, 200, 'Settings fetched', { settings: _settings });
});

exports.updateSettings = asyncHandler(async (req, res) => {
    _settings = { ..._settings, ...req.body };
    sendSuccess(res, 200, 'Settings updated', { settings: _settings });
});
