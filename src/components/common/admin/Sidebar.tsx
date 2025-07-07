import React, { useEffect } from 'react';
import feather from 'feather-icons';
import { NavLink, useLocation } from 'react-router-dom';
import SidebarCollapse from './SidebarCollapse';

const Sidebar: React.FC = () => {
  const location = useLocation();

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
              <a className="nav-link d-sm-none" href="#">
                <div className="nav-link-icon"><i data-feather="bell"></i></div>
                Alerts <span className="badge bg-warning-soft text-warning ms-auto">4 New!</span>
              </a>

              {/* Home */}
              <div className="sidenav-menu-heading">Home</div>
              <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <div className="nav-link-icon"><i data-feather="activity"></i></div>
                Dashboard
              </NavLink>

              {/* Scholarship Management */}
              <div className="sidenav-menu-heading">Scholarship Management</div>
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
                      to: '/admin/applicants/qualified',
                      label: 'Qualified Applicants',
                      icon: 'far fa-check-circle',
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
                      to: '/admin/reports/scholarship-summary',
                      label: 'Scholarship Summary',
                      icon: 'far fa-medal',
                    },
                    {
                      to: '/admin/reports/department',
                      label: 'Campus Report',
                      icon: 'far fa-building-columns',
                    }
                  ]}
              />

              <div className="sidenav-menu-heading">Documents</div>

              <SidebarCollapse
                  id="collapseDocuments"
                  parentId="accordionSidenav"
                  title="Documents"
                  icon="far fa-folder-open"
                  links={[
                    {
                      to: '/admin/documents/requirements',
                      label: 'Submitted Requirements',
                      icon: 'far fa-file-alt',
                    },
                    {
                      to: '/admin/documents/archives',
                      label: 'Archived Files',
                      icon: 'far fa-box-archive',
                    }
                  ]}
              />

              {/* Automation */}
              <div className="sidenav-menu-heading">Automation & Rules</div>

              <NavLink to="/admin/import-students" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <div className="nav-link-icon"><i data-feather="upload-cloud"></i></div>
                Import Student List
              </NavLink>


              <NavLink to="/admin/bulk-evaluation" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <div className="nav-link-icon"><i data-feather="upload"></i></div>
                Bulk Evaluation
<<<<<<< HEAD
              </Link>
              <Link className="nav-link" to="/admin/config-system">
                <div className="nav-link-icon"><i data-feather="sliders"></i></div>
                System Config 
              </Link>
=======
              </NavLink>

              <NavLink to="/admin/evaluation-rules" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <div className="nav-link-icon"><i className="far fa-balance-scale"></i></div>
                Evaluation Rules
              </NavLink>

              <NavLink to="/admin/fuzzy-logic" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <div className="nav-link-icon"><i className="far fa-brain"></i></div>
                Fuzzy Logic Settings
              </NavLink>

>>>>>>> bdd07267b184537706a1db265b2763e9aacea33a

              {/* Academic Config */}
              <div className="sidenav-menu-heading">Academic Config</div>
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
              <div className="sidenav-menu-heading">Student Communication</div>
              <NavLink to="/admin/notices" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <div className="nav-link-icon"><i className="far fa-bell"></i></div>
                Notices
              </NavLink>
              <NavLink to="/admin/messaging" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <div className="nav-link-icon"><i className="far fa-envelope"></i></div>
                Messaging
              </NavLink>

              {/* System */}
              <div className="sidenav-menu-heading">System</div>
              <NavLink to="/admin/system" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <div className="nav-link-icon"><i data-feather="sliders"></i></div>
                Configuration
              </NavLink>
              <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <div className="nav-link-icon"><i data-feather="shield"></i></div>
                Manage Accounts
              </NavLink>
              <NavLink to="/admin/system/logs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <div className="nav-link-icon"><i data-feather="file-text"></i></div>
                System Logs
              </NavLink>
              <NavLink to="/admin/system/backups" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <div className="nav-link-icon"><i data-feather="database"></i></div>
                Backup & Restore
              </NavLink>


            </div>
          </div>

          <div className="sidenav-footer">
            <div className="sidenav-footer-content">
              <div className="sidenav-footer-subtitle">Logged in as:</div>
              <div className="sidenav-footer-title">Admin</div>
            </div>
          </div>
        </nav>
      </div>
  );
};

export default Sidebar;
