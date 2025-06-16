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
        
        {/* Uncomment the following line if you have an AdminDashboard component */}
        {/* <Route path="dashboard" element={<AdminDashboard />} /> */}
        
        {/* Uncomment the following line if you have an AdminActivityLogs component */}
        {/* <Route path="activity-logs" element={<AdminActivityLogs />} /> */}
        
        {/* Uncomment the following line if you have an AdminApplicationManagement component */}
        {/* <Route path="application-management" element={<AdminApplicationManagement />} /> */}
        
        {/* Uncomment the following line if you have an AdminDashboard component */}
        {/* <Route path="dashboard" element={<AdminDashboard />} /> */}
        
        {/* Uncomment the following line if you have an AdminActivityLogs component */}
        {/* <Route path="activity-logs" element={<AdminActivityLogs />} /> */}
        
        {/* Uncomment the following line if you have an AdminApplicationManagement component */}
        {/* <Route path="application-management" element={<AdminApplicationManagement />} /> */}
        
        {/* Uncomment the following line if you have an AdminDashboard component */}
        {/* <Route path="dashboard" element={<AdminDashboard />} /> */}
        
        {/* Uncomment the following line if you have an AdminActivityLogs component */}
        {/* <Route path="activity-logs" element={<AdminActivityLogs />} /> */}
        
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
