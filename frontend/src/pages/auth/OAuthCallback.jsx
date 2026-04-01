import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

export default function OAuthCallback() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();

    useEffect(() => {
        const token = params.get('token');
        const userRaw = params.get('user');
        const error = params.get('error');

        if (error || !token || !userRaw) {
            toast.error('Google sign-in failed. Please try again.');
            navigate('/login', { replace: true });
            return;
        }

        try {
            const user = JSON.parse(decodeURIComponent(userRaw));
            setAuth(user, token);
            toast.success(`Welcome, ${user.name}! 🎉`);
            // Small timeout so toast is visible
            setTimeout(() => {
                navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
            }, 500);
        } catch (err) {
            toast.error('Authentication error. Please try again.');
            navigate('/login', { replace: true });
        }
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/20 animate-pulse">
                    <Zap className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Signing you in...</h2>
                <p className="text-slate-500 text-sm">Please wait while we complete your Google sign-in.</p>
                <div className="mt-6 w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
            </div>
        </div>
    );
}
