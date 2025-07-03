import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(Boolean);

    return (
        <nav className="mt-4 rounded" aria-label="breadcrumb">
            <ol className="breadcrumb px-3 py-2 rounded mb-0">
                <li className="breadcrumb-item">
                    <Link to="/admin/dashboard">Dashboard</Link>
                </li>

                {pathnames.map((segment, index) => {
                    const routeTo = '/' + pathnames.slice(0, index + 1).join('/');
                    const isLast = index === pathnames.length - 1;

                    const label = segment
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, char => char.toUpperCase());

                    return isLast ? (
                        <li className="breadcrumb-item active" key={routeTo} aria-current="page">
                            {label}
                        </li>
                    ) : (
                        <li className="breadcrumb-item" key={routeTo}>
                            <Link to={routeTo}>{label}</Link>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
