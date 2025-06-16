// routes/AppRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import App from '../pages/LandingPage';
import Login from '../pages/Login';
import AdminLayout from '../layouts/AdminLayout';
import ApplicantLayout from '../layouts/ApplicantLayout';
import Dashboard from '../pages/admin/Dashboard';
import NotFound from '../pages/errors/NotFound';
import ApplicantionForm from '../pages/applicant/ApplicantionForm';
import ProtectedRoute from './ProtectedRoute';
import Profile from '../pages/applicant/Profile';
import Home from '../pages/applicant/Home';
import { isLoggedIn } from '../utils/auth';
import Register from '../pages/Register';
import ForgotPassword from '../pages/applicant/ForgotPassword';
import Settings from '../pages/applicant/Settings';
import ManageStudents from '../pages/admin/ManageStudents';
import ApplicationManagement from '../pages/admin/ApplicationManagement';
import ManageUser from '../pages/admin/ManageUser';
import ScholarshipManagement from '../pages/admin/ScholarshipManagement';
import SystemSetting from '../pages/admin/SystemSetting';
import DocumentVerification from '../pages/admin/DocumentVerification';
import ActivityLogs from '../pages/admin/ActivityLogs';
import ArchivedApplicants from '../pages/admin/ArchivedApplicants';
import ReportsAndAnalytics from '../pages/admin/ReportsAndAnalytics';
import CampusDepartmentConfiguration from '../pages/admin/CampusDepartmentConfiguration';
import BulkUploadImport from '../pages/admin/BulkUploadImport';


export function AuthRedirect() {
  return isLoggedIn() ? <Home /> : <Login />;
}

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={isLoggedIn() ? <Navigate to="/applicant" replace /> : <App />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="manage-students" element={<ManageStudents />} />
        <Route path="application-management" element={<ApplicationManagement />} />
        <Route path="manage-user" element={<ManageUser />} />
        <Route path="scholarship-management" element={<ScholarshipManagement />} />
        <Route path="system-setting" element={<SystemSetting />} />
        <Route path="document-verification" element={<DocumentVerification />} />
        <Route path="activity-logs" element={<ActivityLogs />} />
        <Route path="archived-applicants" element={<ArchivedApplicants />} />
        <Route path="reports-and-analytics" element={<ReportsAndAnalytics />} />
        <Route path="campus-department-configuration" element={<CampusDepartmentConfiguration />} />
        <Route path="bulk-upload-import" element={<BulkUploadImport />} />
        
        {/* Uncomment the following line if you have an AdminDashboard component */}
        {/* <Route path="dashboard" element={<AdminDashboard />} /> */}
        
        {/* Uncomment the following line if you have an AdminActivityLogs component */}
        {/* <Route path="activity-logs" element={<AdminActivityLogs />} /> */}
        
        {/* Uncomment the following line if you have an AdminDashboard component */}
        {/* <Route path="dashboard" element={<AdminDashboard />} /> */}
        
        {/* Uncomment the following line if you have an AdminApplicationManagement component */}
        {/* <Route path="application-management" element={<AdminApplicationManagement />} /> */}
        
        {/* Uncomment the following line if you have an AdminDashboard component */}
        {/* <Route path="dashboard" element={<AdminDashboard />} /> */}
        
        {/* Uncomment the following line if you have an AdminActivityLogs component */}
        {/* <Route path="activity-logs" element={<AdminActivityLogs />} /> */}
        
        {/* Uncomment the following line if you have an AdminDashboard component */}
        {/* <Route path="dashboard" element={<AdminDashboard />} /> */}
        
        {/* Uncomment the following line if you have an AdminApplicationManagement component */}
        {/* <Route path="application-management" element={<AdminApplicationManagement />} /> */}
        
        {/* Uncomment the following line if you have an AdminManageStudents component */}
        {/* <Route path="manage-students" element={<AdminManageStudents />} /> */}
        
        {/* Uncomment the following line if you have an AdminScholarshipManagement component */}
        {/* <Route path="scholarship-management" element={<AdminScholarshipManagement />} /> */}
        
        {/* Uncomment the following line if you have an AdminSystemSetting component */}
        {/* <Route path="system-setting" element={<AdminSystemSetting />} /> */}
        
        {/* Uncomment the following line if you have an AdminUsers component */}
        {/* <Route path="users" element={<AdminUsers />} /> */}
        
        {/* Uncomment the following line if you have an AdminSettings component */}
        {/* <Route path="settings" element={<AdminSettings />} /> */}
        
        {/* Uncomment the following line if you have an AdminReports component */}
        {/* <Route path="reports" element={<AdminReports />} /> */}
        
        {/* Uncomment the following line if you have an AdminNotifications component */}
        {/* <Route path="notifications" element={<AdminNotifications />} /> */}
        {/* <Route path="users" element={<AdminUsers />} /> */}
        
      </Route>

      <Route path="/applicant" element={<ApplicantLayout />}>
        <Route index element={<AuthRedirect />} />
        <Route path="dashboard" element={<AuthRedirect />} />
        <Route path="login" element={<AuthRedirect />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route element={<ProtectedRoute />}>
            <Route path="apply" element={<ApplicantionForm />} />
            <Route path="home" element={<Home />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            
          </Route>
        </Route>

      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

export default AppRoutes;
