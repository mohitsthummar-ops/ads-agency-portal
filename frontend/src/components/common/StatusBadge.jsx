import { Clock, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    completed: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
    active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    expired: { label: 'Expired', color: 'bg-red-100 text-red-700', icon: XCircle },
    cancelled: { label: 'Cancelled', color: 'bg-slate-100 text-slate-700', icon: XCircle },
    paid: { label: 'Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    created: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
};

export default function StatusBadge({ status }) {
    if (!status) return null;

    // Normalize status to lowercase
    const normalizedStatus = status.toLowerCase();
    const cfg = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.pending;
    const Icon = cfg.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
            <Icon className="w-3 h-3" /> {cfg.label}
        </span>
    );
}
