/**
 * Wraps an async Express route handler so that any thrown error is
 * automatically forwarded to the global error-handling middleware via next(err).
 *
 * Usage:
 *   exports.myController = asyncHandler(async (req, res, next) => { ... });
 *
 * @param {Function} fn - async (req, res, next) => void
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
