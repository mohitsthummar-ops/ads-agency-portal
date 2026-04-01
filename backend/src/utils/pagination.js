/**
 * Reusable pagination helpers.
 */

/**
 * Parse pagination query params from a request.
 * @param {object} query - req.query
 * @param {number} defaultLimit - default items per page
 * @returns {{ page: number, limit: number, skip: number }}
 */
const parsePagination = (query, defaultLimit = 20) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, parseInt(query.limit, 10) || defaultLimit);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

/**
 * Build a standard pagination metadata object to include in responses.
 * @param {number} total - total number of documents
 * @param {number} page
 * @param {number} limit
 * @returns {object}
 */
const buildPaginationMeta = (total, page, limit) => ({
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
});

module.exports = { parsePagination, buildPaginationMeta };
