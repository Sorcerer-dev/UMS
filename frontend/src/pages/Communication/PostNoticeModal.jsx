import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PostNoticeModal({ isOpen, onClose, departmentId, onNoticePosted }) {
    const { users } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [visibilityOptions, setVisibilityOptions] = useState([]);
    const [selectedVisibility, setSelectedVisibility] = useState(['All Batches']);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        // Fetch batches specific to this department
        const batches = [...new Set(users.filter(u =>
            u.tag === 'Student' &&
            u.batch &&
            (u.department_id === departmentId || u.department === departmentId)
        ).map(u => u.batch))].sort();

        setVisibilityOptions(['All Batches', ...batches]);
    }, [isOpen, departmentId, users]);

    const handleVisibilityChange = (option) => {
        if (option === 'All Batches') {
            setSelectedVisibility(['All Batches']);
        } else {
            let newVis = [...selectedVisibility.filter(v => v !== 'All Batches')];
            if (newVis.includes(option)) {
                newVis = newVis.filter(v => v !== option);
            } else {
                newVis.push(option);
            }
            if (newVis.length === 0) newVis = ['All Batches'];
            setSelectedVisibility(newVis);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/notices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    content,
                    department_id: departmentId,
                    visibility: selectedVisibility
                })
            });

            if (res.ok) {
                const newNotice = await res.json();
                onNoticePosted(newNotice);
                onClose();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to post notice.");
            }
        } catch (err) {
            console.error("Error posting notice:", err);
            alert("An error occurred while posting.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white" id="modal-title">
                                    Post a New Notice
                                </h3>
                                <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-500">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notice Title *</label>
                                    <input
                                        type="text"
                                        id="title"
                                        required
                                        className="mt-1 block w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., Important Exam Update"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notice Description *</label>
                                    <textarea
                                        id="content"
                                        required
                                        rows={6}
                                        className="mt-1 block w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Write the details of the notice here..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Visibility Tags</label>
                                    <p className="text-xs text-slate-500 mb-3">Select which batches can see this notice.</p>
                                    <div className="flex flex-wrap gap-2">
                                        {visibilityOptions.map(option => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => handleVisibilityChange(option)}
                                                className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${selectedVisibility.includes(option)
                                                    ? 'bg-primary text-white border-primary'
                                                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                                                    }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                disabled={isSubmitting || !title || !content}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {isSubmitting ? 'Posting...' : 'Post Notice'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
