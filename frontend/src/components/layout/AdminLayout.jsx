import SidebarLayout from './SidebarLayout';
import { LayoutDashboard, Users, Megaphone, Tag, BarChart3, Settings, ClipboardList, Shield } from 'lucide-react';

const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/ads', label: 'Ads Management', icon: Megaphone },
    { to: '/admin/ad-requests', label: 'Ad Requests', icon: ClipboardList },
    { to: '/admin/categories-platforms', label: 'Categories & Platforms', icon: Tag },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
    return (
        <SidebarLayout
            navItems={navItems}
            brandTitle="AdAgency Platform"
            BrandIcon={Shield}
            isAdminLayout={true}
        />
    );
}
