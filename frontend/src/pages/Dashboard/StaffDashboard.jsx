import { Clock, FileText, BellRing, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const StaffDashboard = () => {
    const { setTemporaryAccess } = useAuth();

    const actions = [
        { name: 'Mark Attendance', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
        { name: 'Upload Marks', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { name: 'Post Notice', icon: BellRing, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    // Mock handler for demonstrating phase 5 feature
    const handleDelegate = () => {
        setTemporaryAccess({
            action: 'Attendance for Section A',
            expiresAt: new Date(Date.now() + 45 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        alert("Temporary Attendance Right delegated to Class Representative successfully.");
    };

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Staff Portal</h2>
                <p className="text-slate-500 text-sm mt-1">Quick actions and daily academic tasks.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {actions.map((action) => (
                    <button
                        key={action.name}
                        className="group flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-primary hover:shadow-md transition-all text-center"
                    >
                        <div className={`p-4 rounded-full ${action.bg} mb-4 group-hover:scale-110 transition-transform`}>
                            <action.icon className={`h-8 w-8 ${action.color}`} strokeWidth={1.5} />
                        </div>
                        <span className="font-semibold text-slate-700 group-hover:text-primary">{action.name}</span>
                    </button>
                ))}
            </div>

            <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-slate-800">Permission Delegation</h3>
                    <button
                        onClick={handleDelegate}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-amber-600 hover:bg-amber-700"
                    >
                        <KeyRound className="h-3 w-3 mr-1" /> Delegate CR Access
                    </button>
                </div>
                <div className="p-6 text-sm text-slate-500">
                    Use the delegation button to grant a student temporary Write-Access for attendance marking directly reflecting the Phase 5 temporary permission architecture.
                </div>
            </div>
        </div>
    );
};
