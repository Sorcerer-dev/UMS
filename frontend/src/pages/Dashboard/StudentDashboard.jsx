import { CheckCircle2, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';

export const StudentDashboard = () => {
    const grades = [];

    return (
        <div className="space-y-6 max-w-lg mx-auto lg:max-w-none">

            {/* Mobile-optimized Header */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
                <div className="relative">
                    <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100 dark:text-slate-700" />
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="251.2" strokeDashoffset="25.12" className="text-primary" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-slate-800 dark:text-white">--%</span>
                    </div>
                </div>
                <h2 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">Current Attendance</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">You are on track. Keep it up!</p>
            </div>

            {/* Quick Actions Mobile */}
            <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <Calendar className="h-6 w-6 text-indigo-500 dark:text-indigo-400 mb-2" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Timetable</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400 mb-2" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Notices</span>
                    <span className="absolute top-3 right-3 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                </button>
            </div>

            {/* Latest Grades - List View Optimized for Mobile */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-base font-semibold text-slate-800 dark:text-white flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-500" /> Latest Grades
                    </h3>
                </div>
                <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                    {grades.map((item, idx) => (
                        <li key={idx} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-900 dark:text-white">{item.subject}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center">
                                    <CheckCircle2 className={`h-3 w-3 mr-1 ${item.color}`} /> {item.status}
                                </span>
                            </div>
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${item.color} ${item.bg}`}>
                                {item.grade}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

        </div>
    );
};
