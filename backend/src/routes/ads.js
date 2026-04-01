const express = require('express');
const router = express.Router();
const {
    getAllAds, getAdById,
    createAd, updateAd, approveAd, rejectAd, deleteAd,
    uploadAdImage,
} = require('../controllers/adController');
const { protect, authorize } = require('../middleware/auth');

// All ad reading options are protected
router.get('/', protect, getAllAds);
router.get('/:id', protect, getAdById);

// Admin only
router.post('/', protect, authorize('admin'), uploadAdImage, createAd);
router.put('/:id', protect, authorize('admin'), uploadAdImage, updateAd);
router.put('/:id/approve', protect, authorize('admin'), approveAd);
router.put('/:id/reject', protect, authorize('admin'), rejectAd);
router.delete('/:id', protect, authorize('admin'), deleteAd);

module.exports = router;
