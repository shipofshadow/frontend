// layouts/AdminLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/admin/Navbar';
import Sidebar from '../components/common/admin/Sidebar';

const AdminLayout: React.FC = () => {
  return (
    <>
      <Navbar />
      <div id="layoutSidenav">
        <Sidebar />
          <div id="layoutSidenav_content">
              <Outlet/>
              <footer className="footer-admin mt-auto footer-light">
                  <div className="container-xl px-4">
                      <div className="row">
                          <div className="col-md-6 small">Copyright © iScholar 2025</div>
                          <div className="col-md-6 text-md-end small">
                              <a href="#!">Privacy Policy</a>
                              ·
                              <a href="#!">Terms &amp; Conditions</a>
                          </div>
                      </div>
                  </div>
              </footer>

          </div>
      </div>
    </>
  );
};

export default AdminLayout;
