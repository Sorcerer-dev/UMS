import React, { useState } from 'react';
import { X, Save, Edit2, UserCircle, FileText, Send, BookOpen, Calendar, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TAG_LEVELS } from '../config/navigation';

export default function UserProfileDetails({ isOpen, onClose, userProfile, onUpdate }) {
    const { user: currentUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // New states for student features
    const [newRemark, setNewRemark] = useState('');
    const [showMarksModal, setShowMarksModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);

    React.useEffect(() => {
        if (userProfile && isOpen) {
            const initialData = typeof userProfile.profile_data === 'string'
                ? JSON.parse(userProfile.profile_data || '{}')
                : (userProfile.profile_data || {});
            setFormData(initialData);
            setIsEditing(false);
            setNewRemark('');
            setShowMarksModal(false);
            setShowAttendanceModal(false);
        }
    }, [userProfile, isOpen]);

    if (!isOpen || !userProfile) return null;

    const canEdit = currentUser && TAG_LEVELS[currentUser.tag] > TAG_LEVELS[userProfile.tag];
    const isStudent = userProfile.tag === 'Student';

    const handleSave = async (updatedData = formData) => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/users/${userProfile.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ profile_data: updatedData })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to update profile');
            }

            const data = await res.json();
            onUpdate(data.user); // pass updated user back up
            setIsEditing(false);
            setFormData(updatedData);
        } catch (error) {
            console.error('Error saving profile:', error);
            alert(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddRemark = async () => {
        if (!newRemark.trim()) return;
        const currentRemarks = formData.remarks || [];
        const remarkObj = {
            id: Date.now().toString(),
            text: newRemark.trim(),
            addedBy: currentUser.name || currentUser.tag,
            date: new Date().toISOString()
        };
        const updatedData = { ...formData, remarks: [remarkObj, ...currentRemarks] };
        await handleSave(updatedData);
        setNewRemark('');
    };

    const handleToggleStatus = async () => {
        setIsSaving(true);
        const newStatus = userProfile.status === 'Inactive' ? 'Active' : 'Inactive';
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/users/${userProfile.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to update status');
            }

            const data = await res.json();
            onUpdate(data.user); // pass updated user back up
        } catch (error) {
            console.error('Error saving status:', error);
            alert(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const studentFields = [
        { key: 'address', label: 'Address', type: 'textarea' },
        { key: 'phone', label: 'Phone Number', type: 'tel' },
        { key: 'parentsName', label: 'Parents Name', type: 'text' },
        { key: 'religion', label: 'Religion', type: 'text' },
        { key: 'caste', label: 'Caste', type: 'text' },
        { key: 'hometown', label: 'Hometown', type: 'text' },
        { key: 'feesStructure', label: 'Fees Structure', type: 'text' },
        { key: 'paymentStatus', label: 'Payment Status', type: 'text' },
        { key: 'dob', label: 'Date of Birth', type: 'date' },
        { key: 'regNo', label: 'Registration Number', type: 'text' },
        { key: 'admissionNum', label: 'Admission Number', type: 'text' },
        { key: 'doj', label: 'Date of Joining', type: 'date' },
        { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
        { key: 'bloodGroup', label: 'Blood Group', type: 'text' },
        { key: 'nationality', label: 'Nationality', type: 'text' },
        { key: 'community', label: 'Community', type: 'text' },
        { key: 'boardingStatus', label: 'Boarding Status', type: 'select', options: ['Day Scholar', 'Hosteler'] },
        { key: 'state', label: 'State', type: 'text' },
        { key: 'country', label: 'Country', type: 'text' },
        { key: 'modeOfAdmission', label: 'Mode of Admission', type: 'text' },
        { key: 'cutOff', label: 'Cut Off Marks', type: 'number' },
        { key: 'tenthMarks', label: '10th Marks (%)', type: 'number' },
        { key: 'twelfthMarks', label: '12th Marks (%)', type: 'number' },
        { key: 'aadhar', label: 'Aadhar Number', type: 'text' }
    ];

    const staffFields = [
        { key: 'address', label: 'Address', type: 'textarea' },
        { key: 'phone', label: 'Phone Number', type: 'tel' },
        { key: 'dob', label: 'Date of Birth', type: 'date' },
        { key: 'doj', label: 'Date of Joining', type: 'date' },
        { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
        { key: 'bloodGroup', label: 'Blood Group', type: 'text' },
        { key: 'nationality', label: 'Nationality', type: 'text' },
        { key: 'state', label: 'State', type: 'text' },
        { key: 'country', label: 'Country', type: 'text' },
        { key: 'salaryDetails', label: 'Salary Details', type: 'textarea' }
    ];

    const fieldsToRender = isStudent ? studentFields : staffFields;

    const renderField = ({ key, label, type, options }) => {
        const val = formData[key] || '';
        if (!isEditing) {
            return (
                <div key={key} className="sm:col-span-1 border-b border-slate-100 dark:border-slate-700 pb-3">
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
                    <dd className="mt-1 text-sm text-slate-900 dark:text-slate-200 break-words">{val || '-'}</dd>
                </div>
            );
        }

        return (
            <div key={key} className="sm:col-span-1 pb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
                {type === 'textarea' ? (
                    <textarea
                        className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-md py-2 px-3 border"
                        rows={2}
                        value={val}
                        onChange={(e) => handleChange(key, e.target.value)}
                    />
                ) : type === 'select' ? (
                    <select
                        className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-md py-2 px-3 border"
                        value={val}
                        onChange={(e) => handleChange(key, e.target.value)}
                    >
                        <option value="">Select...</option>
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                ) : (
                    <input
                        type={type}
                        className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-md py-2 px-3 border"
                        value={val}
                        onChange={(e) => handleChange(key, e.target.value)}
                    />
                )}
            </div>
        );
    };

    // ------------- STUDENT FULL SCREEN VIEW -------------
    if (isStudent) {
        return (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 dark:bg-slate-900 flex flex-col items-center animate-in fade-in duration-200">
                {/* Top Section */}
                <div className="w-full bg-white dark:bg-slate-800 shadow-sm pt-8 pb-6 flex flex-col items-center relative border-b border-slate-200 dark:border-slate-700">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-600 z-10"
                    >
                        <X className="w-6 h-6 text-slate-600" />
                    </button>

                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-500 font-bold text-5xl mb-4 relative">
                        {userProfile.profile_data?.name?.charAt(0) || userProfile.name?.charAt(0) || userProfile.email.charAt(0).toUpperCase()}
                    </div>

                    <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                        {userProfile.profile_data?.name || userProfile.name || userProfile.email.split('@')[0]}
                    </h2>

                    <p className="text-slate-500 dark:text-slate-400 text-lg flex items-center mt-1">
                        <Mail className="w-4 h-4 mr-2" />
                        {userProfile.email}
                    </p>

                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm border border-indigo-200 shadow-sm">
                            Student
                        </span>
                        {userProfile.batch && (
                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm border border-blue-200 shadow-sm">
                                {userProfile.batch}
                            </span>
                        )}
                        <span className={`px-3 py-1 rounded-full font-semibold text-sm border shadow-sm ${userProfile.status === 'Inactive' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                            {userProfile.status === 'Inactive' ? 'Inactive' : 'Active'}
                        </span>
                    </div>

                    {canEdit && !isEditing && (
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={handleToggleStatus}
                                disabled={isSaving}
                                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors border shadow-sm ${userProfile.status === 'Inactive' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'}`}
                            >
                                {isSaving ? 'Updating...' : (userProfile.status === 'Inactive' ? 'Activate User' : 'Deactivate User')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Content Areas */}
                <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                    {/* Left Column: Details & Remarks */}
                    <div className="lg:col-span-2 space-y-6 lg:space-y-8">

                        {/* Profile Info Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8 relative">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                                    <UserCircle className="w-6 h-6 text-indigo-500" /> Profile Information
                                </h3>
                                {canEdit && (
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${isEditing ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'}`}
                                    >
                                        <Edit2 className="w-4 h-4" /> {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                                    </button>
                                )}
                            </div>

                            {isEditing && (
                                <div className="mb-6 flex justify-end">
                                    <button
                                        onClick={() => handleSave()}
                                        disabled={isSaving}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
                                    >
                                        <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}

                            <dl className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 ${isEditing ? 'gap-y-4' : ''}`}>
                                {studentFields.map(renderField)}
                            </dl>
                        </div>

                        {/* Remarks Section */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                                <FileText className="w-6 h-6 text-amber-500" /> Remarks
                            </h3>

                            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {(formData.remarks || []).length > 0 ? formData.remarks.map((r, i) => (
                                    <div key={i} className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl border border-slate-100 dark:border-slate-600 hover:shadow-sm transition-shadow">
                                        <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">{r.text}</p>
                                        <div className="flex justify-between mt-3 text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            <span>{r.addedBy}</span>
                                            <span>{new Date(r.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8">
                                        <p className="text-slate-500 dark:text-slate-400 italic">No remarks have been added for this student.</p>
                                    </div>
                                )}
                            </div>

                            {/* Any staff or admin can add a remark logically, but we allow whoever has higher tag or specific roles */}
                            {(canEdit || ['Admin', 'Root Admin', 'Managing Director', 'HR', 'Principal', 'HOD', 'Staff'].includes(currentUser.tag)) && (
                                <div className="flex gap-3 bg-slate-50 dark:bg-slate-700 p-2 rounded-xl border border-slate-200 dark:border-slate-600">
                                    <input
                                        type="text"
                                        value={newRemark}
                                        onChange={e => setNewRemark(e.target.value)}
                                        placeholder="Add a new remark..."
                                        className="flex-1 bg-transparent border-none rounded-lg px-4 py-2 focus:ring-0 outline-none placeholder:text-slate-400 dark:text-white"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddRemark()}
                                    />
                                    <button
                                        onClick={handleAddRemark}
                                        disabled={!newRemark.trim()}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-sm flex items-center"
                                    >
                                        <Send className="w-4 h-4 ml-1" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Cards (Marks, Attendance, Sub-info) */}
                    <div className="space-y-6 lg:space-y-8">

                        {/* Marks & Attendance Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Marks Square Card */}
                            <div
                                onClick={() => setShowMarksModal(true)}
                                className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 flex flex-col justify-center items-center aspect-square text-center group"
                            >
                                <BookOpen className="w-12 h-12 mb-4 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                                <span className="font-bold text-xl mb-1">Marks</span>
                                <span className="text-sm opacity-80 font-medium">Academics</span>
                            </div>

                            {/* Attendance Round Card */}
                            <div
                                onClick={() => setShowAttendanceModal(true)}
                                className="bg-white dark:bg-slate-800 border text-center border-slate-200 dark:border-slate-700 rounded-2xl p-6 cursor-pointer hover:border-emerald-400 hover:shadow-lg transition-all transform hover:-translate-y-1 flex flex-col items-center justify-center aspect-square relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-emerald-50 dark:bg-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="relative z-10 w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-700 group-hover:border-emerald-100 dark:group-hover:border-emerald-800/50 transition-colors flex items-center justify-center mb-3">
                                    <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-l-transparent border-b-transparent transform rotate-45" />
                                    <span className="text-3xl font-extrabold text-slate-800 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                        {formData.attendancePercentage || 95}<span className="text-lg">%</span>
                                    </span>
                                </div>
                                <span className="font-bold text-slate-800 dark:text-slate-200 relative z-10 group-hover:text-emerald-800 dark:group-hover:text-emerald-400">Attendance</span>
                            </div>
                        </div>

                        {/* Department Info */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 pb-3 border-b border-slate-100 dark:border-slate-700 flex items-center">
                                Department Roles
                            </h3>
                            <div className="space-y-6">
                                <div className="group">
                                    <label className="text-xs text-slate-400 uppercase tracking-widest font-bold">Mentor</label>
                                    {isEditing ? (
                                        <input type="text" className="w-full mt-2 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" value={formData.mentor || ''} onChange={e => handleChange('mentor', e.target.value)} placeholder="Assign Mentor..." />
                                    ) : (
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{formData.mentor || 'Not Assigned'}</p>
                                    )}
                                </div>
                                <div className="group">
                                    <label className="text-xs text-slate-400 uppercase tracking-widest font-bold">Staff Incharge</label>
                                    {isEditing ? (
                                        <input type="text" className="w-full mt-2 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" value={formData.staffIncharge || ''} onChange={e => handleChange('staffIncharge', e.target.value)} placeholder="Assign Staff Incharge..." />
                                    ) : (
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{formData.staffIncharge || 'Not Assigned'}</p>
                                    )}
                                </div>
                                <div className="group">
                                    <label className="text-xs text-slate-400 uppercase tracking-widest font-bold">Head of Department</label>
                                    {isEditing ? (
                                        <input type="text" className="w-full mt-2 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" value={formData.hod || ''} onChange={e => handleChange('hod', e.target.value)} placeholder="Assign HOD..." />
                                    ) : (
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{formData.hod || 'Not Assigned'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- Modals for Marks & Attendance --- */}
                {showAttendanceModal && (
                    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                                    <Calendar className="w-6 h-6 mr-2 text-emerald-500" /> Absence Details
                                </h3>
                                <button onClick={() => setShowAttendanceModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6 border border-slate-100 dark:border-slate-700">
                                <p className="text-sm text-slate-500 mb-1">Overall Attendance</p>
                                <p className="text-3xl font-extrabold text-emerald-600">{formData.attendancePercentage || 95}%</p>
                            </div>

                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm uppercase tracking-wider">Leave History</h4>
                            <ul className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                {(formData.absenceRecords || []).length > 0 ? formData.absenceRecords.map((r, i) => (
                                    <li key={i} className="flex flex-col border border-slate-100 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg p-3 shadow-sm hover:shadow transition-shadow">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">{new Date(r.date || Date.now()).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                            <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-red-100 text-red-600">Absent</span>
                                        </div>
                                        <span className="text-slate-500 text-sm">{r.reason || 'No reason provided'}</span>
                                    </li>
                                )) : (
                                    <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                        <p className="text-slate-500 dark:text-slate-400">Perfect attendance! No absences recorded.</p>
                                    </div>
                                )}
                            </ul>
                            <div className="mt-6">
                                <button onClick={() => setShowAttendanceModal(false)} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 rounded-xl transition-colors">Close Details</button>
                            </div>
                        </div>
                    </div>
                )}

                {showMarksModal && (
                    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                                    <BookOpen className="w-6 h-6 mr-2 text-indigo-500" /> Academic Performance
                                </h3>
                                <button onClick={() => setShowMarksModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                            </div>

                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                {formData.marks && Object.keys(formData.marks).length > 0 ? (
                                    Object.entries(formData.marks).map(([subject, score], i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{subject}</span>
                                            <span className="font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-lg">{score}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Marks entries pending for this term</p>
                                        <p className="text-sm text-slate-400 mt-1">Data will appear here once uploaded by staff.</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6">
                                <button onClick={() => setShowMarksModal(false)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors">Close Record</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        );
    }

    // ------------- STAFF SLIDE-OVER VIEW (existing) -------------
    return (
        <div className={`fixed inset-y-0 right-0 z-50 flex max-w-full pl-10 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" onClick={onClose} />
            <div className="pointer-events-auto w-screen max-w-2xl relative">
                <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-slate-800 shadow-2xl">
                    <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-6 sm:px-6 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-start justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white" id="slide-over-title">
                                Profile Details
                            </h2>
                            <div className="ml-3 flex h-7 items-center">
                                <button
                                    type="button"
                                    className="rounded-full p-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none transition-colors"
                                    onClick={onClose}
                                >
                                    <span className="sr-only">Close panel</span>
                                    <X className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="relative flex-1 px-4 py-6 sm:px-6">
                        {/* Header Info */}
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{userProfile.name || userProfile.email.split('@')[0]}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center"><Mail className="w-3 h-3 mr-1" /> {userProfile.email}</p>
                                <div className="mt-3 flex space-x-2">
                                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200">
                                        {userProfile.tag}
                                    </span>
                                    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold border ${userProfile.status === 'Inactive' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                        {userProfile.status === 'Inactive' ? 'Inactive' : 'Active'}
                                    </span>
                                </div>
                            </div>

                            {canEdit && !isEditing && (
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleToggleStatus}
                                        disabled={isSaving}
                                        className={`inline-flex justify-center items-center rounded-lg border py-2 px-4 text-sm font-medium shadow-sm transition-colors ${userProfile.status === 'Inactive'
                                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                            : 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                                            }`}
                                    >
                                        {isSaving ? 'Updating...' : (userProfile.status === 'Inactive' ? 'Activate User' : 'Deactivate User')}
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="inline-flex justify-center items-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        <Edit2 className="h-4 w-4 mr-2 text-slate-500" />
                                        Edit Profile
                                    </button>
                                </div>
                            )}

                            {canEdit && isEditing && (
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => {
                                            const initialData = typeof userProfile.profile_data === 'string'
                                                ? JSON.parse(userProfile.profile_data || '{}')
                                                : (userProfile.profile_data || {});
                                            setFormData(initialData);
                                            setIsEditing(false);
                                        }}
                                        className="inline-flex justify-center items-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleSave()}
                                        disabled={isSaving}
                                        className="inline-flex justify-center items-center rounded-lg border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Data Grid */}
                        <dl className={`grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 ${isEditing ? 'gap-y-4' : ''}`}>
                            {fieldsToRender.map(renderField)}
                        </dl>

                    </div>
                </div>
            </div>
        </div>
    );
}
