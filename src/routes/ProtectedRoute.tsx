import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <div className="text-muted">Authenticating user, please wait...</div>
            </div>
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/applicant" replace />;
};

export default ProtectedRoute;
