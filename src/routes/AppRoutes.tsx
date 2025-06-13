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
        {/* <Route path="users" element={<AdminUsers />} /> */}
      </Route>

      <Route path="/applicant" element={<ApplicantLayout />}>
        <Route index element={<AuthRedirect />} />
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
