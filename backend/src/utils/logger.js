const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const LOGS_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Format the current date/time
const getTimestamp = () => {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
};

/**
 * Core function to append log messages asynchronously
 * @param {string} filename - name of the log file (e.g., activity.log)
 * @param {string} level - LOG level (INFO, ERROR, WARNING)
 * @param {string} message - Format: User XYZ did ABC
 */
const writeLog = (filename, level, message) => {
    const logFilePath = path.join(LOGS_DIR, filename);
    const logEntry = `[${getTimestamp()}] ${level.toUpperCase()}: ${message}\n`;

    // Append asynchronously to prevent blocking the event loop
    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) console.error(`Failed to write to ${filename}:`, err);
    });
};

/**
 * Log user activity actions
 * @param {string} userIdentifier - User email or ID
 * @param {string} action - What the user did
 * @param {string} status - 'success' or 'failure'
 */
const logActivity = (userIdentifier, action, status = 'success') => {
    const message = `User ${userIdentifier} ${action} - Status: ${status}`;
    writeLog('activity.log', 'INFO', message);
};

/**
 * Log system events (startup, shutdown, cron jobs)
 * @param {string} event - Description of the system event
 * @param {string} level - Event level (INFO, WARNING, ERROR)
 */
const logSystem = (event, level = 'INFO') => {
    writeLog('system.log', level, event);
};

/**
 * Log errors dynamically
 * @param {Error} err - The error object
 * @param {object} req - Optional Express request object for more context
 */
const logError = (err, req = null) => {
    let message = err.message || 'Unknown error occurred';

    if (req) {
        message += ` | Endpoint: ${req.method} ${req.originalUrl}`;
    }

    // Add stack trace to the next line for detailed debugging
    if (err.stack) {
        message += `\nStackTrace: ${err.stack.split('\n').slice(0, 3).join('\n')}`;
    }

    writeLog('error.log', 'ERROR', message);
};

module.exports = {
    logActivity,
    logSystem,
    logError,
};
