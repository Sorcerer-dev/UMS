import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import DashboardRouter from './pages/Dashboard/DashboardRouter';
import UserDirectory from './pages/UserManagement/UserDirectory';
import HODCommonRoom from './pages/Communication/HODCommonRoom';
import NoticeBoard from './pages/Communication/NoticeBoard';
import DepartmentManagement from './pages/Administrative/DepartmentManagement';

function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                            <Route index element={<Navigate to="/dashboard" replace />} />

                            <Route
                                path="dashboard"
                                element={<RoleRoute allowedTags={['Root Admin', 'Managing Director', 'Admin', 'Dean', 'HOD', 'Staff', 'Student']}><DashboardRouter /></RoleRoute>}
                            />

                            <Route
                                path="users"
                                element={<RoleRoute allowedTags={['Root Admin', 'Managing Director', 'Admin', 'Dean', 'HOD']}><UserDirectory /></RoleRoute>}
                            />

                            <Route
                                path="departments"
                                element={<RoleRoute allowedTags={['Root Admin', 'Managing Director', 'Admin']}><DepartmentManagement /></RoleRoute>}
                            />

                            <Route
                                path="hod-room"
                                element={<RoleRoute allowedTags={['Root Admin', 'Managing Director', 'Admin', 'Dean', 'HOD']}><HODCommonRoom /></RoleRoute>}
                            />

                            <Route
                                path="notices"
                                element={<RoleRoute allowedTags={['Root Admin', 'Managing Director', 'Admin', 'Dean', 'HOD', 'Staff', 'Student']}><NoticeBoard /></RoleRoute>}
                            />

                            {/* Fallback 404 Route inside layout */}
                            <Route path="*" element={<div className="p-6 text-center text-slate-500">Resource not found or unauthorized view.</div>} />
                        </Route>
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
