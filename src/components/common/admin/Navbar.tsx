import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import feather from 'feather-icons';
import {useAuth} from "../../../context/AuthContext.tsx";
import {NotificationBell} from "./NotificationBell.tsx";
import {API_BASE_URL} from "../../../config.ts";
import {useSettings} from "../../../context/SettingsContext.tsx";

// Role badge component for displaying user role and campus scope
const RoleBadge: React.FC = () => {
  const { user, isFaculty, userCampusName } = useAuth();
  
  if (!user) return null;

  const getRoleBadgeInfo = () => {
    switch (user.role) {
      case 'bitress':
        return { label: 'Bitress', bgColor: 'bg-warning', textColor: 'text-dark', icon: '⚡' };
      case 'super_admin':
        return { label: 'Super Admin', bgColor: 'bg-danger', textColor: 'text-white', icon: '👑' };
      case 'admin':
        return { label: 'Admin', bgColor: 'bg-info', textColor: 'text-white', icon: '🔧' };
      case 'faculty':
        return { label: 'Faculty', bgColor: 'bg-primary', textColor: 'text-white', icon: '👨‍🏫' };
      default:
        return null;
    }
  };

  const badgeInfo = getRoleBadgeInfo();
  if (!badgeInfo) return null;

  return (
    <li className="nav-item d-none d-lg-flex align-items-center me-3">
      <div className={`badge ${badgeInfo.bgColor} ${badgeInfo.textColor} d-flex align-items-center py-2 px-3`}>
        <span className="me-1">{badgeInfo.icon}</span>
        <span>{badgeInfo.label}</span>
        {isFaculty && userCampusName && (
          <span className="ms-2 badge bg-light text-dark">
            <i className="fas fa-map-marker-alt me-1" style={{ fontSize: '0.7rem' }}></i>
            {userCampusName}
          </span>
        )}
      </div>
    </li>
  );
};

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const {logout, user } = useAuth();
  const {settings} = useSettings();

    const avatar = user?.profile?.avatar;
    const path = avatar
        ? `${API_BASE_URL}/api/profile/avatar/${encodeURIComponent(avatar.split("/").pop()!)}`
        : "/default.png";  // served from public folder
    console.log(user)


    useEffect(() => {
  feather.replace();

  const sidebarToggle = document.getElementById('sidebarToggle');

  // Define handler function once
  const handleSidebarToggleClick = (event: MouseEvent) => {
    event.preventDefault();
    document.body.classList.toggle('sidenav-toggled');
    localStorage.setItem(
      'sb|sidebar-toggle',
      document.body.classList.contains('sidenav-toggled').toString()
    );
  };

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', handleSidebarToggleClick);
  }

  return () => {
    if (sidebarToggle) {
      sidebarToggle.removeEventListener('click', handleSidebarToggleClick);
    }
  };
}, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      className="topnav navbar navbar-expand shadow justify-content-between justify-content-sm-start navbar-light bg-white"
      id="sidenavAccordion"
    >
      <button
        className="btn btn-icon btn-transparent-dark order-1 order-lg-0 me-2 ms-lg-2 me-lg-0"
        id="sidebarToggle"
      >
        <i data-feather="menu" />
      </button>

      <Link className="navbar-brand pe-3 ps-4 ps-lg-2" to="/admin">
          {settings.systemName}
      </Link>

      <ul className="navbar-nav align-items-center ms-auto">
        {/* Role Badge */}
        <RoleBadge />

        {/* Notifications */}
       <NotificationBell/>

        {/* User Menu */}
        <li className="nav-item dropdown no-caret dropdown-user me-3 me-lg-4">
          <button
            className="btn btn-icon btn-transparent-dark dropdown-toggle"
            id="navbarDropdownUserImage"
            data-bs-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <img
              className="img-fluid"
              src={path}
              alt="User"
            />
          </button>
          <div
            className="dropdown-menu dropdown-menu-end border-0 shadow animated--fade-in-up"
            aria-labelledby="navbarDropdownUserImage"
          >
            <h6 className="dropdown-header d-flex align-items-center">
              <img
                className="dropdown-user-img"
                src={path}
                alt="Profile"
              />
              <div className="dropdown-user-details">
                <div className="dropdown-user-details-name">{user?.username}</div>
                <div className="dropdown-user-details-email">{user?.profile?.email}</div>
              </div>
            </h6>
            <div className="dropdown-divider" />
            <Link className="dropdown-item" to="/admin/profile">
              <div className="dropdown-item-icon">
                <i data-feather="settings" />
              </div>
              Account
            </Link>
            <button className="dropdown-item" onClick={handleLogout}>
              <div className="dropdown-item-icon">
                <i data-feather="log-out" />
              </div>
              Logout
            </button>
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
