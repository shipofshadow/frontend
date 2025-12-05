import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {SyncLoader} from "react-spinners";

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

// Helper function to check if a role has access based on allowed roles
const hasRoleAccess = (userRole: string | undefined, allowedRoles: string[]): boolean => {
    if (!userRole) return false;
    
    // Direct role match
    if (allowedRoles.includes(userRole)) return true;
    
    // Bitress has access to all admin routes
    if (userRole === 'bitress' && allowedRoles.includes('admin')) return true;
    
    // Super admin has access to all admin routes
    if (userRole === 'super_admin' && allowedRoles.includes('admin')) return true;
    
    // Faculty has access to admin routes (with campus restrictions handled at component level)
    if (userRole === 'faculty' && allowedRoles.includes('admin')) return true;
    
    return false;
};

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
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !hasRoleAccess(user?.role, allowedRoles)) {
        if (user?.role === "student") return <Navigate to="/applicant/home" replace />;
        if (user?.role === "admin" || user?.role === "super_admin" || user?.role === "bitress" || user?.role === "faculty") {
            return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/" replace />;
    }
    
    return <Outlet />;
};

export default ProtectedRoute;
