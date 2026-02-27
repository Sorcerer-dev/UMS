import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RoleRoute = ({ children, allowedTags }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedTags.includes(user.tag)) {
        // If authenticated but unauthorized, send to dashboard (which they always have access to)
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};
