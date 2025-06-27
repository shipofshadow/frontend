// routes/AppRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import App from '../pages/LandingPage';
import Login from '../pages/Login';
import AdminLayout from '../layouts/AdminLayout';
import ApplicantLayout from '../layouts/ApplicantLayout';
import Dashboard from '../pages/admin/Dashboard';
import NotFound from '../pages/errors/NotFound';
import Apply from '../pages/applicant/Apply.tsx';
import ProtectedRoute from './ProtectedRoute';
import Profile from '../pages/applicant/Profile';
import Home from '../pages/applicant/Home';
import Register from '../pages/Register';
import ForgotPassword from '../pages/applicant/ForgotPassword';
import Settings from '../pages/applicant/Settings';
import ManageStudents from '../pages/admin/ManageStudents';
import Applicants from '../pages/admin/Applicants';
import Users from '../pages/admin/Users';
import ScholarshipManagement from '../pages/admin/ScholarshipManagement';
import SystemSetting from '../pages/admin/SystemSetting';
import Document from '../pages/admin/Document';
import ActivityLogs from '../pages/admin/ActivityLogs';
import ArchivedApplicants from '../pages/admin/ArchivedApplicants';
import Reports from '../pages/admin/Reports';
import Campuses from '../pages/admin/Campuses';
import BulkEvaluation from '../pages/admin/BulkEvaluation';
import Metrics from '../pages/admin/Metrics';
import Departments from '../pages/admin/Departments';
import AcademicYears from '../pages/admin/AcademicYears';
import Courses from '../pages/admin/Courses';
import Applications from "../pages/Applications.tsx";

export function AuthRedirect() {
    const { isAuthenticated, isAdmin, isStudent } = useAuth();

    if (!isAuthenticated) return <Navigate to="/applicant/login" replace />;

    if (isAdmin) return <Navigate to="/admin" replace />;
    if (isStudent) return <Navigate to="/applicant/home" replace />;

    return <Navigate to="/" replace />;
}


const AppRoutes: React.FC = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/applicant" replace /> : <App />} />

            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="manage-students" element={<ManageStudents />} />
                    <Route path="Applicants" element={<Applicants />} />
                    <Route path="users" element={<Users />} />
                    <Route path="scholarship-management" element={<ScholarshipManagement />} />
                    <Route path="system" element={<SystemSetting />} />
                    <Route path="documents" element={<Document />} />
                    <Route path="activity-logs" element={<ActivityLogs />} />
                    <Route path="archived-applicants" element={<ArchivedApplicants />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="campuses" element={<Campuses />} />
                    <Route path="bulk-evaluation" element={<BulkEvaluation />} />
                    <Route path="metrics" element={<Metrics />} />
                    <Route path="departments" element={<Departments />} />
                    <Route path="academic-years" element={<AcademicYears />} />
                    <Route path="courses" element={<Courses />} />
                </Route>
            </Route>


            <Route path="/applicant" element={<ApplicantLayout />}>
                <Route index element={<AuthRedirect />} />
                <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                    <Route index element={<AuthRedirect />} />
                    <Route path="dashboard" element={<AuthRedirect />} />
                    <Route path="apply" element={<Apply />} />
                    <Route path="status" element={<Applications />} />
                    <Route path="home" element={<Home />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Route>

            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;