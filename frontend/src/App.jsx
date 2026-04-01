import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import { CursorProvider } from './context/CursorContext';
import CustomCursor from './components/common/CustomCursor';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import ClientLayout from './components/layout/ClientLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import Terms from './pages/public/Terms';
import CampaignTemplates from './pages/public/CampaignTemplates';
import AdDetails from './pages/client/AdDetails';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import OAuthCallback from './pages/auth/OAuthCallback';

// Client Pages
import ClientDashboard from './pages/client/Dashboard';
import ProfileSettings from './pages/client/ProfileSettings';
import RequestAd from './pages/client/RequestAd';
import MyRequests from './pages/client/MyRequests';
import MySubscription from './pages/client/MySubscription';
import PaymentHistory from './pages/client/PaymentHistory';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import AdsManagement from './pages/admin/AdsManagement';
import CategoryPlatformManagement from './pages/admin/CategoryPlatformManagement';
import Analytics from './pages/admin/Analytics';
import WebsiteSettings from './pages/admin/WebsiteSettings';
import AdminAdRequests from './pages/admin/AdRequests';

// Route Guards
// Route Guards
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authChecked } = useAuthStore();

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, authChecked } = useAuthStore();

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, authChecked } = useAuthStore();

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to={isAdmin() ? '/admin' : '/dashboard'} replace />;
  return children;
};

import { useEffect, useState } from 'react';
import api from './services/api';

function App() {
  const { isAuthenticated, setAuth, authChecked, setAuthChecked } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      // If already checked in this mount cycle, stop
      if (authChecked) return;

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setAuth(res.data.user, res.data.token || useAuthStore.getState().token);
        } else if (isAuthenticated) {
          // Explicit failure from server, clear stale session
          useAuthStore.getState().logout();
        }
      } catch (err) {
        // ONLY logout if the server explicitly says they are unauthorized (401)
        // If it's a 500 or Network error, we don't want to kick the user out of their UI state
        if (err.response?.status === 401 && isAuthenticated) {
          useAuthStore.getState().logout();
        }
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []); // Run ONLY once on mount to handle hydration/refresh correctly

  return (
    <CursorProvider>
      <CustomCursor />
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0d1117',
              color: '#e2e8f0',
              border: '1px solid rgba(99,102,241,0.3)',
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/campaign-templates" element={<CampaignTemplates />} />
            <Route path="/ads/:id" element={<AdDetails />} />
          </Route>

          {/* Auth Routes (guest only) */}
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          {/* Google OAuth callback - always accessible, handles its own redirect */}
          <Route path="/auth/callback" element={<OAuthCallback />} />

          {/* Client (User) Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><ClientLayout /></ProtectedRoute>}>
            <Route index element={<ClientDashboard />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="request-ad" element={<RequestAd />} />
            <Route path="my-requests" element={<MyRequests />} />
            <Route path="subscription" element={<MySubscription />} />
            <Route path="payment-history" element={<PaymentHistory />} />
            <Route path="campaign-templates" element={<CampaignTemplates />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="ads" element={<AdsManagement />} />
            <Route path="ad-requests" element={<AdminAdRequests />} />
            <Route path="categories-platforms" element={<CategoryPlatformManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<WebsiteSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CursorProvider>
  );
}

export default App;
