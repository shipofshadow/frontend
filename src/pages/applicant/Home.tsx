import React, { useState, useEffect } from 'react';
import {
    FileText,
    CheckCircle,
    Info,
    Bell,
    Pencil,
    Clock,
    ChevronRight,
    Brain,
    Zap,
    Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { hasApplied } from '../../services/applicationService';
import { Link } from 'react-router-dom';
import '../../index.css';

// --- Timeline component ---
const Timeline: React.FC<{ current: 'apply' | 'pending' | 'result' }> = ({ current }) => {
    const steps = [
        { key: 'apply', label: 'Apply', icon: <Pencil size={16} /> },
        { key: 'pending', label: 'Under Review', icon: <Clock size={16} /> },
        { key: 'result', label: 'Result', icon: <CheckCircle size={16} /> },
    ];

    const getStatus = (step: string) => {
        const order = ['apply', 'pending', 'result'];
        const currentIndex = order.indexOf(current);
        const stepIndex = order.indexOf(step);
        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'active';
        return 'upcoming';
    };

    return (
        <div className="timeline-wrapper d-flex justify-content-between align-items-center my-5 position-relative">
            {steps.map((step, index) => {
                const status = getStatus(step.key);

                return (
                    <div key={step.key} className="text-center flex-fill position-relative">
                        <div
                            className={`rounded-circle mx-auto d-flex justify-content-center align-items-center fw-bold step-icon
                                ${status === 'completed' ? 'bg-success text-white' :
                                status === 'active' ? 'bg-primary text-white pulse' :
                                    'bg-light text-muted border'}
                            `}
                            style={{ width: 40, height: 40 }}
                        >
                            {step.icon}
                        </div>
                        <div className={`small mt-2 ${status === 'active' ? 'text-primary fw-semibold' : 'text-muted'}`}>
                            {step.label}
                        </div>
                        {index < steps.length - 1 && (
                            <div className="timeline-line position-absolute top-50 start-100 translate-middle-y" />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// --- Main Component ---
const Home: React.FC = () => {
    const [applicationInfo, setApplicationInfo] = useState<any>(null);
    const { user, token } = useAuth();

    useEffect(() => {
        hasApplied(token)
            .then(setApplicationInfo)
            .catch(() => setApplicationInfo({ has_applied: false }));
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
                                <p className="text-muted">Start your scholarship application to unlock opportunities tailored to your academic journey.</p>
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

    const PendingView = ({ submitted_at }: { submitted_at: string }) => (
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
                                <p className="text-muted mb-2">You submitted your application on <strong>{submitted_at}</strong>.</p>
                                <p className="text-muted mb-4">Our scholarship committee is currently reviewing your submission. Please check back regularly for updates.</p>

                                <Timeline current="pending" />

                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <div className="card border-0 shadow-sm rounded-4 h-100 text-center p-3">
                                            <CheckCircle size={24} className="text-primary mb-2" />
                                            <h6 className="fw-bold">Application Status</h6>
                                            <span className="badge bg-primary">Pending Review</span>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="card border-0 shadow-sm rounded-4 h-100 text-center p-3">
                                            <FileText size={24} className="text-secondary mb-2" />
                                            <h6 className="fw-bold">Submitted Documents</h6>
                                            <Link to="/applicant/documents" className="btn btn-sm btn-outline-secondary mt-2">
                                                View Files <ChevronRight size={16} />
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="card border-0 shadow-sm rounded-4 h-100 text-center p-3">
                                            <Info size={24} className="text-info mb-2" />
                                            <h6 className="fw-bold">Need Help?</h6>
                                            <Link to="/support" className="btn btn-sm btn-outline-info mt-2">
                                                Contact Us <ChevronRight size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <div className="card border-0 shadow-sm rounded-4 mt-4">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                            <Bell size={20} className="text-warning me-2" />
                                            <h6 className="fw-bold mb-0">System Activity</h6>
                                        </div>
                                        <ul className="list-unstyled text-muted small mb-0">
                                            <li className="mb-2">
                                                <Brain size={14} className="me-1 text-success" /> Automated evaluation queued
                                            </li>
                                            <li className="mb-2">
                                                <Zap size={14} className="me-1 text-warning" /> Initial screening completed
                                            </li>
                                            <li>
                                                <Settings size={14} className="me-1 text-primary" /> Status synced with committee system
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

    const ApprovedView = () => (
        <div className="bg-light min-vh-100 d-flex justify-content-center align-items-center">
            <div className="card border-0 shadow rounded-4 text-center p-5">
                <CheckCircle size={48} className="text-success mb-3" />
                <h3 className="fw-bold text-success">You’ve Been Approved!</h3>
                <p className="text-muted">Congratulations! Your scholarship application has been approved.</p>
                <Timeline current="result" />
                <Link to="/applicant/status" className="btn btn-success mt-3">
                    View Status <ChevronRight size={16} />
                </Link>
            </div>
        </div>
    );

    const RejectedView = () => (
        <div className="bg-light min-vh-100 d-flex justify-content-center align-items-center">
            <div className="card border-0 shadow rounded-4 text-center p-5">
                <Info size={48} className="text-danger mb-3" />
                <h3 className="fw-bold text-danger">Application Not Approved</h3>
                <p className="text-muted">Unfortunately, your application didn’t meet the criteria. Try again next cycle.</p>
                <Timeline current="result" />
                <Link to="/applicant/support" className="btn btn-outline-danger mt-3">
                    Need Help? <ChevronRight size={16} />
                </Link>
            </div>
        </div>
    );

    if (applicationInfo === null) {
        return (
            <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!applicationInfo.has_applied) return <NotAppliedView />;

    switch (applicationInfo.status) {
        case 'pending':
            return <PendingView submitted_at={applicationInfo.submitted_at} />;
        case 'approved':
            return <ApprovedView />;
        case 'rejected':
            return <RejectedView />;
        default:
            return <NotAppliedView />;
    }
};

export default Home;
