import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/applicant');
  };

  const notifications = [
    { id: 1, text: 'Application received' },
    { id: 2, text: 'Upload your ITR' },
  ];

  return (
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          {/* Logo */}
          <Link to="/" className="navbar-brand d-flex align-items-center">
            <img
                src="https://ispsctagudin.info/home/assets/img/ispsc_logo.png"
                alt="Logo"
                width="40"
                height="40"
                className="me-2"
            />
            <span className="fw-bold text-primary">iScholar</span>
          </Link>

          {/* Mobile Toggler */}
          <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Nav Links */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-lg-center">
              <li className="nav-item">
                <Link to="/applicant/dashboard" className="nav-link">Home</Link>
              </li>

              {isAuthenticated && (
                  <>
                    <li className="nav-item">
                      <Link to="/applicant/documents" className="nav-link">My Documents</Link>
                    </li>

                    <li className="nav-item">
                      <Link to="/applicant/apply" className="nav-link">Apply</Link>
                    </li>

                    <li className="nav-item">
                      <Link to="/applicant/status" className="nav-link">Application Status</Link>
                    </li>

                    {/* 📱 Mobile: direct notif page */}
                    <li className="nav-item d-lg-none">
                      <Link to="/applicant/notifications" className="nav-link">
                        Notifications
                      </Link>
                    </li>

                    {/* 🖥 Desktop: dropdown notifs */}
                    <li className="nav-item dropdown d-none d-lg-block">
                      <a
                          className="nav-link dropdown-toggle position-relative"
                          href="#"
                          id="notifDropdown"
                          role="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                      >
                        <i className="far fa-bell"></i>
                        {notifications.length > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {notifications.length}
                      </span>
                        )}
                      </a>
                      <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="notifDropdown">
                        {notifications.map((notif) => (
                            <li key={notif.id} className="dropdown-item small text-wrap">
                              {notif.text}
                            </li>
                        ))}
                        {notifications.length === 0 && (
                            <li className="dropdown-item text-muted small">No new notifications</li>
                        )}
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <Link to="/applicant/notifications" className="dropdown-item text-center">
                            View all
                          </Link>
                        </li>
                      </ul>
                    </li>

                    {/* Profile Dropdown */}
                    <li className="nav-item dropdown">
                      <a
                          className="nav-link dropdown-toggle"
                          href="#"
                          id="profileDropdown"
                          role="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                      >
                        <i className="bi bi-person-circle me-1"></i>
                        <span className="d-lg-inline">
                      {user?.name || 'Profile'}
                    </span>
                      </a>
                      <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                        <li><Link to="/applicant/profile" className="dropdown-item">My Profile</Link></li>
                        <li><Link to="/applicant/settings" className="dropdown-item">Settings</Link></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><button onClick={handleLogout} className="dropdown-item">Logout</button></li>
                      </ul>
                    </li>
                  </>
              )}
            </ul>
          </div>
        </div>
      </nav>
  );
};

export default Navbar;