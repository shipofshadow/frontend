import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface SidebarCollapseProps {
    id: string;
    title: string;
    icon: string;
    parentId: string;
    links: {
        to: string;
        label: string;
        icon?: string;
    }[];
}

const SidebarCollapse: React.FC<SidebarCollapseProps> = ({ id, title, icon, parentId, links }) => {
    const location = useLocation();
    const isActive = links.some(link => location.pathname.startsWith(link.to));

    return (
        <>
            <a
                className={`nav-link ${isActive ? 'active' : 'collapsed'}`}
                href="#!"
                data-bs-toggle="collapse"
                data-bs-target={`#${id}`}
                aria-expanded={isActive ? 'true' : 'false'}
                aria-controls={id}
            >
                <div className="nav-link-icon">
                    <i className={icon}></i>
                </div>
                {title}
                <div className="sidenav-collapse-arrow">
                    <i className="fas fa-angle-down"></i>
                </div>
            </a>

            <div className={`collapse ${isActive ? 'show' : ''}`} id={id} data-bs-parent={`#${parentId}`}>
                <nav className="sidenav-menu-nested nav">
                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            {link.icon && <i className={`${link.icon} me-2`}></i>}
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </>
    );
};

export default SidebarCollapse;
