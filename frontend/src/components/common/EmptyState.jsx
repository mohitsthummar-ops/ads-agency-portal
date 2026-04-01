import { ClipboardList } from 'lucide-react';

export default function EmptyState({
    icon: Icon = ClipboardList,
    title = 'No results found',
    subtitle = 'Try adjusting your filters or search terms.'
}) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
            <Icon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-700 font-semibold mb-1">{title}</p>
            <p className="text-slate-500 font-medium text-sm">{subtitle}</p>
        </div>
    );
}
