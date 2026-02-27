import { useAuth } from '../../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { StaffDashboard } from './StaffDashboard';
import { StudentDashboard } from './StudentDashboard';

export default function DashboardRouter() {
    const { user } = useAuth();

    if (!user) return null;

    // Render varying Command Centers based on Hierarchy Tag
    if (['Root Admin', 'Managing Director', 'Admin'].includes(user.tag)) {
        return <AdminDashboard />;
    }

    if (['Dean', 'HOD', 'Staff'].includes(user.tag)) {
        return <StaffDashboard />;
    }

    if (user.tag === 'Student') {
        return <StudentDashboard />;
    }

    return (
        <div className="p-8 text-center text-slate-500">
            Unrecognized Hierarchy Tag
        </div>
    );
}
