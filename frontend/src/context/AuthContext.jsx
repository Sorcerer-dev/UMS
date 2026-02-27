import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Start with unauthenticated state
    const [user, setUser] = useState(null);

    const [temporaryAccess, setTemporaryAccess] = useState(null);
    // e.g. { action: 'Attendance', expiresAt: '12:30 PM' }

    // Global Departments State
    const [departments, setDepartments] = useState([]);

    // Global Users State
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch('http://localhost:3000/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUsers();
        } else {
            setUsers([]);
        }
    }, [user]);

    // Fetch departments on mount
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                // Ensure auth token is sent if needed. Right now, using basic fetch.
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:3000/api/departments', {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setDepartments(data);
                }
            } catch (error) {
                console.error('Failed to fetch departments:', error);
            }
        };

        // Fetch once when context mounts
        fetchDepartments();
    }, []);

    const addDepartment = async (deptName) => {
        if (!deptName.trim() || departments.some(d => d.name === deptName.trim())) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/departments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ name: deptName.trim() })
            });

            if (res.ok) {
                const newDept = await res.json();
                setDepartments(prev => [...prev, newDept]);
            } else {
                console.error('Failed to create department');
            }
        } catch (error) {
            console.error('Error creating department:', error);
        }
    };

    const login = async (email, password) => {
        try {
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Login failed');
            }

            const data = await res.json();

            // Assuming backend returns { token, user: { id, email, tag, ... } }
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            setUser(data.user);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        setUser(null);
        setTemporaryAccess(null);
    };

    return (
        <AuthContext.Provider value={{ user, temporaryAccess, departments, users, setUsers, fetchUsers, login, logout, setTemporaryAccess, setUser, addDepartment }}>
            {children}
        </AuthContext.Provider>
    );
};
