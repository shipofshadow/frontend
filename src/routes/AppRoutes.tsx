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
import ForgotPassword from '../pages/ForgotPassword.tsx';
import Settings from '../pages/applicant/Settings';
import ManageStudents from '../pages/admin/ManageStudents';
import Applicants from '../pages/admin/Applicants';
import Users from '../pages/admin/Users';
import EvaluationRules from '../pages/admin/EvaluationRules.tsx';
import SystemSetting from '../pages/admin/SystemSetting';
import Document from '../pages/admin/Document';
import ActivityLogs from '../pages/admin/ActivityLogs';
import ArchivedApplicants from '../pages/admin/ArchivedApplicants';
import Reports from '../pages/admin/Reports';
import Campuses from '../pages/admin/ManageCampuses.tsx';
import BulkEvaluation from '../pages/admin/BulkEvaluation';
import Metrics from '../pages/admin/Metrics';
import Departments from '../pages/admin/ManageDepartments.tsx';
import AcademicYears from '../pages/admin/AcademicYears';
import Courses from '../pages/admin/ManageCourses.tsx';
import Applications from "../pages/applicant/Applications.tsx";
import Notifications from "../pages/applicant/Notifications.tsx";
import QualifiedStudents from "../pages/admin/QualifiedStudents.tsx";
import ScholarshipSummary from "../pages/admin/reports/ScholarshipSummary.tsx";
import CampusReport from "../pages/admin/reports/CampusReport.tsx";
import ApplicantsReport from "../pages/admin/reports/ApplicantsReport.tsx";
import ArchivedDocuments from "../pages/admin/documents/ArchivedDocuments.tsx";
import SubmittedRequirements from "../pages/admin/documents/SubmittedRequirements.tsx";
import FuzzyLogic from "../pages/admin/FuzzyLogic.tsx";
import ImportStudents from "../pages/admin/ImportStudents.tsx";

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
                    <Route path="users" element={<Users />} />
                    <Route path="system" element={<SystemSetting />} />
                    <Route path="documents" element={<Document />} />
                    <Route path="activity-logs" element={<ActivityLogs />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="campuses" element={<Campuses />} />
                    <Route path="metrics" element={<Metrics />} />
                    <Route path="departments" element={<Departments />} />
                    <Route path="academic-years" element={<AcademicYears />} />
                    <Route path="courses" element={<Courses />} />

                    {/* Applicants Routes */}
                    <Route path="applicants">
                        <Route path="manage" element={<Applicants />} />
                        <Route path="qualified" element={<QualifiedStudents/>} />
                        <Route path="archived" element={<ArchivedApplicants />} />
                    </Route>

                    {/* Document Routes */}
                    <Route path="documents">
                        <Route index element={<Applicants />} />
                        <Route path="requirements" element={<SubmittedRequirements />} />
                        <Route path="archives" element={<ArchivedDocuments />} />
                    </Route>

                    {/* Report Routes */}
                    <Route path="reports">
                        <Route path="applicants" element={<ApplicantsReport/>}/>
                        <Route path="scholarship-summary" element={<ScholarshipSummary/>}/>
                        <Route path="department" element={<CampusReport/>}/>
                    </Route>


                    <Route path="bulk-evaluation" element={<BulkEvaluation />} />
                    <Route path="evaluation-rules" element={<EvaluationRules />} />
                    <Route path="import-students" element={<ImportStudents />} />
                    <Route path="fuzzy-logic" element={<FuzzyLogic />} />

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
                    <Route path="notifications" element={<Notifications/>} />
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