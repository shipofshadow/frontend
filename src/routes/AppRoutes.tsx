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
import Home from '../pages/applicant/Home.tsx';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword.tsx';
import Settings from '../pages/applicant/Settings';
import NotApplied from '../pages/admin/NotApplied';
import Applicants from '../pages/admin/Applicants';
import Users from '../pages/admin/Users';
import SystemSetting from '../pages/admin/SystemSetting';
import Document from '../pages/admin/Document';
import ActivityLogs from '../pages/admin/ActivityLogs';
import ArchivedApplicants from '../pages/admin/ArchivedApplicants';
import Reports from '../pages/admin/Reports';
import Campuses from '../pages/admin/ManageCampuses.tsx';
import ApprovedApplication from '../pages/admin/ApprovedApplication.tsx';
import Metrics from '../pages/admin/Metrics';
import Departments from '../pages/admin/ManageDepartments.tsx';
import AcademicYears from '../pages/admin/AcademicYears';
import Courses from '../pages/admin/ManageCourses.tsx';
import Applications from "../pages/applicant/Applications.tsx";
import Notifications from "../pages/applicant/Notifications.tsx";
import QualifiedStudents from "../pages/admin/QualifiedStudents.tsx";
import CampusReport from "../pages/admin/reports/CampusReport.tsx";
import ApplicantsReport from "../pages/admin/reports/ApplicantsReport.tsx";
import ArchivedDocuments from "../pages/admin/documents/ArchivedDocuments.tsx";
import SubmittedRequirements from "../pages/admin/documents/SubmittedRequirements.tsx";
import FuzzyLogic from "../pages/admin/FuzzyLogic.tsx";
import ImportStudents from "../pages/admin/StudentImportTool.tsx";
import ManageScholarships from "../pages/admin/scholarships/ManageScholarships.tsx";
import ScholarshipDashboard from "../pages/admin/scholarships/ScholarshipDashboard.tsx";
import StudentScholarshipReport from "../pages/admin/reports/StudentScholarshipReport.tsx";
import Prequalify from "../pages/applicant/Prequalify.tsx";
import ApplicationsList from "../pages/applicant/ApplicationLists.tsx";
import ResetPassword from "../pages/ResetPassword.tsx";
import ViewApplication from "../pages/admin/ViewApplication.tsx";
import {IndexLayout} from "../layouts/IndexLayout.tsx";
import AuthCallback from "../context/AuthCallback.tsx";
import CompleteProfile from "../pages/CompleteProfile.tsx";
import PrivacyPolicyPage from "../pages/PrivacyPolicyPage.tsx";
import SelectedScholarshipView from "../pages/applicant/SelectedScholarshipView.tsx";   
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
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
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
                        <Route path="not-applied" element={<NotApplied />} />
                    </Route>

                    <Route path="scholarships">
                        <Route path="manage" element={<ManageScholarships />} />
                        <Route path="dashboard" element={<ScholarshipDashboard/>} />
                        <Route path="scholarship-report" element={<StudentScholarshipReport/>}/>

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
                        <Route path="department" element={<CampusReport/>}/>
                    </Route>


                    <Route path="approved" element={<ApprovedApplication />} />

                    <Route path="import-students" element={<ImportStudents />} />
                    <Route path="fuzzy-logic" element={<FuzzyLogic />} />

                    <Route path="notifications" element={<Notifications/>} />

                    <Route path="applications/:id/mock" element={<ViewApplication/>} />



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
                    <Route path="prequalify" element={<Prequalify />} />
                    <Route path="applications" element={<ApplicationsList />} />
                    <Route path="application/view" element={<ViewApplication />} />
                    <Route path="test" element={<SelectedScholarshipView />} />
                </Route>
            </Route>

            <Route element={<IndexLayout/>}>
                <Route path="/" element={isAuthenticated ? <Navigate to="/applicant" replace /> : <App />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="complete-profile" element={<CompleteProfile />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password" element={<ResetPassword />} />
                <Route path="privacy-policy" element={<PrivacyPolicyPage/>} />
            </Route>


            <Route path="*" element={<NotFound />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

        </Routes>
    );
};

export default AppRoutes;