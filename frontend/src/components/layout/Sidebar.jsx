import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NAV_ITEMS, hasAccess } from '../../config/navigation';
import { useTheme } from '../../context/ThemeContext';
import { clsx } from 'clsx';
import { LogOut, Moon, Sun } from 'lucide-react';

export const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const location = useLocation();

    if (!user) return null;

    return (
        <div
            className={clsx(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}
        >
            <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xl font-bold text-primary dark:text-primary-light">UMS Campus</span>
                <button className="lg:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white" onClick={toggleSidebar}>
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
                            <h3 className="px-2 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
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
                                                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-light"
                                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                            )}
                                        >
                                            <Icon
                                                className={clsx(
                                                    "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                                                    isActive ? "text-primary dark:text-primary-light" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-300"
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

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <button
                    onClick={toggleTheme}
                    className="flex items-center w-full px-2 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors group"
                >
                    {isDarkMode ? (
                        <Sun className="mr-3 h-5 w-5 text-slate-400 group-hover:text-amber-500" strokeWidth={1.5} />
                    ) : (
                        <Moon className="mr-3 h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-primary dark:group-hover:text-primary-light" strokeWidth={1.5} />
                    )}
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button
                    onClick={logout}
                    className="flex items-center w-full px-2 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400 transition-colors group"
                >
                    <LogOut className="mr-3 h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-red-500 dark:group-hover:text-red-400" strokeWidth={1.5} />
                    Sign Out
                </button>
            </div>
        </div>
    );
};
