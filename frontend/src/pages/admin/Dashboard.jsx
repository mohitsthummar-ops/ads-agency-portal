import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, Megaphone, Monitor, IndianRupee,
    TrendingUp, UserCheck, ShoppingBag, Activity
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg text-xs">
            <p className="text-slate-500 mb-1 font-medium">{label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.color }} className="font-medium">
                    {p.name}: <span className="text-slate-800 font-bold">{p.value}</span>
                </p>
            ))}
        </div>
    );
};

function StatCard({ icon: Icon, value, label, change, color }) {
    return (
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] card-hover relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: `${color}15`, color: color }}>
                    <Icon className="w-5 h-5" />
                </div>
                {change !== undefined && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {change >= 0 ? '+' : ''}{change}%
                    </span>
                )}
            </div>
            <p className="text-3xl font-bold text-slate-800 mb-1 relative z-10">{value}</p>
            <p className="text-slate-500 text-sm font-medium relative z-10">{label}</p>

            {/* Decorative background accent */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 pointer-events-none" style={{ background: color, filter: 'blur(30px)' }} />
        </div>
    );
}

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminAPI.getDashboardStats()
            .then((r) => setStats(r.data))
            .catch(() => {
                toast.error('Failed to load dashboard metrics');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const statCards = [
        { icon: Users, value: stats?.summary?.totalUsers?.toLocaleString() || '0', label: 'Total Users', color: '#3b82f6' },
        { icon: Megaphone, value: stats?.summary?.totalRequests?.toLocaleString() || '0', label: 'Ad Requests', color: '#0ea5e9' },
        { icon: Monitor, value: stats?.summary?.totalGenerations?.toLocaleString() || '0', label: 'AI Generations', color: '#8b5cf6' },
        { icon: IndianRupee, value: stats?.summary?.formattedRevenue || '₹0', label: 'Total Revenue', color: '#10b981' },
    ];

    const revenueData = stats?.trendData || [];
    const adStatusData = stats?.requestsByStatus ? Object.entries(stats.requestsByStatus).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
    })) : [];
    const requestTrendData = stats?.dailyRequests || [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1 tracking-tight">Admin Dashboard</h1>
                <p className="text-slate-500 text-sm font-medium">Overview of platform performance and real-time metrics.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}>
                        <StatCard {...card} />
                    </motion.div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Area Chart */}
                <div className="lg:col-span-2 glass-card p-6 bg-white border border-slate-200">
                    <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" /> Revenue & User Growth (Last 6 Months)
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val >= 1000 ? val / 1000 + 'k' : val}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#3b82f6" fill="url(#colorRevenue)" strokeWidth={3} />
                            <Area type="monotone" dataKey="users" name="New Users" stroke="#0ea5e9" fill="url(#colorUsers)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="glass-card p-6 bg-white border border-slate-200">
                    <h3 className="text-slate-800 font-bold mb-4">Request Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie data={adStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={85}
                                paddingAngle={5} dataKey="value" stroke="none">
                                {adStatusData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', fontWeight: 500 }}
                                formatter={(v) => <span className="text-slate-600">{v}</span>} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="glass-card p-6 bg-white border border-slate-200">
                <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" /> Daily Ad Requests (Last 7 Days)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={requestTrendData} barSize={36} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="count" name="Requests" radius={[6, 6, 0, 0]}>
                            {requestTrendData.map((_, i) => (
                                <Cell key={i} fill={`url(#barGrad${i % 2})`} />
                            ))}
                        </Bar>
                        <defs>
                            {[0, 1].map((i) => (
                                <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={i === 0 ? '#3b82f6' : '#0ea5e9'} />
                                    <stop offset="100%" stopColor={i === 0 ? '#2563eb' : '#0284c7'} />
                                </linearGradient>
                            ))}
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

