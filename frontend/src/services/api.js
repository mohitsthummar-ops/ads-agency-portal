import axios from 'axios';
import toast from 'react-hot-toast';

// In production, points to the live Render backend (set VITE_BACKEND_URL in Vercel env vars)
// In development, falls back to localhost:5000
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? 'https://ads-agency-portal.onrender.com' : 'http://localhost:5000');

const api = axios.create({
    // Dev: baseURL = '/api' → hits Vite proxy → localhost:5000
    // Prod: baseURL = 'https://your-backend.onrender.com/api'
    baseURL: import.meta.env.PROD ? `${BACKEND_URL}/api` : '/api',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

// Attach JWT token from localStorage on every request (Legacy fallback / Desktop support)
api.interceptors.request.use((config) => {
    try {
        const raw = localStorage.getItem('auth-storage');
        if (raw) {
            const parsed = JSON.parse(raw);
            const token = parsed?.state?.token;
            // Only add if token exists and is not the fake fallback 'session'; else cookie takes over automatically with withCredentials:true
            if (token && token !== 'undefined' && token !== 'session') {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    } catch (_) { }
    return config;
});

// Global response error handling
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            // Skip redirect for background auth checks to avoid loops
            if (err.config?.url?.includes('/auth/me')) {
                return Promise.reject(err);
            }

            const message = err.response?.data?.message || 'Session expired. Please login again.';
            toast.error(message);

            // Short delay to let user see the toast
            setTimeout(() => {
                localStorage.removeItem('auth-storage');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }, 1000);
        }
        return Promise.reject(err);
    }
);

export default api;

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data),
    getMe: () => api.get('/auth/me'),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    changePassword: (data) => api.put('/users/change-password', data),
    updatePreferences: (data) => api.put('/users/preferences', data),
    getSavedAds: () => api.get('/users/saved-ads'),
    toggleSaveAd: (adId) => api.put(`/users/saved-ads/${adId}`),
    uploadAvatar: (formData) =>
        api.put('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ─── Ads ─────────────────────────────────────────────────────────────────────
export const adAPI = {
    getAll: (params) => api.get('/ads', { params }),
    getPersonalized: () => api.get('/ads/personalized'),
    getDefault: () => api.get('/ads/default'),
    getById: (id) => api.get(`/ads/${id}`),
    create: (formData) =>
        api.post('/ads', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id, data) => api.put(`/ads/${id}`, data),
    delete: (id) => api.delete(`/ads/${id}`),
    trackView: (id) => api.post(`/ads/${id}/view`),
    trackClick: (id) => api.post(`/ads/${id}/click`),
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoryAPI = {
    getAll: (params) => api.get('/categories', { params }),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
    toggle: (id) => api.put(`/categories/${id}/toggle`),
};

// ─── Platforms ────────────────────────────────────────────────────────────────
export const platformAPI = {
    getAll: (params) => api.get('/platforms', { params }),
    getById: (id) => api.get(`/platforms/${id}`),
    create: (data) => api.post('/platforms', data),
    update: (id, data) => api.put(`/platforms/${id}`, data),
    delete: (id) => api.delete(`/platforms/${id}`),
    toggle: (id) => api.put(`/platforms/${id}/toggle`),
};

// ─── Transactions / Razorpay ──────────────────────────────────────────────────
export const transactionAPI = {
    createOrder: (data) => api.post('/transactions/create-order', data),
    verifyPayment: (data) => api.post('/transactions/verify', data),
    getMyTransactions: () => api.get('/transactions'),
    getAll: (params) => api.get('/transactions', { params }),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
    getDashboardStats: () => api.get('/admin/stats'),
    getUsers: (params) => api.get('/admin/users', { params }),
    blockUser: (id) => api.put(`/admin/users/${id}/block`),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getAllAds: (params) => api.get('/admin/ads', { params }),
    approveAd: (id) => api.put(`/admin/ads/${id}/approve`),
    rejectAd: (id, reason) => api.put(`/admin/ads/${id}/reject`, { reason }),
    getAnalytics: (params) => api.get('/admin/analytics', { params }),
    getSettings: () => api.get('/admin/settings'),
    updateSettings: (data) => api.put('/admin/settings', data),
};

// ─── Ad Requests ──────────────────────────────────────────────────────────────
export const adRequestAPI = {
    submit: (data) => api.post('/ad-requests', data),
    getMyRequests: () => api.get('/ad-requests/mine'),
    generateImage: (id) => api.post(`/ad-requests/${id}/generate-image`),
    getAll: (params) => api.get('/ad-requests', { params }),
    approve: (id, data) => api.put(`/ad-requests/${id}/approve`, data),
    reject: (id, reason) => api.put(`/ad-requests/${id}/reject`, { reason }),
};

// ─── Subscription ──────────────────────────────────────────────────────────────
export const subscriptionAPI = {
    getPackages: () => api.get('/subscription/packages'),
    getMy: () => api.get('/subscription/me'),
    buy: (packageId) => api.post('/subscription/buy', { packageId }),
};

// ─── Templates ───────────────────────────────────────────────────────────────
export const templateAPI = {
    getAll: () => api.get('/templates'),
};


