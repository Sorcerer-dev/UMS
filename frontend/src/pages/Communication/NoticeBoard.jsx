import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, AlertCircle, ArrowLeft, Calendar, User, Users, PlusCircle } from 'lucide-react';
import PostNoticeModal from './PostNoticeModal';

export default function NoticeBoard() {
    const { user, departments } = useAuth();
    const [viewMode, setViewMode] = useState('categories'); // 'categories' or 'department_notices'
    const [selectedDept, setSelectedDept] = useState(null);
    const [notices, setNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

    const canPostNotice = ['Root Admin', 'Managing Director', 'Admin', 'Dean', 'HOD', 'Staff'].includes(user?.tag);

    const fetchNotices = async (deptId) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = deptId
                ? `http://localhost:3000/api/notices?department_id=${deptId}`
                : `http://localhost:3000/api/notices`;

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setNotices(data);
            } else {
                console.error("Failed to fetch notices");
            }
        } catch (err) {
            console.error("Error fetching notices:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeptClick = (dept) => {
        setSelectedDept(dept);
        setViewMode('department_notices');
        fetchNotices(dept.id);
    };

    const handleBack = () => {
        setViewMode('categories');
        setSelectedDept(null);
        setNotices([]);
    };

    const handleNoticePosted = (newNotice) => {
        setNotices([newNotice, ...notices]);
    };

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Notice Board</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {viewMode === 'categories'
                            ? 'Select a department to view relevant notices.'
                            : `Notices for ${selectedDept?.name}`}
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                    {viewMode === 'department_notices' && (
                        <button
                            onClick={handleBack}
                            className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none"
                        >
                            <ArrowLeft className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            Back
                        </button>
                    )}
                    {viewMode === 'department_notices' && canPostNotice && (
                        <button
                            onClick={() => setIsPostModalOpen(true)}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none"
                        >
                            <PlusCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            Post Notice
                        </button>
                    )}
                </div>
            </div>

            {viewMode === 'categories' ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {departments.map((dept) => (
                        <div
                            key={dept.id}
                            onClick={() => handleDeptClick(dept)}
                            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative group h-32 flex flex-col cursor-pointer hover:ring-2 hover:ring-primary hover:border-transparent transition-all"
                        >
                            <div className="p-4 flex h-full items-center">
                                <div className="flex-shrink-0 bg-blue-50 dark:bg-primary/20 p-3 rounded-lg text-blue-600 dark:text-primary-light mr-4 group-hover:bg-blue-100 dark:group-hover:bg-primary/30 transition-colors">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800 dark:text-white text-lg line-clamp-2" title={dept.name}>
                                        {dept.name}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-md">
                    {isLoading ? (
                        <div className="p-10 text-center text-slate-500">Loading notices...</div>
                    ) : notices.length === 0 ? (
                        <div className="p-10 text-center flex flex-col items-center">
                            <AlertCircle className="h-12 w-12 text-slate-300 mb-3" />
                            <h3 className="text-lg font-medium text-slate-900">No Notices Found</h3>
                            <p className="mt-1 text-sm text-slate-500">There are currently no notices posted for this department.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                            {notices.map((notice) => (
                                <li key={notice.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{notice.title}</h4>
                                            <div className="prose prose-sm text-slate-600 dark:text-slate-300 max-w-none whitespace-pre-wrap mb-4">
                                                {notice.content}
                                            </div>
                                            <div className="flex flex-wrap text-sm text-slate-500 gap-4">
                                                <div className="flex items-center">
                                                    <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400" />
                                                    {notice.author_name || notice.author_email}
                                                </div>
                                                <div className="flex items-center">
                                                    <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400" />
                                                    {new Date(notice.created_at).toLocaleDateString()} at {new Date(notice.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                {notice.visibility && notice.visibility.length > 0 && (
                                                    <div className="flex items-center">
                                                        <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400" />
                                                        <span className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded text-xs font-medium">
                                                            {notice.visibility.join(', ')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {isPostModalOpen && (
                <PostNoticeModal
                    isOpen={isPostModalOpen}
                    onClose={() => setIsPostModalOpen(false)}
                    departmentId={selectedDept?.id}
                    onNoticePosted={handleNoticePosted}
                />
            )}
        </div>
    );
}
