import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return (
            <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
                <div
                    className="spinner-border text-primary mb-3"
                    role="status"
                    style={{ width: '3rem', height: '3rem' }}
                >
                    <span className="visually-hidden">Loading...</span>
                </div>
                <div className="text-muted">Authenticating user, please wait...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />; // Updated path to /login
    }

    if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
        if (user?.role === "student") return <Navigate to="/applicant/home" replace />;
        if (user?.role === "admin") return <Navigate to="/admin" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
