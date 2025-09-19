import { useNavigate } from "react-router-dom";
import { Mail, MapPin, Phone, ExternalLink, Clock, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext.tsx";

const Footer = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin, isStudent } = useAuth();

    const handleNavigation = (path: string) => {
        navigate(path);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getQuickLinks = () => {
        if (isAuthenticated) {
            if (isAdmin) {
                return [
                    { label: 'Admin Dashboard', path: '/admin/dashboard' },
                    { label: 'Manage Applicants', path: '/admin/applicants/manage' },
                    { label: 'Scholarships', path: '/admin/scholarships/manage' },
                    { label: 'Reports', path: '/admin/reports' }
                ];
            } else if (isStudent) {
                return [
                    { label: 'My Dashboard', path: '/applicant/home' },
                    { label: 'Apply Now', path: '/applicant/apply' },
                    { label: 'My Applications', path: '/applicant/status' },
                    { label: 'Profile', path: '/applicant/profile' }
                ];
            }
        }

        // Non-authenticated users
        return [
            { label: 'Student Login', path: '/login' },
            { label: 'Register Account', path: '/register' },
            { label: 'Browse Scholarships', path: '/scholarships' },
            { label: 'Get Support', path: '/support' }
        ];
    };

    const quickLinks = getQuickLinks();

    return (
        <footer className="bg-dark text-white py-5 mt-auto border-top border-secondary">
            <div className="container">
                <div className="row g-4">
                    {/* Brand Section */}
                    <div className="col-lg-4 col-md-6">
                        <div className="d-flex align-items-center mb-4">
                            <img
                                src="https://ispsctagudin.info/home/assets/img/ispsc_logo.png"
                                alt="ISPSC Logo"
                                className="me-3 rounded"
                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            />
                            <div>
                                <h4 className="fw-bold mb-1 text-white">iScholar</h4>
                                <small className="text-primary fw-medium">ISPSC Scholarship System</small>
                            </div>
                        </div>
                        <p className="text-muted mb-4 lh-base">
                            Empowering students through intelligent scholarship matching,
                            transparent application processes, and seamless administrative management.
                        </p>

                    </div>

                    {/* Contact Information */}
                    <div className="col-lg-4 col-md-6">
                        <h5 className="fw-bold mb-4 text-white">
                            <MapPin size={20} className="me-2 text-primary" />
                            Contact Information
                        </h5>

                        <div className="d-flex align-items-start mb-3 hover-effect">
                            <MapPin size={18} className="me-3 mt-1 text-primary flex-shrink-0" />
                            <div>
                                <div className="text-white mb-1">Main Campus</div>
                                <small className="text-muted">
                                    Ilocos Sur Polytechnic State College<br />
                                    Tagudin, Ilocos Sur, Philippines 2714
                                </small>
                            </div>
                        </div>

                        <div className="d-flex align-items-center mb-3 hover-effect">
                            <Phone size={18} className="me-3 text-primary flex-shrink-0" />
                            <div>
                                <div className="text-white mb-1">Phone</div>
                                <small className="text-muted">+63 (077) 742-3081</small>
                            </div>
                        </div>

                        <div className="d-flex align-items-center mb-3 hover-effect">
                            <Mail size={18} className="me-3 text-primary flex-shrink-0" />
                            <div>
                                <div className="text-white mb-1">Email</div>
                                <small className="text-muted">info@ispsctagudin.edu.ph</small>
                            </div>
                        </div>

                        <div className="d-flex align-items-center">
                            <Clock size={18} className="me-3 text-primary flex-shrink-0" />
                            <div>
                                <div className="text-white mb-1">Office Hours</div>
                                <small className="text-muted">Mon - Fri: 8:00 AM - 5:00 PM</small>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="col-lg-4 col-md-12">
                        <h5 className="fw-bold mb-4 text-white">Quick Links</h5>
                        <div className="row g-2">
                            <div className="col-sm-6 col-lg-12">
                                <div className="d-grid gap-2 mb-3">
                                    {quickLinks.slice(0, 2).map((link, index) => (
                                        <button
                                            key={index}
                                            className="btn btn-outline-primary btn-sm text-start d-flex align-items-center justify-content-between hover-lift"
                                            onClick={() => handleNavigation(link.path)}
                                        >
                                            <span>{link.label}</span>
                                            <ExternalLink size={14} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="col-sm-6 col-lg-12">
                                <div className="d-grid gap-2">
                                    {quickLinks.slice(2).map((link, index) => (
                                        <button
                                            key={index}
                                            className="btn btn-outline-light btn-sm text-start d-flex align-items-center justify-content-between hover-lift"
                                            onClick={() => handleNavigation(link.path)}
                                        >
                                            <span>{link.label}</span>
                                            <ExternalLink size={14} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* External Links */}
                        {/*<div className="mt-4 pt-3 border-top border-secondary">*/}
                        {/*    <div className="small text-muted mb-2">External Resources</div>*/}
                        {/*    <div className="d-flex gap-2 flex-wrap">*/}
                        {/*        <button*/}
                        {/*            className="btn btn-sm btn-outline-secondary"*/}
                        {/*            onClick={() => handleExternalLink('https://ispsctagudin.info')}*/}
                        {/*        >*/}
                        {/*            ISPSC Website*/}
                        {/*        </button>*/}
                        {/*        <button*/}
                        {/*            className="btn btn-sm btn-outline-secondary"*/}
                        {/*            onClick={() => handleExternalLink('https://ched.gov.ph')}*/}
                        {/*        >*/}
                        {/*            CHED Portal*/}
                        {/*        </button>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                    </div>
                </div>

                <hr className="my-4 border-secondary opacity-50" />

                {/* Bottom Section */}
                <div className="row align-items-center">
                    <div className="col-lg-6 col-md-7 mb-3 mb-md-0">
                        <div className="d-flex align-items-center">
                            <Shield size={16} className="me-2 text-success" />
                            <small className="text-muted">
                                © {new Date().getFullYear()} iScholar - Ilocos Sur Polytechnic State College. All rights reserved.
                            </small>
                        </div>
                        <div className="mt-1">
                            <small className="text-muted opacity-75">
                                Developed with ❤️ for student success
                            </small>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-5">
                        <div className="d-flex justify-content-md-end gap-3 flex-wrap">
                            <button
                                className="btn btn-link btn-sm text-muted p-0"
                                onClick={() => handleNavigation('/privacy-policy')}
                            >
                                Privacy Policy
                            </button>
                            <button
                                className="btn btn-link btn-sm text-muted p-0"
                                onClick={() => handleNavigation('/terms-of-service')}
                            >
                                Terms of Service
                            </button>
                            <button
                                className="btn btn-link btn-sm text-muted p-0"
                                onClick={() => handleNavigation('/help-center')}
                            >
                                Help Center
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .hover-effect:hover {
                    transform: translateX(5px);
                    transition: transform 0.2s ease;
                }
                
                .hover-lift:hover {
                    transform: translateY(-2px);
                    transition: transform 0.2s ease;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }
                
                .btn-link:hover {
                    text-decoration: underline !important;
                    color: #fff !important;
                }
            `}</style>
        </footer>
    );
};

export default Footer;