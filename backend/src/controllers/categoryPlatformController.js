const Category = require('../models/Category');
const Platform = require('../models/Platform');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');

// ══════════════════════════════════════════════════════════════════════════════
//  CATEGORY CONTROLLER
// ══════════════════════════════════════════════════════════════════════════════

exports.getAllCategories = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    const categories = await Category.find(filter).sort('sortOrder name').lean();
    sendSuccess(res, 200, 'Categories fetched', { categories });
});

exports.getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) return sendError(res, 404, 'Category not found');
    sendSuccess(res, 200, 'Category fetched', { category });
});

exports.createCategory = asyncHandler(async (req, res) => {
    const category = await Category.create(req.body);
    sendSuccess(res, 201, 'Category created', { category });
});

exports.updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return sendError(res, 404, 'Category not found');
    sendSuccess(res, 200, 'Category updated', { category });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return sendError(res, 404, 'Category not found');
    sendSuccess(res, 200, 'Category deleted');
});

exports.toggleCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) return sendError(res, 404, 'Category not found');
    category.isActive = !category.isActive;
    await category.save();
    sendSuccess(res, 200, 'Category status toggled', { category });
});

// ══════════════════════════════════════════════════════════════════════════════
//  PLATFORM CONTROLLER
// ══════════════════════════════════════════════════════════════════════════════

exports.getAllPlatforms = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    const platforms = await Platform.find(filter).sort('sortOrder name').lean();
    sendSuccess(res, 200, 'Platforms fetched', { platforms });
});

exports.getPlatformById = asyncHandler(async (req, res) => {
    const platform = await Platform.findById(req.params.id);
    if (!platform) return sendError(res, 404, 'Platform not found');
    sendSuccess(res, 200, 'Platform fetched', { platform });
});

exports.createPlatform = asyncHandler(async (req, res) => {
    const platform = await Platform.create(req.body);
    sendSuccess(res, 201, 'Platform created', { platform });
});

exports.updatePlatform = asyncHandler(async (req, res) => {
    const platform = await Platform.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!platform) return sendError(res, 404, 'Platform not found');
    sendSuccess(res, 200, 'Platform updated', { platform });
});

exports.deletePlatform = asyncHandler(async (req, res) => {
    const platform = await Platform.findByIdAndDelete(req.params.id);
    if (!platform) return sendError(res, 404, 'Platform not found');
    sendSuccess(res, 200, 'Platform deleted');
});

exports.togglePlatform = asyncHandler(async (req, res) => {
    const platform = await Platform.findById(req.params.id);
    if (!platform) return sendError(res, 404, 'Platform not found');
    platform.isActive = !platform.isActive;
    await platform.save();
    sendSuccess(res, 200, 'Platform status toggled', { platform });
});
