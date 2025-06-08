// layouts/AdminLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const AdminLayout: React.FC = () => {
  return (
    <>
      <Navbar />
      <div id="layoutSidenav">
      <Sidebar />
      <div id="layoutSidenav_content">
        <Outlet />
      </div>
      </div>
    </>
  );
};

export default AdminLayout;
