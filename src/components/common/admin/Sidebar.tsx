import React, { useEffect } from 'react';
import feather from 'feather-icons';
import {Link, useLocation} from 'react-router-dom';

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

              {/* Home Section */}
              <div className="sidenav-menu-heading">Home</div>
              <Link className="nav-link" to="/admin/dashboard">
                <div className="nav-link-icon"><i data-feather="activity"></i></div>
                Dashboard
              </Link>

              {/* Scholarship Management */}
              <div className="sidenav-menu-heading">Scholarship Management</div>
              <Link className="nav-link" to="/admin/applicants">
                <div className="nav-link-icon"><i data-feather="users"></i></div>
                Applicants
              </Link>
              <Link className="nav-link" to="/admin/documents">
                <div className="nav-link-icon"><i data-feather="file-text"></i></div>
                Documents
              </Link>
              <Link className="nav-link" to="/admin/reports">
                <div className="nav-link-icon"><i data-feather="file"></i></div>
                Reports
              </Link>
              <Link className="nav-link" to="/admin/archived-applicants">
                <div className="nav-link-icon">
                  <i className="far fa-box-archive"></i>
                </div>
                Archived Applications
              </Link>


              {/* Automation */}
              <div className="sidenav-menu-heading">Automation & Rules</div>
              <Link className="nav-link" to="/admin/bulk-evaluation">
                <div className="nav-link-icon"><i data-feather="upload"></i></div>
                Bulk Evaluation
              </Link>
              <Link className="nav-link" to="/admin/config/system">
                <div className="nav-link-icon"><i data-feather="sliders"></i></div>
                System Config
              </Link>
              <Link className="nav-link" to="/admin/evaluation-rules">
                <div className="nav-link-icon"><i className="far fa-balance-scale"></i></div>
                Evaluation Rules
              </Link>


              {/* Academic Config */}
              <div className="sidenav-menu-heading">Academic Config</div>
              <Link className="nav-link" to="/admin/academic-years">
                <div className="nav-link-icon"><i data-feather="calendar"></i></div>
                Academic Years
              </Link>
              <Link className="nav-link" to="/admin/campuses">
                <div className="nav-link-icon"><i data-feather="map"></i></div>
                Campuses
              </Link>
              <Link className="nav-link" to="/admin/departments">
                <div className="nav-link-icon"><i data-feather="grid"></i></div>
                Departments
              </Link>
              <Link className="nav-link" to="/admin/courses">
                <div className="nav-link-icon"><i data-feather="book-open"></i></div>
                Courses
              </Link>

              <div className="sidenav-menu-heading">Student Communication</div>
              <Link className="nav-link" to="/admin/notices">
                <div className="nav-link-icon"><i className="far fa-bell"></i></div>
                Notices
              </Link>

              <Link className="nav-link" to="/admin/messaging">
                <div className="nav-link-icon"><i className="far fa-envelope"></i></div>
                Messaging
              </Link>


              {/* System */}
              <div className="sidenav-menu-heading">System</div>
              <Link className="nav-link" to="/admin/metrics">
                <div className="nav-link-icon"><i data-feather="bar-chart-2"></i></div>
                Metrics
              </Link>
              <Link className="nav-link" to="/admin/users">
                <div className="nav-link-icon"><i data-feather="shield"></i></div>
                Admin Accounts
              </Link>
              <Link className="nav-link" to="/logout">
                <div className="nav-link-icon"><i data-feather="log-out"></i></div>
                Logout
              </Link>

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
