import { Home, Users, BookOpen, Clock, FileText, Settings, MessageSquare, Briefcase } from 'lucide-react';

export const TAG_LEVELS = {
    'Root Admin': 100,
    'Managing Director': 90,
    'Admin': 80,
    'Dean': 70,
    'HOD': 60,
    'Staff': 50,
    'Student': 40
};

// Central mapping of all routes and their required tags
export const NAV_ITEMS = [
    {
        category: 'Global',
        items: [
            { path: '/dashboard', label: 'Dashboard', icon: Home, allowedTags: ['Root Admin', 'Managing Director', 'Admin', 'Dean', 'HOD', 'Staff', 'Student'] },
        ]
    },
    {
        category: 'Academic',
        items: [
            { path: '/attendance', label: 'Attendance', icon: Clock, allowedTags: ['Dean', 'HOD', 'Staff', 'Student'] },
            { path: '/marks', label: 'Marks/Grades', icon: FileText, allowedTags: ['Dean', 'HOD', 'Staff', 'Student'] },
        ]
    },
    {
        category: 'Administrative',
        items: [
            { path: '/users', label: 'User Directory', icon: Users, allowedTags: ['Root Admin', 'Managing Director', 'Admin', 'Dean', 'HOD'] },
            { path: '/departments', label: 'Departments', icon: Briefcase, allowedTags: ['Root Admin', 'Managing Director', 'Admin'] },
        ]
    },
    {
        category: 'Communication',
        items: [
            { path: '/notices', label: 'Notice Board', icon: BookOpen, allowedTags: ['Root Admin', 'Managing Director', 'Admin', 'Dean', 'HOD', 'Staff', 'Student'] },
            { path: '/hod-room', label: 'HOD Common Room', icon: MessageSquare, allowedTags: ['Root Admin', 'Managing Director', 'Admin', 'Dean', 'HOD'] },
        ]
    }
];

export const hasAccess = (userTag, allowedTags) => {
    return allowedTags.includes(userTag);
};
