import React, { useState, useEffect } from 'react';
import {
    FileText,
    CheckCircle,
    Info,
    Bell,
    User,
    Award,
    Pencil,
    Clock,
    ChevronRight,
    DollarSign,
    GraduationCap,
    Brain,
    Zap,
    Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { hasApplied } from '../../services/applicationService';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    const [hasApplication, setHasApplication] = useState(false);
    const { user, token } = useAuth();

    useEffect(() => {
        hasApplied(token).then(setHasApplication);
    }, [token]);

    const NotAppliedView = () => (
        <div className="bg-light min-vh-100">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow rounded-4">
                            <div className="card-body p-5 text-center">
                                <div className="mb-4">
                                    <div className="bg-primary rounded-circle d-inline-flex justify-content-center align-items-center" style={{ width: 80, height: 80 }}>
                                        <Pencil size={40} className="text-white" />
                                    </div>
                                </div>
                                <h2 className="fw-bold text-primary mb-3">Welcome, {user?.profile?.first_name}!</h2>
                                <p className="text-muted">Get started with your scholarship application process today.</p>
                                <Link to="/applicant/apply" className="btn btn-primary btn-lg mt-4">
                                    <Pencil size={18} className="me-2" /> Start Application <ChevronRight size={18} className="ms-2" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const AppliedView = () => (
        <div className="bg-light min-vh-100">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="card border-0 shadow rounded-4">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-4">
                                    <Clock size={32} className="text-primary me-2" />
                                    <h4 className="mb-0 fw-bold">Application Under Review</h4>
                                </div>
                                <p className="text-muted mb-2">Submitted on: June 10, 2025</p>
                                <p className="text-muted mb-4">Estimated review time: 2-3 weeks</p>

                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="card border-0 shadow-sm rounded-4 h-100">
                                            <div className="card-body">
                                                <div className="d-flex align-items-center mb-3">
                                                    <GraduationCap size={20} className="text-success me-2" />
                                                    <h6 className="mb-0">Academic Evaluation</h6>
                                                </div>
                                                <p className="mb-1">GPA: <strong className="text-success">3.82</strong></p>
                                                <p>Status: <span className="badge bg-success">Qualified</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="card border-0 shadow-sm rounded-4 h-100">
                                            <div className="card-body">
                                                <div className="d-flex align-items-center mb-3">
                                                    <DollarSign size={20} className="text-warning me-2" />
                                                    <h6 className="mb-0">Financial Evaluation</h6>
                                                </div>
                                                <p className="mb-1">Income: <strong className="text-warning">₱285,000/year</strong></p>
                                                <p>Status: <span className="badge bg-warning text-dark">Eligible</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card bg-success text-white mt-4 border-0 shadow rounded-4">
                                    <div className="card-body text-center">
                                        <Award size={24} className="mb-2" />
                                        <h5 className="fw-bold">Preliminary Assessment: Qualified</h5>
                                        <p className="mb-0">Final decision pending committee review</p>
                                    </div>
                                </div>

                                <div className="row g-3 mt-4">
                                    <div className="col-md-4">
                                        <div className="card border-0 shadow-sm rounded-4 h-100">
                                            <div className="card-body text-center">
                                                <CheckCircle size={24} className="text-primary mb-2" />
                                                <h6 className="fw-bold">Application Status</h6>
                                                <button className="btn btn-outline-primary btn-sm mt-2">
                                                    View Timeline <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="card border-0 shadow-sm rounded-4 h-100">
                                            <div className="card-body text-center">
                                                <FileText size={24} className="text-success mb-2" />
                                                <h6 className="fw-bold">Documents</h6>
                                                <button className="btn btn-outline-success btn-sm mt-2">
                                                    View Files <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="card border-0 shadow-sm rounded-4 h-100">
                                            <div className="card-body text-center">
                                                <Info size={24} className="text-info mb-2" />
                                                <h6 className="fw-bold">System Info</h6>
                                                <button className="btn btn-outline-info btn-sm mt-2">
                                                    Learn More <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card border-0 shadow-sm rounded-4 mt-4">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                            <Bell size={20} className="text-danger me-2" />
                                            <h6 className="fw-bold mb-0">System Updates</h6>
                                        </div>
                                        <ul className="list-unstyled text-muted small mb-0">
                                            <li className="mb-2">
                                                <Brain size={14} className="me-1 text-success" /> Fuzzy logic analysis completed - 1 day ago
                                            </li>
                                            <li className="mb-2">
                                                <Zap size={14} className="me-1 text-warning" /> Real-time qualification generated - 2 days ago
                                            </li>
                                            <li>
                                                <Settings size={14} className="me-1 text-primary" /> System tested and optimized - 3 days ago
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return hasApplication ? <AppliedView /> : <NotAppliedView />;
};

export default Home;
