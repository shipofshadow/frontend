// routes/AppRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from '../pages/admin/Login';
import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import NotFound from '../pages/errors/NotFound';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
        {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        {/* <Route path="users" element={<AdminUsers />} /> */}
      </Route>


      {/* Applicant routes */}
      {/* <Route path="/applicant" element={<ApplicantLayout />}>
        <Route index element={<ApplicantDashboard />} />
        <Route path="profile" element={<ApplicantProfile />} />
      </Route> */}

      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

export default AppRoutes;
