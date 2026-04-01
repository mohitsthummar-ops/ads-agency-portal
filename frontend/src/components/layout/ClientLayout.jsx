import SidebarLayout from './SidebarLayout';
import { LayoutDashboard, User, Megaphone, ClipboardList, Package, Receipt, LayoutTemplate, Zap } from 'lucide-react';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/dashboard/my-requests', label: 'My Campaign Requests', icon: ClipboardList },
    { to: '/dashboard/request-ad', label: 'Create Campaign', icon: Megaphone },
    { to: '/dashboard/subscription', label: 'My Subscription', icon: Package },
    { to: '/dashboard/payment-history', label: 'Payment History', icon: Receipt },
    { to: '/dashboard/campaign-templates', label: 'Campaign Templates', icon: LayoutTemplate },
    { to: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function ClientLayout() {
    return (
        <SidebarLayout
            navItems={navItems}
            brandTitle="AdAgency"
            BrandIcon={Zap}
            isAdminLayout={false}
        />
    );
}
