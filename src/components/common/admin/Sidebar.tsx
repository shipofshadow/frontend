import React, { useEffect } from 'react';
import feather from 'feather-icons';

const Sidebar : React.FC = () => {
  useEffect(() => {
    feather.replace();
  }, []);

  return (
    <div id="layoutSidenav_nav">
      <nav className="sidenav shadow-right sidenav-light">
        <div className="sidenav-menu">
          <div className="nav accordion" id="accordionSidenav">
            <div className="sidenav-menu-heading d-sm-none">Account</div>
            <a className="nav-link d-sm-none" href="#">
              <div className="nav-link-icon">
                <i data-feather="bell"></i>
              </div>
              Alerts
              <span className="badge bg-warning-soft text-warning ms-auto">4 New!</span>
            </a>
            <a className="nav-link d-sm-none" href="#">
              <div className="nav-link-icon">
                <i data-feather="mail"></i>
              </div>
              Messages
              <span className="badge bg-success-soft text-success ms-auto">2 New!</span>
            </a>

            <div className="sidenav-menu-heading">Core</div>
            <a
              className="nav-link collapsed"
              href="#"
              data-bs-toggle="collapse"
              data-bs-target="#collapseDashboards"
              aria-expanded="false"
              aria-controls="collapseDashboards"
            >
              <div className="nav-link-icon">
                <i data-feather="activity"></i>
              </div>
              Dashboards
              <div className="sidenav-collapse-arrow">
                <i className="fas fa-angle-down"></i>
              </div>
            </a>
            <div className="collapse" id="collapseDashboards" data-bs-parent="#accordionSidenav">
              <nav className="sidenav-menu-nested nav accordion">
                <a className="nav-link" href="dashboard-1.html">
                  Default
                  <span className="badge bg-primary-soft text-primary ms-auto">Updated</span>
                </a>
                <a className="nav-link" href="dashboard-2.html">Multipurpose</a>
                <a className="nav-link" href="dashboard-3.html">Affiliate</a>
              </nav>
            </div>

            <div className="sidenav-menu-heading">Custom</div>
            <a
              className="nav-link collapsed"
              href="#"
              data-bs-toggle="collapse"
              data-bs-target="#collapsePages"
              aria-expanded="false"
              aria-controls="collapsePages"
            >
              <div className="nav-link-icon">
                <i data-feather="grid"></i>
              </div>
              Pages
              <div className="sidenav-collapse-arrow">
                <i className="fas fa-angle-down"></i>
              </div>
            </a>

            {/* You can continue this same pattern for nested navs and collapsibles */}
            {/* Consider refactoring the markup into map-based renders for cleaner React code */}

            <a
              className="nav-link collapsed"
              href="#"
              data-bs-toggle="collapse"
              data-bs-target="#collapseFlows"
              aria-expanded="false"
              aria-controls="collapseFlows"
            >
              <div className="nav-link-icon">
                <i data-feather="repeat"></i>
              </div>
              Flows
              <div className="sidenav-collapse-arrow">
                <i className="fas fa-angle-down"></i>
              </div>
            </a>
            <div className="collapse" id="collapseFlows" data-bs-parent="#accordionSidenav">
              <nav className="sidenav-menu-nested nav">
                <a className="nav-link" href="multi-tenant-select.html">Multi-Tenant Registration</a>
                <a className="nav-link" href="wizard.html">Wizard</a>
              </nav>
            </div>
          </div>
        </div>
        <div className="sidenav-footer">
          <div className="sidenav-footer-content">
            <div className="sidenav-footer-subtitle">Logged in as:</div>
            <div className="sidenav-footer-title">Valerie Luna</div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
