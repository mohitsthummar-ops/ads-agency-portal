/**
 * Centralized API response formatter.
 * Ensures all endpoints return a consistent JSON shape.
 */

/**
 * Send a success response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {string} message - Human-readable message
 * @param {object} data - Additional data fields merged into the response body
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = {}) => {
    return res.status(statusCode).json({
        success: true,
        message,
        ...data,
    });
};

/**
 * Send an error response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Human-readable error message
 * @param {object} data - Optional extra fields
 */
const sendError = (res, statusCode = 500, message = 'Internal Server Error', data = {}) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...data,
    });
};

module.exports = { sendSuccess, sendError };
