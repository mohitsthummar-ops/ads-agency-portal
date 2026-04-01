const Template = require('../models/Template');

// @route   GET /api/templates
exports.getTemplates = async (req, res, next) => {
    try {
        const templates = await Template.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: templates.length, templates });
    } catch (err) { next(err); }
};

// @route   POST /api/templates (Optional admin only for later)
exports.createTemplate = async (req, res, next) => {
    try {
        const template = await Template.create(req.body);
        res.status(201).json({ success: true, template });
    } catch (err) { next(err); }
};
