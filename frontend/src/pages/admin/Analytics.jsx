import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, MousePointerClick, Users, IndianRupee,
    ArrowUpRight, ArrowDownRight, Activity, PieChart as PieIcon,
    RefreshCcw, Calendar, CheckCircle2, Clock, Sparkles, FileEdit, Zap
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl p-4 text-xs z-50 min-w-[140px]">
            <p className="text-slate-400 mb-3 font-semibold uppercase tracking-wider">{label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.color }} className="flex items-center gap-3 py-1 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: p.color }} />
                    {p.name}: <span className="text-slate-900 ml-auto tracking-tight">
                        {p.name.includes('Revenue') ? `₹${p.value.toLocaleString()}` : p.value.toLocaleString()}
                    </span>
                </p>
            ))}
        </div>
    );
};

export default function Analytics() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            setRefreshing(true);
            const res = await adminAPI.getDashboardStats();
            if (res.data.success) {
                setStats(res.data);
            }
        } catch (err) {
            toast.error('Failed to update analytics');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse tracking-tight text-sm">Syncing AI Generation Metrics...</p>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
                <div className="w-16 h-16 bg-rose-50 flex items-center justify-center rounded-2xl border border-rose-100 shadow-sm shadow-rose-500/10 active:scale-95 transition-transform" onClick={fetchStats}>
                    <Activity className="w-8 h-8 text-rose-500" />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Intelligence Offline</h3>
                    <p className="text-slate-500 text-sm mt-1 max-w-[280px] font-medium leading-relaxed">The AI analytics engine couldn't be reached. Please check your connection.</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="bg-indigo-600 px-8 py-3 rounded-2xl text-white font-bold text-sm shadow-xl shadow-indigo-100 hover:shadow-indigo-200 active:scale-95 transition-all"
                >
                    Re-Sync Engine
                </button>
            </div>
        );
    }

    const summaryData = [
        { icon: Users, value: stats.summary?.totalUsers || 0, label: 'Creative Users', color: '#6366f1', diff: '+12%', up: true },
        { icon: IndianRupee, value: stats.summary?.formattedRevenue || '₹0L', label: 'Total Sales', color: '#10b981', diff: '+8%', up: true },
        { icon: Sparkles, value: stats.summary?.totalGenerations || 0, label: 'AI Generations', color: '#f59e0b', diff: '+24%', up: true },
        { icon: FileEdit, value: stats.summary?.totalRequests || 0, label: 'Ad Requests', color: '#ec4899', diff: 'Workflow', up: false },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 mb-2 tracking-tighter">
                        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
                            <Zap className="w-6 h-6" />
                        </div>
                        Generation Insights
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Monitoring AI creative output, request volume, and platform growth.</p>
                </div>
                <button
                    onClick={fetchStats}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-100 font-bold text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                    <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh Engine
                </button>
            </div>

            {/* Main KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryData.map((item, i) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity" style={{ background: item.color }} />
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-50" style={{ background: `${item.color}15` }}>
                                <item.icon className="w-6 h-6" style={{ color: item.color }} />
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${item.up ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                {item.up ? <ArrowUpRight className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                                {item.diff}
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{item.value}</p>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{item.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Central Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Revenue Evolution - 2/3 width */}
                <div className="xl:col-span-8 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-800 tracking-tight">Revenue Evolution</h3>
                            <p className="text-slate-400 text-xs font-medium">Monthly growth from subscriptions and boosts.</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                <Calendar className="w-3 h-3" /> Monthly
                            </div>
                        </div>
                    </div>

                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.revenueTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => `₹${val / 1000}k`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    name="Revenue"
                                    stroke="#6366f1"
                                    fill="url(#revenueGrad)"
                                    strokeWidth={4}
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution - 1/3 width */}
                <div className="xl:col-span-4 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight mb-8 flex items-center gap-2">
                        <PieIcon className="w-5 h-5 text-indigo-500" /> Request Workflow
                    </h3>

                    <div className="flex-1 min-h-[260px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={(stats?.requestsByStatus ? Object.entries(stats.requestsByStatus) : []).map(([name, value]) => ({ name, value }))}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    animationBegin={200}
                                >
                                    {(stats?.requestsByStatus ? Object.entries(stats.requestsByStatus) : []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0)" />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-slate-800">{stats?.summary?.totalRequests || 0}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center px-4">Total Requests</span>
                        </div>
                    </div>

                    <div className="mt-8 space-y-3">
                        {Object.entries(stats?.requestsByStatus || {}).map(([label, value], i) => (
                            <div key={label} className="flex items-center justify-between text-xs font-bold">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                    <span className="text-slate-500 capitalize">{label}</span>
                                </div>
                                <span className="text-slate-900 bg-slate-50 px-2 py-0.5 rounded-lg">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row - Categories & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Categories */}
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight mb-6">Generation Verticals</h3>
                    <div className="space-y-6">
                        {(stats?.categoryStats || []).map((cat, i) => (
                            <div key={cat.name} className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-slate-700">{cat.name}</span>
                                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg font-black">{cat.count} Items</span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(cat.count / (stats?.summary?.totalRequests || 1)) * 100}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="h-full rounded-full shadow-inner"
                                        style={{ background: COLORS[i % COLORS.length] }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent High-Value Transactions */}
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                        <RefreshCcw className="w-5 h-5 text-emerald-500" /> Cashflow Velocity
                    </h3>
                    <div className="flex-1 space-y-4">
                        {(stats?.recentActivity || []).map((tx) => (
                            <div key={tx._id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-900 text-sm font-black truncate">{tx.user?.name || 'Standard Plan'}</p>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">Purchase • {new Date(tx.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-900 tracking-tight">₹{(tx.amount / 100).toLocaleString()}</p>
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-100 px-1.5 py-0.5 rounded-md">PAID</span>
                                </div>
                            </div>
                        ))}
                        {(stats?.recentActivity || []).length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                <Activity className="w-12 h-12 text-slate-100 mb-2" />
                                <p className="text-slate-400 text-sm font-medium italic">No recent platform activity.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
