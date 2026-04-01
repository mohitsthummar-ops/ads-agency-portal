const express = require('express');
const router = express.Router();
const {
    getDashboardStats, getUsers, blockUser, deleteUser,
    getAllAds, getAllTransactions, getSettings, updateSettings,
} = require('../controllers/adminController');
const {
    approveAd, rejectAd, deleteAd,
} = require('../controllers/adController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin')); // All admin routes are protected + admin-only

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/block', blockUser);
router.delete('/users/:id', deleteUser);
router.get('/ads', getAllAds);
router.put('/ads/:id/approve', approveAd);
router.put('/ads/:id/reject', rejectAd);
router.delete('/ads/:id', deleteAd);
router.get('/transactions', getAllTransactions);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
