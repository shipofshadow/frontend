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
import UserProfile from '../pages/applicant/UserProfile.tsx';
import Home from '../pages/applicant/Home.tsx';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword.tsx';
import Settings from '../pages/applicant/Settings';
import AdminSettings from '../pages/admin/Settings';
import NotApplied from '../pages/admin/NotApplied';
import Applicants from '../pages/admin/Applicants';
import Users from '../pages/admin/Users';
import SystemSetting from '../pages/admin/SystemSetting';
import SystemReset from '../pages/admin/SystemReset';
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
import ManageScholarships from "../pages/admin/scholarships/ManageScholarships.tsx";
import ScholarshipDashboard from "../pages/admin/scholarships/ScholarshipDashboard.tsx";
import ScholarshipApplicants from "../pages/admin/scholarships/ScholarshipApplicants.tsx";
import Prequalify from "../pages/Prequalify.tsx";
import ResetPassword from "../pages/ResetPassword.tsx";
import {IndexLayout} from "../layouts/IndexLayout.tsx";
import AuthCallback from "../context/AuthCallback.tsx";
import CompleteProfile from "../pages/CompleteProfile.tsx";
import PrivacyPolicyPage from "../pages/PrivacyPolicyPage.tsx";
import Application from "../pages/applicant/Application.tsx";
import TermsOfServicePage from "../pages/TermsOfServicePage.tsx";
import ScholarshipSummaryReport from '../pages/admin/reports/ScholarshipSummaryReport.tsx';
import About from "../pages/About.tsx";
import Scholarships from "../pages/Scholarships.tsx";
import EditApplication from "../pages/applicant/EditApplication.tsx";
import BulkAnalysisTool from "../pages/admin/BulkAnalysisTool.tsx";
import BackupRestore from "../pages/admin/BackupRestore.tsx";
import ManageAnnouncements from "../pages/admin/ManageAnnouncements.tsx";
import PotentialApplicants from "../pages/admin/students/PotentialApplicants.tsx";
import EditProfile from "../pages/applicant/EditProfile.tsx";
import ScholarshipRecommendations from "../pages/applicant/ScholarshipRecommendations.tsx";
import ScholarshipSelectionApprovals from "../pages/admin/ScholarshipSelectionApprovals.tsx";
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
                    <Route path="documents" element={<Document />} />
                    <Route path="activity-logs" element={<ActivityLogs />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="campuses" element={<Campuses />} />
                    <Route path="metrics" element={<Metrics />} />
                    <Route path="departments" element={<Departments />} />
                    <Route path="academic-years" element={<AcademicYears />} />
                    <Route path="courses" element={<Courses />} />
                    <Route path="announcements" element={<ManageAnnouncements />} />

                    {/* Applicants Routes */}
                    <Route path="applicants">
                        <Route path="manage" element={<Applicants />} />
                        <Route path="qualified" element={<QualifiedStudents/>} />
                        <Route path="archived" element={<ArchivedApplicants />} />
                        <Route path="not-applied" element={<NotApplied />} />
                    </Route>

                    {/* Students Routes */}
                    <Route path="students">
                        <Route path="potential-applicants" element={<PotentialApplicants />} />
                    </Route>

                    <Route path="scholarships">
                        <Route path="manage" element={<ManageScholarships />} />
                        <Route path="dashboard" element={<ScholarshipDashboard/>} />
                        <Route path="applicants" element={<ScholarshipApplicants/>} />
                        <Route path="scholarship-report" element={<ScholarshipSummaryReport/>}/>
                        <Route path="approvals" element={<ScholarshipSelectionApprovals />} />
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

                    <Route path="system">
                        <Route path="configure" element={<SystemSetting />} />
                        <Route path="backup-restore" element={<BackupRestore />} />
                        <Route path="reset" element={<SystemReset />} />
                    </Route>

                    <Route path="approved" element={<ApprovedApplication />} />

                    <Route path="bulk-prequalification" element={<BulkAnalysisTool />} />
                    <Route path="fuzzy-logic" element={<FuzzyLogic />} />

                    <Route path="notifications" element={<Notifications/>} />

                    <Route path="profile" element={<AdminSettings />} />

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
                    <Route path="profile" element={<UserProfile />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="notifications" element={<Notifications/>} />
                    <Route path="prequalify" element={<Prequalify />} />
                    <Route path="application/:application_id" element={<Application />} />
                    <Route path="application/:application_id/edit" element={<EditApplication />} />
                    <Route path="profile/edit" element={<EditProfile />} />
                    <Route path="scholarship-recommendations" element={<ScholarshipRecommendations />} />
                </Route>
            </Route>

            <Route element={<IndexLayout/>}>
                <Route path="/" element={isAuthenticated ? <Navigate to="/applicant" replace /> : <App />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password" element={<ResetPassword />} />
                <Route path="privacy-policy" element={<PrivacyPolicyPage/>} />
                <Route path="terms-of-service" element={<TermsOfServicePage/>} />
                {/*<Route path="contact" element={<Contact />} />*/}
                <Route path="about" element={<About />} />
                <Route path="scholarships" element={<Scholarships />} />
                <Route path="prequalify" element={<Prequalify/>} />
            </Route>

            <Route path="complete-profile" element={<CompleteProfile />} />
            <Route path="*" element={<NotFound />} />
            <Route path="auth/callback" element={<AuthCallback />} />

        </Routes>
    );
};

export default AppRoutes;