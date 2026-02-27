import React, { useState } from 'react';
import { X, Save, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TAG_LEVELS } from '../config/navigation';

export default function UserProfileDetails({ isOpen, onClose, userProfile, onUpdate }) {
    const { user: currentUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Update form data when profile opens or changes
    React.useEffect(() => {
        if (userProfile && isOpen) {
            const initialData = typeof userProfile.profile_data === 'string'
                ? JSON.parse(userProfile.profile_data || '{}')
                : (userProfile.profile_data || {});
            setFormData(initialData);
            setIsEditing(false);
        }
    }, [userProfile, isOpen]);

    if (!isOpen || !userProfile) return null;

    // Hierarchy check: Can edit if currentUser rank > userProfile rank
    const canEdit = currentUser && TAG_LEVELS[currentUser.tag] > TAG_LEVELS[userProfile.tag];

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/users/${userProfile.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ profile_data: formData })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to update profile');
            }

            const data = await res.json();
            onUpdate(data.user); // pass updated user back up
            setIsEditing(false);
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

    const fieldsToRender = userProfile.tag === 'Student' ? studentFields : staffFields;

    const renderField = ({ key, label, type, options }) => {
        const val = formData[key] || '';
        if (!isEditing) {
            return (
                <div key={key} className="sm:col-span-1 border-b border-slate-100 pb-3">
                    <dt className="text-sm font-medium text-slate-500">{label}</dt>
                    <dd className="mt-1 text-sm text-slate-900 break-words">{val || '-'}</dd>
                </div>
            );
        }

        return (
            <div key={key} className="sm:col-span-1 pb-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                {type === 'textarea' ? (
                    <textarea
                        className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3 border"
                        rows={2}
                        value={val}
                        onChange={(e) => handleChange(key, e.target.value)}
                    />
                ) : type === 'select' ? (
                    <select
                        className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3 border"
                        value={val}
                        onChange={(e) => handleChange(key, e.target.value)}
                    >
                        <option value="">Select...</option>
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                ) : (
                    <input
                        type={type}
                        className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3 border"
                        value={val}
                        onChange={(e) => handleChange(key, e.target.value)}
                    />
                )}
            </div>
        );
    };

    return (
        <div className={`fixed inset-y-0 right-0 z-50 flex max-w-full pl-10 transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose} />
            <div className="pointer-events-auto w-screen max-w-2xl relative">
                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="bg-slate-50 px-4 py-6 sm:px-6 border-b border-slate-200">
                        <div className="flex items-start justify-between">
                            <h2 className="text-xl font-bold text-slate-900" id="slide-over-title">
                                Profile Details
                            </h2>
                            <div className="ml-3 flex h-7 items-center">
                                <button
                                    type="button"
                                    className="rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    onClick={onClose}
                                >
                                    <span className="sr-only">Close panel</span>
                                    <X className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="relative flex-1 px-4 py-6 sm:px-6">
                        {/* Header Info */}
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800">{userProfile.name || userProfile.email.split('@')[0]}</h3>
                                <p className="text-sm text-slate-500 mt-1">{userProfile.email}</p>
                                <div className="mt-2 flex space-x-2">
                                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
                                        {userProfile.tag}
                                    </span>
                                    {userProfile.batch && (
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                                            {userProfile.batch}
                                        </span>
                                    )}
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${userProfile.status === 'Inactive' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                        {userProfile.status === 'Inactive' ? 'Inactive' : 'Active'}
                                    </span>
                                </div>
                            </div>
                            {canEdit && !isEditing && (
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleToggleStatus}
                                        disabled={isSaving}
                                        className={`inline-flex justify-center rounded-md border py-2 px-4 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${userProfile.status === 'Inactive'
                                                ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100 focus:ring-green-500'
                                                : 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500'
                                            }`}
                                    >
                                        {isSaving ? 'Updating...' : (userProfile.status === 'Inactive' ? 'Activate User' : 'Deactivate User')}
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="inline-flex justify-center rounded-md border border-slate-300 bg-white py-2 px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
                                        className="inline-flex justify-center rounded-md border border-slate-300 bg-white py-2 px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-dark focus:outline-none disabled:opacity-50"
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
