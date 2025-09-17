import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { NotificationBell } from '../../NotificationBell.tsx';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname.startsWith(path);
    const ariaCurrent = (path: string) => (isActive(path) ? 'page' : undefined);

    const studentName =
        user?.profile ? `${user.profile.first_name} ${user.profile.last_name}` : 'Student';

    return (
        <nav
            className="navbar navbar-expand-lg navbar-light bg-white sticky-top border-bottom"
            role="navigation"
            aria-label="Primary"
        >
            <div className="container">
                {/* Brand */}
                <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
                    <img
                        src="https://ispsctagudin.info/home/assets/img/ispsc_logo.png"
                        alt="ISPSC"
                        width="36"
                        height="36"
                        className="rounded-circle shadow-sm"
                    />
                    <div className="d-flex flex-column lh-1">
                        <span className="fw-bold text-primary">iScholar</span>
                    </div>
                </Link>

                {/* Toggler */}
                <button
                    className="navbar-toggler border-0 shadow-none"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Collapsible content */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    {/* Left: main navigation */}
                    <ul className="navbar-nav ms-lg-3">
                        <li className="nav-item">
                            <Link
                                to="/applicant/dashboard"
                                className={`nav-link d-flex align-items-center gap-2 ${isActive('/applicant/dashboard') ? 'active' : ''}`}
                                aria-current={ariaCurrent('/applicant/dashboard')}
                            >
                                <i className="fa-solid fa-gauge-high fa-sm fa-fw text-secondary"></i>
                                <span>Dashboard</span>
                            </Link>
                        </li>

                        {isAuthenticated && (
                            <>
                                <li className="nav-item">
                                    <Link
                                        to="/applicant/prequalify"
                                        className={`nav-link d-flex align-items-center gap-2 ${isActive('/applicant/prequalify') ? 'active' : ''}`}
                                        aria-current={ariaCurrent('/applicant/prequalify')}
                                    >
                                        <i className="fa-solid fa-calculator fa-sm fa-fw text-secondary"></i>
                                        <span>Prequalification</span>
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link
                                        to="/applicant/status"
                                        className={`nav-link d-flex align-items-center gap-2 ${isActive('/applicant/status') ? 'active' : ''}`}
                                        aria-current={ariaCurrent('/applicant/status')}
                                    >
                                        <i className="fa-solid fa-clipboard-check fa-sm fa-fw text-secondary"></i>
                                        <span>Status</span>
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>

                    {/* Right: utilities and profile */}
                    <ul className="navbar-nav ms-auto align-items-lg-center">
                        {isAuthenticated && (
                            <>
                                {/* Mobile: direct notifications link */}
                                <li className="nav-item d-lg-none">
                                    <Link to="/applicant/notifications" className="nav-link d-flex align-items-center gap-2">
                                        <i className="fa-regular fa-bell fa-sm fa-fw"></i>
                                        <span>Notifications</span>
                                    </Link>
                                </li>

                                {/* Desktop: NotificationBell (unchanged functionality) */}
                                <NotificationBell />


                                {/* Profile dropdown */}
                                <li className="nav-item dropdown ms-lg-3">
                                    <a
                                        className="nav-link dropdown-toggle d-flex align-items-center gap-2"
                                        href="#"
                                        id="profileDropdown"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        aria-label="Open profile menu"
                                    >
                                        <img
                                            src="/assets/images/avatars/student-avatar.png"
                                            alt={`${studentName} avatar`}
                                            width="28"
                                            height="28"
                                            className="rounded-circle border"
                                        />
                                        <span className="d-none d-sm-inline">{studentName}</span>
                                    </a>
                                    <ul
                                        className="dropdown-menu dropdown-menu-end shadow-sm"
                                        aria-labelledby="profileDropdown"
                                        style={{ minWidth: 240 }}
                                    >
                                        <li className="dropdown-header text-muted small px-3 py-2">
                                            Account
                                        </li>
                                        <li>
                                            <Link
                                                to="/applicant/profile"
                                                className="dropdown-item d-flex align-items-center gap-2 py-2"
                                            >
                                                <i className="fa-regular fa-user fa-sm fa-fw text-primary"></i>
                                                <span>My Profile</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="/applicant/settings"
                                                className="dropdown-item d-flex align-items-center gap-2 py-2"
                                            >
                                                <i className="fa-solid fa-gear fa-sm fa-fw text-secondary"></i>
                                                <span>Settings</span>
                                            </Link>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <button
                                                onClick={handleLogout}
                                                className="dropdown-item d-flex align-items-center gap-2 text-danger py-2"
                                            >
                                                <i className="fa-solid fa-arrow-right-from-bracket fa-sm fa-fw"></i>
                                                <span>Logout</span>
                                            </button>
                                        </li>
                                    </ul>
                                </li>
                            </>
                        )}

                        {!isAuthenticated && (
                            <>
                                <li className="nav-item">
                                    <Link to="/login" className="btn btn-outline-primary ms-lg-3">
                                        <i className="fa-solid fa-right-to-bracket me-2"></i>
                                        Login
                                    </Link>
                                </li>
                                <li className="nav-item ms-2">
                                    <Link to="/register" className="btn btn-primary">
                                        <i className="fa-solid fa-user-plus me-2"></i>
                                        Register
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>

            {/* Minor style tweaks for production polish */}
            <style>{`
        .navbar .nav-link {
          padding-top: 0.6rem;
          padding-bottom: 0.6rem;
        }
        .navbar .nav-link:hover {
          color: var(--bs-primary);
        }
        .navbar .nav-link.active {
          color: var(--bs-primary);
          font-weight: 600;
        }
        .dropdown-menu .dropdown-item:hover {
          background-color: rgba(13, 110, 253, 0.08);
        }
      `}</style>
        </nav>
    );
};

export default Navbar;
