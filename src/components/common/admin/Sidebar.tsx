import React, { useEffect } from 'react';
import feather from 'feather-icons';
import { NavLink, useLocation } from 'react-router-dom';
import SidebarCollapse from './SidebarCollapse';
import {useNotifications} from "../../../context/NotificationContext.tsx";
import {useAuth} from "../../../context/AuthContext.tsx";

// Helper function to get role display info
const getRoleDisplayInfo = (role: string | undefined) => {
    switch (role) {
        case 'bitress':
            return { icon: '⚡', label: 'Bitress', color: 'text-warning' };
        case 'super_admin':
            return { icon: '👑', label: 'Super Admin', color: 'text-primary' };
        case 'admin':
            return { icon: '🔧', label: 'Admin', color: 'text-info' };
        default:
            return { icon: '👤', label: 'Admin', color: 'text-secondary' };
    }
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { user, isBitress, isSuperAdmin } = useAuth();
  const roleInfo = getRoleDisplayInfo(user?.role);

  useEffect(() => {
    feather.replace();
  }, [location]);

  return (
      <div id="layoutSidenav_nav">
        <nav className="sidenav shadow-right sidenav-light">
          <div className="sidenav-menu">
            <div className="nav accordion" id="accordionSidenav">

              {/* Mobile Header */}
              <div className="sidenav-menu-heading d-sm-none">Account</div>
              {/* Home */}
              <div className="sidenav-menu-heading">Home</div>
              <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <div className="nav-link-icon"><i data-feather="activity"></i></div>
                Dashboard
              </NavLink>


                {/* Scholarship */}
                <div className="sidenav-menu-heading">Scholarship</div>

                <NavLink
                    to="/admin/scholarships/dashboard"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                    <div className="nav-link-icon"><i className="far fa-hand-holding-dollar"></i></div>
                    Scholarship Dashboard
                </NavLink>

                <NavLink
                    to="/admin/scholarships/applicants"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                    <div className="nav-link-icon"><i className="far fa-user-check"></i></div>Applicants
                </NavLink>

                <NavLink
                    to="/admin/scholarships/manage"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                    <div className="nav-link-icon"><i className="fas fa-graduation-cap"></i></div>Manage Scholarships
                </NavLink>

                <NavLink
                    to="/admin/scholarships/scholarship-report"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                    <div className="nav-link-icon"><i className="far fa-medal"></i></div>Scholarship Summary
                </NavLink>


              <div className="sidenav-menu-heading">Applicant Management</div>

              <SidebarCollapse
                  id="collapseApplicants"
                  parentId="accordionSidenav"
                  title="Applicants"
                  icon="far fa-users"
                  links={[
                    {
                      to: '/admin/applicants/manage',
                      label: 'Manage Applicants',
                      icon: 'far fa-user-check',
                    },
                    {
                      to: '/admin/students/potential-applicants',
                      label: 'Potential Applicants',
                      icon: 'far fa-user-plus',
                    },
                    {
                      to: '/admin/applicants/not-applied',
                      label: 'Not Applied',
                      icon: 'far fa-user-slash',
                    },
                    {
                      to: '/admin/applicants/archived',
                      label: 'Archived Applications',
                      icon: 'far fa-box-archive',
                    },
                  ]}
              />




              <SidebarCollapse
                  id="collapseReports"
                  parentId="accordionSidenav"
                  title="Reports"
                  icon="far fa-folder-open"
                  links={[
                    {
                      to: '/admin/reports/applicants',
                      label: 'Applicants Report',
                      icon: 'far fa-file-alt',
                    },

                    {
                      to: '/admin/reports/department',
                      label: 'Campus Report',
                      icon: 'far fa-building-columns',
                    }
                  ]}
              />


              {/* Automation */}
              <div className="sidenav-menu-heading">Automation & Rules</div>

              <NavLink to="/admin/bulk-prequalification" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <div className="nav-link-icon"><i data-feather="arrow-up"></i></div>
                Bulk Prequalification
              </NavLink>




              <NavLink to="/admin/fuzzy-logic" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <div className="nav-link-icon"><i className="far fa-brain"></i></div>
                Fuzzy Logic Settings
              </NavLink>


              {/* Academic Config */}
              <div className="sidenav-menu-heading">Academic Config</div>

                <NavLink to="/admin/announcements" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <div className="nav-link-icon"><i data-feather="calendar"></i></div>
                    Announcements
                </NavLink>

              <NavLink to="/admin/academic-years" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <div className="nav-link-icon"><i data-feather="calendar"></i></div>
                Academic Years
              </NavLink>
              <NavLink to="/admin/campuses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <div className="nav-link-icon"><i data-feather="map"></i></div>
                Campuses
              </NavLink>
              <NavLink to="/admin/departments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <div className="nav-link-icon"><i data-feather="grid"></i></div>
                Departments
              </NavLink>
              <NavLink to="/admin/courses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <div className="nav-link-icon"><i data-feather="book-open"></i></div>
                Courses
              </NavLink>

              {/* Student Communication */}
                <div className="sidenav-menu-heading">Communication</div>
                <NavLink to="/admin/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <div className="nav-link-icon"><i className="far fa-bell"></i></div>
                    Notifications
                    {unreadCount > 0 && (
                                    <span className="badge bg-danger badge-sm ms-auto rounded-pill">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                                )}
                            </NavLink>


                {/* System */}
              <div className="sidenav-menu-heading">System</div>
              <NavLink to="/admin/system" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <div className="nav-link-icon"><i data-feather="sliders"></i></div>
                Configuration
              </NavLink>

              {/* User Management - visible to super_admin and bitress */}
              {isSuperAdmin && (
                <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <div className="nav-link-icon"><i data-feather="shield"></i></div>
                  Manage Accounts
                </NavLink>
              )}

              {/* Backup & Restore - visible to super_admin and bitress */}
              {isSuperAdmin && (
                <NavLink to="/admin/system/backups" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <div className="nav-link-icon"><i data-feather="database"></i></div>
                  Backup & Restore
                </NavLink>
              )}

              {/* System Reset - only visible to bitress */}
              {isBitress && (
                <NavLink to="/admin/system/reset" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <div className="nav-link-icon"><i data-feather="trash-2"></i></div>
                  System Reset
                  <span className="badge bg-danger ms-auto">⚡</span>
                </NavLink>
              )}


            </div>
          </div>

          <div className="sidenav-footer">
            <div className="sidenav-footer-content">
              <div className="sidenav-footer-subtitle">Logged in as:</div>
              <div className={`sidenav-footer-title ${roleInfo.color}`}>
                {roleInfo.icon} {roleInfo.label}
              </div>
            </div>
          </div>
        </nav>
      </div>
  );
};

export default Sidebar;
