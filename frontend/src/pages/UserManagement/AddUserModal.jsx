import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TAG_LEVELS } from '../../config/navigation';
import { X } from 'lucide-react';

export const AddUserModal = ({ isOpen, onClose, onAdd, fixedTag, fixedDepartment }) => {
    const { user, departments, users } = useAuth();
    const [formData, setFormData] = useState({ name: '', email: '', tag: fixedTag || '', department: fixedDepartment || '', adminType: '', batch: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData({ name: '', email: '', tag: fixedTag || '', department: fixedDepartment || '', adminType: '', batch: '' });
            setError('');
        }
    }, [isOpen, fixedTag, fixedDepartment]);

    if (!isOpen) return null;

    // Enforce Add-Down Rule visually: Filter tags strictly below the creator's tag
    const creatorRank = TAG_LEVELS[user.tag];
    const allowedTagsToAdd = Object.keys(TAG_LEVELS).filter(t => TAG_LEVELS[t] < creatorRank);

    const isTopAdmin = ['Root Admin', 'Managing Director', 'Admin'].includes(user.tag);
    const addingTopAdmin = ['Root Admin', 'Managing Director', 'Admin'].includes(formData.tag);

    const actualDept = addingTopAdmin ? null : (isTopAdmin ? formData.department : user.department_id);
    const uniqueBatches = actualDept ? [...new Set((users || [])
        .filter(u => u.tag === 'Student' && (String(u.department_id) === String(actualDept) || String(u.department) === String(actualDept)) && u.batch)
        .map(u => u.batch)
    )].sort() : [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password || 'TemporaryPassword123!', // Require a password or auto-generate
            tag: formData.tag,
            department_id: addingTopAdmin
                ? null // Top admins don't have a department_id strictly linking them based on current schema
                : (isTopAdmin ? formData.department : user.department_id),
            batch: formData.tag === 'Student' ? formData.batch : null
        };

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create user');
            }

            const data = await res.json();

            // Format for UI: Add UI-specific fields the backend doesn't return
            const newlyCreatedUser = {
                ...data.user,
                name: formData.name, // backend doesn't store name currently, just UI mock
                department: payload.department_id,
                batch: payload.batch,
                status: 'Active'
            };

            onAdd(newlyCreatedUser);
            setFormData({ name: '', email: '', password: '', tag: '', department: '', adminType: '', batch: '' });
            onClose();
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

                <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 text-slate-800 dark:text-slate-200">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            onClick={onClose}
                            className="bg-transparent rounded-md text-slate-400 hover:text-slate-500 focus:outline-none"
                        >
                            <X className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white" id="modal-title">
                                Add New Personnel
                            </h3>
                            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                You can only create accounts for hierarchy levels structurally below your own ({user.tag}).
                            </div>
                            {error && (
                                <div className="mt-2 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                    <input
                                        type="text" required
                                        className="mt-1 block w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                                    <input
                                        type="email" required
                                        className="mt-1 block w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Temporary Password</label>
                                    <input
                                        type="text" required
                                        placeholder="User must change on first login"
                                        className="mt-1 block w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                                {!fixedTag && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Hierarchy Tag</label>
                                        <select
                                            required
                                            className="mt-1 block w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                            value={formData.tag} onChange={e => setFormData({ ...formData, tag: e.target.value })}
                                        >
                                            <option value="">Select a Tag Level</option>
                                            {allowedTagsToAdd.length === 0 ? (
                                                <option disabled>No roles available to add beneath your rank</option>
                                            ) : (
                                                allowedTagsToAdd.map(t => <option key={t} value={t}>{t}</option>)
                                            )}
                                        </select>
                                    </div>
                                )}

                                {formData.tag === 'Student' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Batch</label>
                                        <select
                                            required
                                            className="mt-1 block w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                            value={formData.batch} onChange={e => setFormData({ ...formData, batch: e.target.value })}
                                        >
                                            <option value="">Select a Batch</option>
                                            {uniqueBatches.length > 0 ? (
                                                uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)
                                            ) : (
                                                <option disabled value="">No batches available</option>
                                            )}
                                        </select>
                                    </div>
                                )}

                                {/* Dynamic Logic based on Selected Tag */}
                                {addingTopAdmin ? (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Admin Type</label>
                                        <input
                                            type="text" required
                                            placeholder="e.g. Office, HR, MD"
                                            className="mt-1 block w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                            value={formData.adminType} onChange={e => setFormData({ ...formData, adminType: e.target.value })}
                                        />
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Top-level tags do not belong to academic departments.</p>
                                    </div>
                                ) : !fixedDepartment && isTopAdmin ? (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
                                        <select
                                            required
                                            className="mt-1 block w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                            value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}
                                        >
                                            <option value="">Select a Department</option>
                                            {departments.map((dept, idx) => (
                                                <option key={dept.id || idx} value={dept.id}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : !fixedDepartment && (
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md border border-slate-200 dark:border-slate-700">
                                        <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium">Auto-Inherited Department</span>
                                        <span className="block text-sm font-semibold text-slate-800 dark:text-white">{user.department_id}</span>
                                    </div>
                                )}

                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Create User
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
