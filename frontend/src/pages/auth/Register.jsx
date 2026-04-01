import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Lock, Phone, Eye, EyeOff, Zap, ArrowRight, Building2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI, BACKEND_URL } from '../../services/api';
import useAuthStore from '../../store/authStore';

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['client', 'admin'], { errorMap: () => ({ message: 'Please select a role' }) })
}).refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export default function Register() {
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { setAuth } = useAuthStore();
    const navigate = useNavigate();

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { role: 'client' }
    });

    const watchRole = watch('role');

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const { confirmPassword, ...payload } = data;
            const res = await authAPI.register(payload);
            setAuth(res.data.user, res.data.token);
            toast.success('Account created successfully! 🎉');
            navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const textFields = [
        { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', icon: User },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', icon: Mail },
        { name: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+91 98765 43210', icon: Phone },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16 relative overflow-hidden">
            {/* Elegant Orbs for background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-50 rounded-full blur-3xl opacity-60 pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>

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
                        <h1 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Create Account</h1>
                        <p className="text-slate-500 text-sm font-medium">Join AdAgency to start your first campaign</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {textFields.map(({ name, label, type, placeholder, icon: Icon }) => (
                            <div key={name}>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">{label}</label>
                                <div className="relative">
                                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        {...register(name)}
                                        type={type}
                                        placeholder={placeholder}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                        id={name}
                                    />
                                </div>
                                {errors[name] && <p className="text-red-500 text-xs mt-1 font-medium">{errors[name].message}</p>}
                            </div>
                        ))}

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    {...register('password')}
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-11 pr-11 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
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
                            {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    {...register('confirmPassword')}
                                    type={showConfirmPass ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-11 pr-11 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                    id="confirmPassword"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    {showConfirmPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>}
                        </div>

                        {/* Role Selection */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <label className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center gap-2 transition-all ${watchRole === 'client'
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                                : 'border-slate-200 bg-slate-50 hover:border-blue-300'
                                }`}>
                                <input {...register('role')} type="radio" value="client" className="hidden" />
                                <Building2 className={`w-6 h-6 ${watchRole === 'client' ? 'text-blue-600' : 'text-slate-400'}`} />
                                <span className={`text-sm font-bold ${watchRole === 'client' ? 'text-blue-700' : 'text-slate-600'}`}>Client</span>
                            </label>

                            <label className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center gap-2 transition-all ${watchRole === 'admin'
                                ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20'
                                : 'border-slate-200 bg-slate-50 hover:border-amber-300'
                                }`}>
                                <input {...register('role')} type="radio" value="admin" className="hidden" />
                                <Shield className={`w-6 h-6 ${watchRole === 'admin' ? 'text-amber-600' : 'text-slate-400'}`} />
                                <span className={`text-sm font-bold ${watchRole === 'admin' ? 'text-amber-700' : 'text-slate-600'}`}>Admin</span>
                            </label>
                        </div>
                        {errors.role && <p className="text-red-500 text-xs mt-1 font-medium">{errors.role.message}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
                            id="register-btn"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><ArrowRight className="w-5 h-5" /> Create Account</>
                            )}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500 font-bold">Or register with</span>
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
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                            Sign in instead
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
