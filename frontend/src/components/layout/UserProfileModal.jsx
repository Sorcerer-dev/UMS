import { useState } from 'react';
import { X, Lock, Save, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function UserProfileModal({ isOpen, onClose }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    if (!isOpen) return null;

    const handleLogout = () => {
        logout();
        onClose();
        navigate('/');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to change password');
            }

            setSuccessMsg('Password changed successfully. Please log in again.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Auto logout after a short delay so they can use their new password
            setTimeout(() => {
                handleLogout();
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full text-slate-800">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-4 sm:px-6 flex justify-between items-center">
                        <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
                            User Profile
                        </h3>
                        <button
                            onClick={onClose}
                            className="bg-slate-50 rounded-md text-slate-400 hover:text-slate-500 focus:outline-none"
                        >
                            <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary">
                                {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900">{user?.name || user?.email?.split('@')[0]}</h4>
                                <p className="text-sm text-slate-500">{user?.email}</p>
                                <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                    {user?.tag}
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 pt-6">
                            <h4 className="text-sm font-semibold text-slate-900 flex items-center mb-4">
                                <Lock className="w-4 h-4 mr-2 text-slate-500" />
                                Change Password
                            </h4>

                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            {successMsg && (
                                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-sm">
                                    {successMsg}
                                </div>
                            )}

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Current Password</label>
                                    <input
                                        type="password" required
                                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">New Password</label>
                                    <input
                                        type="password" required
                                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                                    <input
                                        type="password" required
                                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                    />
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isLoading || successMsg}
                                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary-300"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {isLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-200">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm items-center"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log Out securely
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md text-slate-500 hover:text-slate-700 px-4 py-2 text-base font-medium sm:mt-0 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
