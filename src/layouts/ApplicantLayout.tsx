// layouts/AdminLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/applicant/Navbar';

const AdminLayout: React.FC = () => {
  return (
    <>
      <Navbar />
          <Outlet />
    </>
  );
};

export default AdminLayout;
