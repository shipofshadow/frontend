import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {SyncLoader} from "react-spinners";

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-gradient"
                 style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <SyncLoader/>
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
