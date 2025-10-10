import { useState } from 'react';
import '../../assets/css/GlassNav.css'
import {Link} from "react-router-dom";
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="navbar-wrapper">
                <div className="container-fluid px-3 px-md-4">
                    <div className="container" style={{ maxWidth: '1200px' }}>
                        <nav className="navbar navbar-expand-md navbar-custom">
                            <Link className="navbar-brand d-flex align-items-center" to="/" style={{ textDecoration: 'none' }}>
                                <span className="navbar-brand-text">iScholar</span>
                            </Link>

                            <button
                                className="navbar-toggler-custom d-md-none"
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                                aria-label="Toggle navigation"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="4" x2="20" y1="12" y2="12"></line>
                                    <line x1="4" x2="20" y1="6" y2="6"></line>
                                    <line x1="4" x2="20" y1="18" y2="18"></line>
                                </svg>
                            </button>

                            <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
                                <ul className="navbar-nav mx-auto d-none d-md-flex gap-2">
                                    <li className="nav-item">
                                        <Link className="nav-link-custom" to="/">Home</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link-custom" to="/about">About</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link-custom" to="/scholarships">Scholarships</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link-custom" to="/prequalify">Prequalify</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link-custom" to="/contact">Contact</Link>
                                    </li>
                                </ul>

                                <div className="d-none d-md-flex gap-2 ms-auto">
                                    <Link to="/login" className="btn-login">Login</Link>
                                    <Link to="/register" className="btn-signup">Apply Now</Link>
                                </div>

                                <div className="mobile-menu d-md-none">
                                    <Link className="nav-link-custom" to="/">Home</Link>
                                    <Link className="nav-link-custom" to="/about">About</Link>
                                    <Link className="nav-link-custom" to="/scholarships">Scholarships</Link>
                                    <Link className="nav-link-custom" to="/prequalify">Prequalify</Link>
                                    <Link className="nav-link-custom" to="/contact">Contact</Link>

                                    <div className="mt-3 d-flex flex-column gap-2">
                                        <Link to="/login" className="btn-login text-center">Login</Link>
                                        <Link to="/register" className="btn-signup text-center">Sign Up</Link>
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>

        </>
    );
};

export default Navbar;