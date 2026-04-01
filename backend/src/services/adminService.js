const User = require('../models/User');
const Ad = require('../models/Ad');
const AdRequest = require('../models/AdRequest');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Platform = require('../models/Platform');
const { logActivity } = require('../utils/logger');

/**
 * Get overall dashboard stats with rich analytics focused on Ad Generation.
 */
const getDashboardStats = async () => {
    // Basic Counts
    const [totalUsers, totalRequests, completedRequests, totalTransactions] = await Promise.all([
        User.countDocuments({ role: 'client' }),
        AdRequest.countDocuments(),
        AdRequest.countDocuments({ status: 'completed' }),
        Transaction.countDocuments({ status: 'paid' }),
    ]);

    // Total AI Generations (Sum of arrays in all requests)
    const generationAgg = await AdRequest.aggregate([
        { $project: { generationCount: { $size: { $ifNull: ["$generatedImages", []] } } } },
        { $group: { _id: null, total: { $sum: "$generationCount" } } }
    ]);
    const totalGenerations = generationAgg[0]?.total || 0;

    // Revenue Aggregation
    const revenueAgg = await Transaction.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const rawTotalRevenue = revenueAgg[0]?.total || 0;

    // Requests by Status Breakdown
    const requestsByStatus = await AdRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Trend (Last 6 Months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const month = d.getMonth() + 1;
        const year = d.getFullYear();

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59);

        const [revenue, users] = await Promise.all([
            Transaction.aggregate([
                { $match: { status: 'paid', createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            User.countDocuments({ role: 'client', createdAt: { $gte: startOfMonth, $lte: endOfMonth } })
        ]);

        trendData.push({
            month: monthNames[month - 1],
            revenue: revenue[0]?.total || 0,
            users: users || 0
        });
    }

    // Category Distribution (Top 5)
    const categoryStats = await Ad.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'categoryInfo'
            }
        },
        { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
        { $project: { name: { $ifNull: ['$categoryInfo.name', 'Others'] }, count: 1 } }
    ]);

    // Recent Activity (Simple join)
    const recentTransactions = await Transaction.find({ status: 'paid' })
        .sort('-createdAt')
        .limit(5)
        .populate('user', 'name email')
        .lean();

    // Daily Requests (Last 7 Days)
    const dailyRequests = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

        const count = await AdRequest.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } });
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

        dailyRequests.push({ day: dayName, count });
    }

    return {
        summary: {
            totalUsers,
            totalRequests,
            completedRequests,
            totalGenerations,
            totalTransactions,
            totalRevenue: rawTotalRevenue,
            formattedRevenue: `₹${rawTotalRevenue >= 100000 ? (rawTotalRevenue / 100000).toFixed(2) + 'L' : rawTotalRevenue.toLocaleString()}`,
        },
        requestsByStatus: requestsByStatus.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
        trendData,
        dailyRequests,
        categoryStats,
        recentActivity: recentTransactions
    };
};

/**
 * Get users with pagination and search.
 */
const getUsers = async (search, skip, limit) => {
    const query = {};
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }
    const [users, total] = await Promise.all([
        User.find(query)
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .select('-password')
            .lean(),
        User.countDocuments(query),
    ]);
    return { users, total };
};

/**
 * Block or unblock a user.
 */
const toggleUserBlock = async (id, adminId = 'Unknown') => {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    if (user.role === 'admin') throw new Error('Cannot block an admin');
    user.isBlocked = !user.isBlocked;
    await user.save();
    logActivity(adminId, `${user.isBlocked ? 'blocked' : 'unblocked'} user ${user.email}`);
    return user.isBlocked;
};

/**
 * Delete a user.
 */
const deleteUser = async (id, adminId = 'Unknown') => {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    if (user.role === 'admin') throw new Error('Cannot delete an admin');
    await user.deleteOne();
    logActivity(adminId, `deleted user ${user.email}`);
    return true;
};

module.exports = {
    getDashboardStats,
    getUsers,
    toggleUserBlock,
    deleteUser,
};
