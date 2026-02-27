import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Image as ImageIcon, ArrowLeft, UserCheck } from 'lucide-react';
import { AddUserModal } from '../UserManagement/AddUserModal';
import UserProfileDetails from '../../components/UserProfileDetails';

export default function DepartmentManagement() {
    const { departments, addDepartment, users } = useAuth();
    const [newDeptName, setNewDeptName] = useState('');
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [selectedUserProfile, setSelectedUserProfile] = useState(null);
    const [isUpdatingBatch, setIsUpdatingBatch] = useState(false);

    const currentYear = new Date().getFullYear();
    const [startYear, setStartYear] = useState(currentYear);
    const [endYear, setEndYear] = useState(currentYear + 4);

    const [prefillBatch, setPrefillBatch] = useState('');

    const { setUsers, user } = useAuth();
    const handleAddUser = (newUser) => {
        setUsers([newUser, ...(users || [])]);
    };

    const handleUpdateUser = (updatedUser) => {
        setUsers((users || []).map(u => u.id === updatedUser.id ? updatedUser : u));
        if (selectedUserProfile?.id === updatedUser.id) {
            setSelectedUserProfile(updatedUser);
        }
    };

    const handleAddBatch = async (e) => {
        e.preventDefault();
        const batchString = `${startYear}-${endYear}`;

        try {
            const token = localStorage.getItem('token');
            // Create a placeholder user to anchor the batch in the database
            const res = await fetch('http://localhost:3000/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: `Batch Anchor: ${batchString}`,
                    email: `batch_${batchString.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}@system.local`,
                    password: 'BatchPlaceholder123!',
                    tag: 'Student',
                    department: selectedDept.id,
                    batch: batchString,
                    status: 'Inactive'
                })
            });

            if (res.ok) {
                const data = await res.json();

                // Construct the full object for the UI so filters pick it up immediately
                const newlyCreatedBatchAnchor = {
                    ...data.user,
                    name: `Batch Anchor: ${batchString}`,
                    email: `batch_${batchString.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}@system.local`,
                    department_id: selectedDept.id,
                    department: selectedDept.id,
                    tag: 'Student',
                    batch: batchString,
                    status: 'Inactive'
                };

                handleAddUser(newlyCreatedBatchAnchor);
                setStartYear(currentYear);
                setEndYear(currentYear + 4);
                setIsBatchModalOpen(false);
                setSelectedBatch(batchString);
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to create batch');
            }
        } catch (error) {
            console.error('Error creating batch:', error);
            alert('An error occurred while creating the batch.');
        }
    };

    const handleUpdateBatchStatus = async (status) => {
        if (!selectedBatch || !selectedDept) return;

        if (!window.confirm(`Are you sure you want to mark ALL students in batch ${selectedBatch} as ${status}?`)) {
            return;
        }

        setIsUpdatingBatch(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/users/batch/${encodeURIComponent(selectedBatch)}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ departmentId: selectedDept.id, status })
            });

            const data = await res.json();
            if (res.ok) {
                // Update local context
                const updatedUsers = (users || []).map(u => {
                    if (u.tag === 'Student' && u.batch === selectedBatch && u.department_id === selectedDept.id) {
                        return { ...u, status };
                    }
                    return u;
                });
                setUsers(updatedUsers);
                alert(data.message);
            } else {
                alert(data.error || 'Failed to update batch status');
            }
        } catch (error) {
            console.error('Error updating batch status:', error);
            alert('An error occurred while updating the batch status.');
        } finally {
            setIsUpdatingBatch(false);
        }
    };

    const handleAdd = (e) => {
        e.preventDefault();
        addDepartment(newDeptName);
        setNewDeptName('');
    };

    const deptStudents = (users || []).filter(u => u.tag === 'Student' && (u.department_id === selectedDept?.id || u.department === selectedDept?.id));
    const batches = [...new Set(deptStudents.map(u => u.batch).filter(Boolean))].sort();

    const visibleStudents = deptStudents.filter(u => {
        // Hide placeholder anchor users from the UI unless specifically needed, 
        // but we'll leave them visible as "Inactive" so they can be deleted if empty.
        // Actually, better to hide them so the UI looks clean.
        if (u.email.startsWith('batch_') && u.email.endsWith('@system.local')) return false;

        if (selectedBatch) return u.batch === selectedBatch;
        return true;
    });

    return (
        <div className="space-y-6">
            {!selectedDept ? (
                <>
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Departments</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Create and configure academic departments and visual assets. Click a department to view students.
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <form onSubmit={handleAdd} className="flex space-x-2">
                                <input
                                    type="text"
                                    required
                                    placeholder="New Department Name"
                                    className="block w-full sm:text-sm border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-md focus:ring-primary focus:border-primary py-2 px-3 border shadow-sm transition-colors"
                                    value={newDeptName}
                                    onChange={(e) => setNewDeptName(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none"
                                >
                                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                    Add
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-8">
                        {departments.map((dept, idx) => (
                            <div
                                key={dept.id || idx}
                                onClick={() => { setSelectedDept(dept); setSelectedBatch(''); }}
                                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative group h-64 flex flex-col cursor-pointer hover:ring-2 hover:ring-primary hover:border-transparent transition-all"
                            >
                                <div className="flex-1 bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors relative">
                                    <div className="text-center p-4">
                                        <ImageIcon className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400" />
                                        <span className="mt-2 block text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                                            {/* Could add image upload functionality later */}
                                            No Image
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-4 border-t border-slate-200 dark:border-slate-700 text-center">
                                    <h3 className="font-semibold text-slate-800 dark:text-white text-lg truncate" title={dept.name}>
                                        {dept.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        {(users || []).filter(u =>
                                            u.tag === 'Student' &&
                                            (u.department_id === dept.id || u.department === dept.id) &&
                                            !(u.email.startsWith('batch_') && u.email.endsWith('@system.local'))
                                        ).length} Students
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="space-y-6">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => { setSelectedDept(null); setSelectedBatch(''); }}
                                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
                            >
                                <ArrowLeft className="h-6 w-6" aria-hidden="true" />
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedDept.name} Students</h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Manage students and batches within this department. To add a new batch, add a student from the User Directory.
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                            <div className="w-64">
                                <label htmlFor="batch-select" className="sr-only">Select Batch</label>
                                <select
                                    id="batch-select"
                                    className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm transition-colors"
                                    value={selectedBatch}
                                    onChange={(e) => setSelectedBatch(e.target.value)}
                                >
                                    <option value="">All Batches</option>
                                    {batches.map(b => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                            </div>
                            {selectedBatch && (
                                <div className="flex space-x-2 mr-2">
                                    <button
                                        onClick={() => handleUpdateBatchStatus('Active')}
                                        disabled={isUpdatingBatch}
                                        className="inline-flex items-center justify-center px-3 py-2 border border-green-300 dark:border-green-800 rounded-md shadow-sm text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 focus:outline-none disabled:opacity-50 transition-colors"
                                        title="Mark all active"
                                    >
                                        Activate Batch
                                    </button>
                                    <button
                                        onClick={() => handleUpdateBatchStatus('Inactive')}
                                        disabled={isUpdatingBatch}
                                        className="inline-flex items-center justify-center px-3 py-2 border border-red-300 dark:border-red-800 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none disabled:opacity-50 transition-colors"
                                        title="Mark all inactive"
                                    >
                                        Deactivate Batch
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={() => { setPrefillBatch(''); setIsStudentModalOpen(true); }}
                                className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none transition-colors"
                            >
                                <Plus className="-ml-1 mr-2 h-5 w-5 text-slate-400" aria-hidden="true" />
                                Add Student
                            </button>
                            <button
                                onClick={() => setIsBatchModalOpen(true)}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none"
                            >
                                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                Add Batch
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                <div className="shadow overflow-hidden border border-slate-200 dark:border-slate-700 sm:rounded-lg">
                                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                        <thead className="bg-slate-50 dark:bg-slate-800">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hierarchy Tag</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                                            {visibleStudents.map((person) => (
                                                <tr
                                                    key={person.id}
                                                    className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                    onClick={() => setSelectedUserProfile(person)}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold uppercase">
                                                                    {person.profile_data?.name ? person.profile_data.name.charAt(0) : person.name ? person.name.charAt(0) : person.email.charAt(0)}
                                                                </div>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-slate-900 dark:text-white">{person.profile_data?.name || person.name || person.email.split('@')[0]}</div>
                                                                <div className="text-sm text-slate-500 dark:text-slate-400">{person.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                                            {person.tag}
                                                        </span>
                                                        {person.batch && (
                                                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                                                {person.batch}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                        {person.status === 'Active' ? (
                                                            <span className="flex items-center text-green-600 dark:text-green-400 font-medium"><UserCheck className="w-4 h-4 mr-1" /> Active</span>
                                                        ) : (
                                                            <span className="flex items-center text-slate-400 dark:text-slate-500 font-medium">Inactive</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {visibleStudents.length === 0 && (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                                        No students found in this department/batch.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Batch Modal */}
            {isBatchModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-slate-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 text-slate-800 dark:text-slate-200">
                            <div>
                                <div className="mt-3 text-center sm:mt-5">
                                    <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white">Add New Batch</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Create a new batch for {selectedDept?.name}. You can add students to it later.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleAddBatch} className="mt-5 sm:mt-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="startYear" className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-left">Start Year</label>
                                        <select
                                            id="startYear"
                                            className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-md py-2 px-3 border transition-colors"
                                            value={startYear}
                                            onChange={(e) => {
                                                const start = parseInt(e.target.value);
                                                setStartYear(start);
                                                if (endYear <= start) setEndYear(start + 4);
                                            }}
                                        >
                                            {Array.from({ length: 20 }, (_, i) => currentYear - 5 + i).map(year => (
                                                <option key={`start-${year}`} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="endYear" className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-left">End Year</label>
                                        <select
                                            id="endYear"
                                            className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-md py-2 px-3 border transition-colors"
                                            value={endYear}
                                            onChange={(e) => setEndYear(parseInt(e.target.value))}
                                        >
                                            {Array.from({ length: 20 }, (_, i) => currentYear - 5 + i).filter(y => y > startYear).map(year => (
                                                <option key={`end-${year}`} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none sm:col-start-2 sm:text-sm"
                                    >
                                        Create Batch
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm transition-colors"
                                        onClick={() => setIsBatchModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <AddUserModal
                isOpen={isStudentModalOpen}
                onClose={() => setIsStudentModalOpen(false)}
                onAdd={handleAddUser}
                fixedTag="Student"
                fixedDepartment={selectedDept?.id}
            />

            <UserProfileDetails
                isOpen={!!selectedUserProfile}
                onClose={() => setSelectedUserProfile(null)}
                userProfile={selectedUserProfile}
                onUpdate={handleUpdateUser}
            />
        </div>
    );
}
