import { useState, useEffect } from 'react';
import { Plus, Search, UserCheck, Trash2, ArrowLeft, Users, GraduationCap } from 'lucide-react';
import { AddUserModal } from './AddUserModal';
import UserProfileDetails from '../../components/UserProfileDetails';
import { useAuth } from '../../context/AuthContext';

export default function UserDirectory() {
    const { user, departments, users, setUsers } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('categories'); // 'categories', 'staff', 'students'
    const [selectedBatch, setSelectedBatch] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Can keep for other purposes or remove
    const [selectedUserProfile, setSelectedUserProfile] = useState(null);

    const getDepartmentName = (deptId) => {
        if (!deptId) return 'N/A';
        const dept = departments.find(d => d.id === deptId);
        return dept ? dept.name : deptId;
    };

    const handleAddUser = (newUser) => {
        setUsers([newUser, ...users]);
    };

    const handleUpdateUser = (updatedUser) => {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (selectedUserProfile?.id === updatedUser.id) {
            setSelectedUserProfile(updatedUser);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                setUsers(users.filter(u => u.id !== id));
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete user.');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('An error occurred while deleting the user.');
        }
    };

    // Extract unique batches from students
    const batches = [...new Set(users.filter(u => u.tag === 'Student' && u.batch).map(u => u.batch))].sort();

    const visibleUsers = users.filter(user => {
        // Exclude dummy batch anchors from table view
        if (user.email && user.email.startsWith('batch_') && user.email.endsWith('@system.local')) {
            return false;
        }

        if (viewMode === 'staff') return user.tag !== 'Student';
        if (viewMode === 'students') {
            if (user.tag !== 'Student') return false;
            if (selectedBatch) return user.batch === selectedBatch;
            return true;
        }
        return false;
    });

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">User Directory</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        A list of all personnel in your authorized scope.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 sm:text-sm border-slate-300 rounded-md focus:ring-primary focus:border-primary py-2 px-3 border"
                            placeholder="Search users..."
                        />
                    </div>
                    {viewMode !== 'categories' && (
                        <button
                            onClick={() => { setViewMode('categories'); setSelectedBatch(''); }}
                            className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none"
                        >
                            <ArrowLeft className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            Back
                        </button>
                    )}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none"
                    >
                        <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Add User
                    </button>
                </div>
            </div>

            {viewMode === 'categories' ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
                    <button
                        onClick={() => setViewMode('students')}
                        className="relative rounded-lg border border-slate-300 bg-white px-6 py-8 shadow-sm flex items-center space-x-4 hover:border-primary hover:ring-1 hover:ring-primary focus:outline-none transition-all group"
                    >
                        <div className="flex-shrink-0 bg-primary/10 p-4 rounded-full group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                            <GraduationCap className="h-8 w-8" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <span className="absolute inset-0" aria-hidden="true" />
                            <p className="text-xl font-bold text-slate-900">Students</p>
                            <p className="text-sm text-slate-500 mt-1">View and manage enrolled students</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setViewMode('staff')}
                        className="relative rounded-lg border border-slate-300 bg-white px-6 py-8 shadow-sm flex items-center space-x-4 hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 focus:outline-none transition-all group"
                    >
                        <div className="flex-shrink-0 bg-indigo-500/10 p-4 rounded-full group-hover:bg-indigo-500 group-hover:text-white transition-colors text-indigo-500">
                            <Users className="h-8 w-8" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <span className="absolute inset-0" aria-hidden="true" />
                            <p className="text-xl font-bold text-slate-900">Staff</p>
                            <p className="text-sm text-slate-500 mt-1">View and manage teaching and administrative personnel</p>
                        </div>
                    </button>
                </div>
            ) : (
                <div className="flex flex-col space-y-4">
                    {/* Students view - Batch Selection */}
                    {viewMode === 'students' && (
                        <div className="flex justify-end">
                            <div className="w-64">
                                <label htmlFor="batch" className="sr-only">Select Batch</label>
                                <select
                                    id="batch"
                                    name="batch"
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm"
                                    value={selectedBatch}
                                    onChange={(e) => setSelectedBatch(e.target.value)}
                                >
                                    <option value="">All Batches</option>
                                    {batches.map(batch => (
                                        <option key={batch} value={batch}>{batch}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                            <div className="shadow overflow-hidden border-b border-slate-200 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hierarchy Tag</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department / DB Type</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {visibleUsers.map((person) => (
                                            <tr
                                                key={person.id}
                                                className="hover:bg-slate-50 transition-colors cursor-pointer"
                                                onClick={() => setSelectedUserProfile(person)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase">
                                                                {person.profile_data?.name ? person.profile_data.name.charAt(0) : person.name ? person.name.charAt(0) : person.email.charAt(0)}
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-slate-900">{person.profile_data?.name || person.name || person.email.split('@')[0]}</div>
                                                            <div className="text-sm text-slate-500">{person.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                                                        {person.tag}
                                                    </span>
                                                    {person.tag === 'Student' && person.batch && (
                                                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                                            {person.batch}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {getDepartmentName(person.department_id || person.department)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {person.status === 'Active' ? (
                                                        <span className="flex items-center text-green-600 font-medium"><UserCheck className="w-4 h-4 mr-1" /> Active</span>
                                                    ) : (
                                                        <span className="flex items-center text-slate-400 font-medium">Inactive</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {person.id !== user.id && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteUser(person.id); }}
                                                            className="text-red-500 hover:text-red-700 transition-colors tooltip"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddUser} />
            <UserProfileDetails
                isOpen={!!selectedUserProfile}
                onClose={() => setSelectedUserProfile(null)}
                userProfile={selectedUserProfile}
                onUpdate={handleUpdateUser}
            />
        </div>
    );
}
