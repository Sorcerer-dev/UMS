import { ChevronRight } from 'lucide-react';

export const HierarchyBreadcrumb = ({ user }) => {
    if (!user) return null;

    return (
        <div className="flex items-center text-sm text-slate-500">
            <span className="font-medium text-slate-700">{user.tag}</span>

            {/* If not a Root Admin, display department */}
            {user.tag !== 'Root Admin' && user.department_id && (
                <>
                    <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0 text-slate-400" />
                    <span className="truncate max-w-[150px] sm:max-w-xs">{user.department_id}</span>
                </>
            )}

            {/* Specific granularity for students */}
            {user.tag === 'Student' && (
                <>
                    <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0 text-slate-400" />
                    <span className="text-slate-400">Section A</span>
                </>
            )}
        </div>
    );
};
