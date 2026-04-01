const multer = require('multer');
const path = require('path');

/**
 * Factory that creates a configured multer middleware for a given upload sub-folder.
 *
 * @param {string} subDir  - Sub-folder under /uploads (e.g. 'ads', 'avatars')
 * @param {string} prefix  - Filename prefix (e.g. 'ad', 'avatar')
 * @param {number} maxSizeMB - Maximum file size in megabytes (default 5)
 * @returns {multer.Multer}
 */
const createUploader = (subDir, prefix = 'file', maxSizeMB = 5) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, `uploads/${subDir}/`),
        filename: (req, file, cb) =>
            cb(null, `${prefix}-${Date.now()}${path.extname(file.originalname)}`),
    });
    return multer({
        storage,
        limits: { fileSize: maxSizeMB * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const allowed = /jpeg|jpg|png|gif|webp/;
            const ext = allowed.test(path.extname(file.originalname).toLowerCase());
            const mime = allowed.test(file.mimetype);
            if (ext && mime) return cb(null, true);
            cb(new Error('Only image files are allowed'));
        },
    });
};

module.exports = { createUploader };
