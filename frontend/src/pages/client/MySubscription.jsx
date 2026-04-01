import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, CheckCircle2, Zap, Star, Crown, Rocket, CalendarClock, Image, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscriptionAPI, transactionAPI } from '../../services/api';
import { loadRazorpayScript, openRazorpayCheckout } from '../../utils/razorpay';
import useAuthStore from '../../store/authStore';

// Static UI preferences mapped by typical plan names
const UI_PREFS = {
    'Demo': { icon: Zap, color: '#64748b', bg: 'from-slate-50 to-slate-100', border: 'border-slate-200', features: ['Try the platform', 'Basic AI image generation'] },
    'Pro': { icon: Star, color: '#3b82f6', bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', features: ['Standard AI models', 'Priority support'], popular: true },
    '1 Month': { icon: Star, color: '#3b82f6', bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', features: ['30 days access', 'All image styles', 'Priority support'], popular: true },
    '6 Months': { icon: Rocket, color: '#8b5cf6', bg: 'from-violet-50 to-purple-50', border: 'border-violet-200', features: ['180 days access', 'All image styles', 'Bulk savings'] },
    '1 Year': { icon: Crown, color: '#f59e0b', bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200', features: ['365 days access', 'VIP support', 'Best value'] }
};

export default function MySubscription() {
    const [subscription, setSubscription] = useState(null);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(null);
    const { user } = useAuthStore();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subRes, pkgRes] = await Promise.all([
                subscriptionAPI.getMy(),
                subscriptionAPI.getPackages()
            ]);
            setSubscription(subRes.data.subscription);
            setPackages(pkgRes.data.packages || []);
        } catch {
            toast.error('Failed to load subscription data');
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (pkg) => {
        setBuying(pkg.id);
        try {
            // Free plans
            if (pkg.price === 0) {
                const res = await subscriptionAPI.buy(pkg.id);
                toast.success(res.data.message);
                setSubscription(res.data.subscription);
                return;
            }

            // Paid plans — Use Razorpay
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                toast.error('Failed to load Razorpay. Check your internet connection.');
                return;
            }

            // 1. Create order
            const orderRes = await transactionAPI.createOrder({
                amount: pkg.price,
                purpose: 'subscription',
                description: `Subscription: ${pkg.label}`,
                metadata: {
                    packageId: pkg.id
                }
            });

            const { order, key } = orderRes.data;

            // 2. Open Checkout
            openRazorpayCheckout({
                orderId: order.id,
                amount: pkg.price,
                keyId: key,
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: user?.phone || ''
                },
                description: `Purchase ${pkg.label}`,
                onSuccess: async (response) => {
                    try {
                        await transactionAPI.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        toast.success('Subscription activated! 🎉');
                        fetchData(); // Refresh state
                    } catch (err) {
                        toast.error('Payment verification failed. Please contact support.');
                    }
                },
                onDismiss: () => toast('Payment cancelled'),
            });

        } catch (err) {
            toast.error(err?.response?.data?.message || 'Purchase failed');
        } finally {
            setBuying(null);
        }
    };

    const isActive = subscription?.status === 'Active';
    const expiryDate = subscription?.expiryDate
        ? new Date(subscription.expiryDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : null;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">My Subscription</h1>
                <p className="text-slate-500 mt-1">Choose a package to unlock AI ad image generation.</p>
            </div>

            {/* Active Subscription Card */}
            {!loading && isActive && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-blue-500/20"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="w-5 h-5 text-green-300" />
                                <span className="text-green-300 font-semibold text-sm">Active</span>
                            </div>
                            <h2 className="text-2xl font-bold">{subscription.packageName}</h2>
                            <p className="text-blue-200 text-sm mt-1">Expires on {expiryDate}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold">{subscription.imagesUsed}<span className="text-blue-300 text-base font-normal">/{subscription.imageLimit}</span></p>
                            <p className="text-blue-200 text-sm">Images used</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-blue-200 mb-1">
                            <span>Image usage</span>
                            <span>{subscription.imageLimit > 0 ? Math.round((subscription.imagesUsed / subscription.imageLimit) * 100) : 0}%</span>
                        </div>
                        <div className="h-2 bg-blue-700/50 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-white/70 transition-all"
                                style={{ width: `${subscription.imageLimit > 0 ? Math.min(100, (subscription.imagesUsed / subscription.imageLimit) * 100) : 0}%` }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}

            {!loading && !isActive && subscription?.status === 'Expired' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-red-700 font-medium text-sm">Your subscription has expired. Please renew or choose a new package below.</p>
                </div>
            )}

            {/* Package Cards */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">Available Packages</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {packages.map((pkg, index) => {
                        const prefs = UI_PREFS[pkg.label] || UI_PREFS['Pro'];
                        const Icon = prefs.icon || Package;
                        const isCurrent = isActive && subscription?.packageName === pkg.label;

                        return (
                            <motion.div
                                key={pkg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{
                                    y: -8,
                                    scale: 1.02,
                                    rotateX: 2,
                                    rotateY: -2,
                                    boxShadow: "0 25px 40px -15px rgba(0, 0, 0, 0.15)"
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20,
                                    opacity: { duration: 0.5 }
                                }}
                                className={`relative bg-gradient-to-br ${prefs.bg} border ${prefs.border} rounded-2xl p-6 flex flex-col transition-all cursor-default shadow-sm shadow-slate-200/50`}
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                {prefs.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                                        Popular
                                    </div>
                                )}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${prefs.color}18` }}>
                                        <Icon className="w-5 h-5" style={{ color: prefs.color }} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{pkg.label}</p>
                                        <p className="text-xs text-slate-500">{pkg.duration} Days</p>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <p className="text-3xl font-extrabold text-slate-800">
                                        {pkg.price === 0 ? 'Free' : `₹${pkg.price}`}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Image className="w-4 h-4" style={{ color: prefs.color }} />
                                        <span className="text-sm font-semibold text-slate-600">{pkg.imageLimit} AI image{pkg.imageLimit > 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                                <ul className="space-y-1.5 mb-5 flex-1">
                                    {prefs.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                {isCurrent ? (
                                    <div className="w-full py-2 rounded-lg bg-green-100 text-green-700 text-sm font-semibold text-center flex items-center justify-center gap-1">
                                        <CheckCircle2 className="w-4 h-4" /> Current Plan
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleBuy(pkg)}
                                        disabled={!!buying}
                                        className="w-full py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                                        style={{ background: prefs.color }}
                                    >
                                        {buying === pkg.id ? 'Activating...' : pkg.price === 0 ? 'Start Free' : `Buy for ₹${pkg.price}`}
                                    </button>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Info note */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <CalendarClock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                    <p className="text-blue-800 font-semibold text-sm">About AI Image Generation</p>
                    <p className="text-blue-600 text-xs mt-0.5">Generate professional AI advertisement images after your campaign request is approved by the admin. Images are powered by AI and are social media ready.</p>
                </div>
            </div>

            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-slate-100 rounded-xl h-72 animate-pulse" />
                    ))}
                </div>
            )}
        </div>
    );
}
