import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { HierarchyBreadcrumb } from './HierarchyBreadcrumb';
import { Menu } from 'lucide-react';
import { TemporaryAccessBadge } from './TemporaryAccessBadge';
import { UserProfileModal } from './UserProfileModal';

export const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-background">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <UserProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 lg:pl-64 transition-all duration-300">

                {/* Header Ribbon */}
                <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center">
                            <button
                                type="button"
                                className="lg:hidden text-slate-500 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary mr-4"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                            >
                                <span className="sr-only">Open sidebar</span>
                                <Menu className="h-6 w-6" aria-hidden="true" />
                            </button>
                            <HierarchyBreadcrumb user={user} />
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setProfileOpen(true)}
                                className="h-8 w-8 rounded-full bg-slate-300 flex items-center justify-center text-sm font-semibold text-slate-700 hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all focus:outline-none"
                                title="User Profile & Settings"
                            >
                                {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Body */}
                <main className="flex-1 pb-8">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                        <TemporaryAccessBadge />
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
