import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Zap, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI, BACKEND_URL } from '../../services/api';
import useAuthStore from '../../store/authStore';

const schema = z.object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { setAuth } = useAuthStore();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await authAPI.login(data);
            setAuth(res.data.user, res.data.token);
            toast.success(`Welcome back, ${res.data.user.name}!`);
            navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16 relative overflow-hidden">
            {/* Orbs */}
            <div className="orb orb-purple w-96 h-96 top-10 -left-20" />
            <div className="orb orb-pink w-80 h-80 bottom-10 right-0" />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-white border border-slate-200 p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/20">
                            <Zap className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Welcome Back</h1>
                        <p className="text-slate-500 text-sm font-medium">Sign in to your AdAgency account</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="you@example.com"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                    id="email"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-slate-700">Password</label>
                                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 text-xs font-semibold transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    {...register('password')}
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-11 pr-11 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                    id="password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold btn-glow text-white disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
                            id="login-btn"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><ArrowRight className="w-5 h-5" /> Sign In</>
                            )}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500 font-bold">Or continue with</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => window.location.href = `${BACKEND_URL}/auth/google`}
                            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </button>
                    </form>

                    <p className="text-center text-slate-500 text-sm mt-8 font-medium">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                            Register now
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
