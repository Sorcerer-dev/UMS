import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NAV_ITEMS, hasAccess } from '../../config/navigation';
import { clsx } from 'clsx';
import { LogOut } from 'lucide-react';

export const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    if (!user) return null;

    return (
        <div
            className={clsx(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}
        >
            <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
                <span className="text-xl font-bold text-primary">UMS Campus</span>
                <button className="lg:hidden text-slate-500 hover:text-slate-800" onClick={toggleSidebar}>
                    &times;
                </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                {NAV_ITEMS.map((section, idx) => {
                    // Filter items based on user tag
                    const visibleItems = section.items.filter(item => hasAccess(user.tag, item.allowedTags));

                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={idx} className="mb-6 px-4">
                            <h3 className="px-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                {section.category}
                            </h3>
                            <nav className="space-y-1">
                                {visibleItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname.startsWith(item.path);
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={clsx(
                                                "flex items-center px-2 py-2 text-sm font-medium rounded-md group transition-colors",
                                                isActive
                                                    ? "bg-primary-50 text-primary bg-indigo-50"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            )}
                                        >
                                            <Icon
                                                className={clsx(
                                                    "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                                                    isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-500"
                                                )}
                                                aria-hidden="true"
                                                strokeWidth={1.5}
                                            />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    );
                })}
            </div>

            <div className="p-4 border-t border-slate-200">
                <button
                    onClick={logout}
                    className="flex items-center w-full px-2 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors group"
                >
                    <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-red-500" strokeWidth={1.5} />
                    Sign Out
                </button>
            </div>
        </div>
    );
};
