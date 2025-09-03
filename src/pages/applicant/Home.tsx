import React, { useState, useEffect } from 'react';
import {
    FileText,
    CheckCircle,
    Info,
    Pencil,
    Clock,
    ChevronRight,
    Award,
    Calendar,
    Users,
    TrendingUp,
    XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { hasApplied } from '../../services/applicationService';
import { Link } from 'react-router-dom';
import '../../index.css';
import type {ApplicationStatus} from "../../interfaces/application_status.ts";

interface TimelineProps {
    current: string;
}

interface PendingViewProps {
    submitted_at?: string;
}


// Modern CSS styles without animations
const customStyles = `
    .card-modern {
        border: 0;
        border-radius: 16px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        transition: all 0.2s ease;
        overflow: hidden;
    }
    
    .card-modern:hover {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        transform: translateY(-2px);
    }
    
    .bg-gradient-primary {
        background: linear-gradient(135deg, #0d6efd 0%, #6f42c1 100%);
    }
    
    .bg-gradient-success {
        background: linear-gradient(135deg, #198754 0%, #20c997 100%);
    }
    
    .bg-gradient-info {
        background: linear-gradient(135deg, #0dcaf0 0%, #6f42c1 100%);
    }
    
    .bg-gradient-warning {
        background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
    }
    
    .bg-gradient-danger {
        background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
    }
    
    .icon-circle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .icon-circle-lg {
        width: 80px;
        height: 80px;
    }
    
    .icon-circle-xl {
        width: 100px;
        height: 100px;
    }
    
    .timeline-container {
        position: relative;
        padding: 3rem 0;
    }
    
    .timeline-line {
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 4px;
        background-color: #e9ecef;
        transform: translateY(-50%);
        border-radius: 2px;
        z-index: 0;
    }
    
    .timeline-progress {
        position: absolute;
        top: 50%;
        left: 0;
        height: 4px;
        background: linear-gradient(90deg, #198754 0%, #20c997 100%);
        transform: translateY(-50%);
        border-radius: 2px;
        z-index: 1;
        transition: width 0.8s ease-in-out;
    }
    
    .timeline-step {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    .bg-hero {
        background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 50%, #f3e5f5 100%);
    }
    
    .bg-pending {
        background: linear-gradient(135deg, #e3f2fd 0%, #f8f9ff 100%);
    }
    
    .bg-evaluation {
        background: linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%);
    }
    
    .bg-success-page {
        background: linear-gradient(135deg, #e8f5e8 0%, #e0f2f1 100%);
    }
    
    .bg-danger-page {
        background: linear-gradient(135deg, #ffebee 0%, #fff3e0 100%);
    }
    
    .btn-modern {
        border-radius: 12px;
        padding: 12px 24px;
        font-weight: 500;
        border: none;
        transition: all 0.2s ease;
    }
    
    .btn-modern:hover {
        transform: translateY(-1px);
    }
    
    .status-badge {
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: 500;
        font-size: 0.875rem;
    }
    
    .activity-card {
        border-left: 4px solid;
        background-color: #f8f9fa;
        border-radius: 0 12px 12px 0;
        padding: 1rem 1.5rem;
        margin-bottom: 1rem;
        transition: all 0.2s ease;
    }
    
    .activity-card:hover {
        transform: translateX(4px);
    }
    
    .glass-effect {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
`;

// Enhanced Timeline component

const Timeline: React.FC<TimelineProps> = ({ current }) => {
    const steps = [
        {
            key: 'pending',
            label: 'Applied',
            icon: <Pencil size={20} />,
            description: 'Application submitted'
        },
        {
            key: 'approved',
            label: 'Approved',
            icon: <CheckCircle size={20} />,
            description: 'Application accepted'
        },
        {
            key: 'denied',
            label: 'Decision',
            icon: <Award size={20} />,
            description: 'Final result'
        },
    ];

    const getStatus = (step: string) => {
        const order = ['pending', 'under_evaluation', 'approved', 'denied'];
        const currentIndex = order.indexOf(current);
        const stepIndex = order.indexOf(step);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'active';
        return 'upcoming';
    };

    const getProgressWidth = () => {
        const order = ['pending', 'under_evaluation', 'approved', 'denied'];
        const currentIndex = order.indexOf(current);
        return `${(currentIndex / (order.length - 1)) * 100}%`;
    };

    return (
        <div className="timeline-container">
            <div className="position-relative">
                <div className="timeline-line"></div>
                <div className="timeline-progress" style={{ width: getProgressWidth() }}></div>

                <div className="d-flex justify-content-between">
                    {steps.map((step) => {
                        const status = getStatus(step.key);
                        const isDenied = current === 'denied' && step.key === 'denied';

                        let stepClass = 'bg-light text-muted border border-2';
                        let textClass = 'text-muted';

                        if (status === 'completed') {
                            stepClass = 'bg-success text-white shadow';
                            textClass = 'text-success';
                        } else if (status === 'active') {
                            stepClass = 'bg-primary text-white shadow';
                            textClass = 'text-primary';
                        } else if (isDenied) {
                            stepClass = 'bg-danger text-white shadow';
                            textClass = 'text-danger';
                        }

                        return (
                            <div key={step.key} className="timeline-step">
                                <div className={`icon-circle ${stepClass}`}>
                                    {status === 'completed' ? (
                                        <CheckCircle size={24} />
                                    ) : isDenied ? (
                                        <XCircle size={24} />
                                    ) : (
                                        React.cloneElement(step.icon, { size: 24 })
                                    )}
                                </div>
                                <div className="text-center mt-3">
                                    <div className={`fw-semibold ${textClass}`}>
                                        {step.label}
                                    </div>
                                    <div className="text-muted small mt-1">
                                        {step.description}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Enhanced stat cards
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const StatCard = ({ icon, title, value, description, gradientClass = 'bg-gradient-primary' }) => {
    return (
        <div className="card card-modern h-100">
            <div className="card-body p-4">
                <div className={`icon-circle ${gradientClass} mb-3`}>
                    {React.cloneElement(icon, { size: 28, className: 'text-white' })}
                </div>
                <h5 className="fw-semibold text-dark mb-2">{title}</h5>
                <div className="h2 fw-bold text-dark mb-2">{value}</div>
                <p className="text-muted small mb-0">{description}</p>
            </div>
        </div>
    );
};


// Main Component
const Home = () => {
    const [applicationInfo, setApplicationInfo] = useState<ApplicationStatus | null>(null);
    const { user, token } = useAuth();

    useEffect(() => {
        hasApplied(token)
            .then(setApplicationInfo)
            .catch(() => setApplicationInfo({ has_applied: false }));
    }, [token]);

    const NotAppliedView = () => (
        <>
            <style>{customStyles}</style>
            <div className="bg-hero min-vh-100">
                <div className="container py-5">
                    {/* Hero Section */}
                    <div className="text-center py-5">
                        <div className="bg-gradient-primary icon-circle-xl d-inline-flex justify-content-center align-items-center mb-4 shadow">
                            <Award size={50} className="text-white" />
                        </div>
                        <h1 className="display-4 fw-bold text-dark mb-4">
                            Welcome, <span className="text-primary">{user?.profile?.first_name}!</span>
                        </h1>
                        <p className="lead text-muted mb-5 mx-auto" style={{ maxWidth: '600px' }}>
                            Start your scholarship journey and unlock opportunities tailored to your academic excellence
                        </p>
                    </div>

                    {/* Stats Section */}
                    <div className="row g-4 mb-5">
                        <div className="col-md-4">
                            <StatCard
                                icon={<Users />}
                                title="Applications"
                                value="2,847"
                                description="Students applied this year"
                                gradientClass="bg-gradient-primary"
                            />
                        </div>
                        <div className="col-md-4">
                            <StatCard
                                icon={<Award />}
                                title="Success Rate"
                                value="73%"
                                description="Applications approved"
                                gradientClass="bg-gradient-success"
                            />
                        </div>
                        <div className="col-md-4">
                            <StatCard
                                icon={<TrendingUp />}
                                title="Average Award"
                                value="$12,500"
                                description="Per successful application"
                                gradientClass="bg-gradient-info"
                            />
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="card card-modern">
                                <div className="bg-gradient-primary text-white p-5">
                                    <div className="text-center">
                                        <h2 className="fw-bold mb-3">Ready to Begin?</h2>
                                        <p className="mb-0 opacity-75">Your scholarship application takes just 10 minutes to complete</p>
                                    </div>
                                </div>
                                <div className="card-body p-5 text-center">
                                    <Link
                                        to="/applicant/apply"
                                        className="btn bg-gradient-primary btn-modern text-white text-decoration-none d-inline-flex align-items-center px-4 py-3 mb-4"
                                    >
                                        <Pencil size={20} className="me-2" />
                                        Start Application
                                        <ChevronRight size={20} className="ms-2" />
                                    </Link>
                                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                                        <span className="badge bg-light text-dark">No application fee</span>
                                        <span className="badge bg-light text-dark">Secure process</span>
                                        <span className="badge bg-light text-dark">Quick approval</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    const PendingView = ({ submitted_at } : PendingViewProps) => (
        <>
            <style>{customStyles}</style>
            <div className="bg-pending min-vh-100">
                <div className="container py-5">
                    {/* Header */}
                    <div className="text-center mb-5">
                        <div className="bg-gradient-primary icon-circle-lg d-inline-flex justify-content-center align-items-center mb-4 shadow">
                            <Clock size={40} className="text-white" />
                        </div>
                        <h1 className="display-5 fw-bold text-dark mb-3">Application Received</h1>
                        <p className="text-muted lead">
                            Submitted on <span className="fw-semibold text-primary">{submitted_at}</span>
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="row justify-content-center mb-5">
                        <div className="col-12">
                            <div className="card card-modern glass-effect">
                                <div className="card-body p-4">
                                    <Timeline current="pending" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Cards */}
                    <div className="row g-4">
                        <div className="col-lg-4">
                            <div className="card card-modern h-100">
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="bg-gradient-primary icon-circle me-3">
                                            <CheckCircle size={24} className="text-white" />
                                        </div>
                                        <h5 className="fw-semibold text-dark mb-0">Current Status</h5>
                                    </div>
                                    <div className="status-badge bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center">
                                        <Clock size={16} className="me-2" />
                                        <span className="fw-semibold">Application Received</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="card card-modern h-100">
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="bg-gradient-success icon-circle me-3">
                                            <FileText size={24} className="text-white" />
                                        </div>
                                        <h5 className="fw-semibold text-dark mb-0">Documents</h5>
                                    </div>
                                    <p className="text-muted mb-4">All required files submitted successfully</p>
                                    <Link
                                        to="/applicant/documents"
                                        className="btn btn-outline-success btn-modern w-100 d-flex align-items-center justify-content-center text-decoration-none"
                                    >
                                        View Files
                                        <ChevronRight size={16} className="ms-2" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="card card-modern h-100">
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="bg-gradient-info icon-circle me-3">
                                            <Info size={24} className="text-white" />
                                        </div>
                                        <h5 className="fw-semibold text-dark mb-0">Need Help?</h5>
                                    </div>
                                    <p className="text-muted mb-4">Get support from our dedicated team</p>
                                    <Link
                                        to="/support"
                                        className="btn btn-outline-info btn-modern w-100 d-flex align-items-center justify-content-center text-decoration-none"
                                    >
                                        Contact Us
                                        <ChevronRight size={16} className="ms-2" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );


    const ApprovedView = () => (
        <>
            <style>{customStyles}</style>
            <div className="bg-success-page min-vh-100 d-flex align-items-center">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8 text-center">
                            <div className="bg-gradient-success icon-circle-xl d-inline-flex justify-content-center align-items-center mb-5 shadow">
                                <CheckCircle size={60} className="text-white" />
                            </div>
                            <h1 className="display-4 fw-bold text-dark mb-4">
                                🎉 Congratulations!
                            </h1>
                            <p className="lead text-muted mb-5">
                                Your scholarship application has been <span className="fw-bold text-success">approved!</span>
                            </p>

                            <div className="card card-modern glass-effect mb-5">
                                <div className="card-body p-4">
                                    <Timeline current="approved" />
                                </div>
                            </div>

                            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                                <Link
                                    to="/applicant/status"
                                    className="btn bg-gradient-success btn-modern text-white d-flex align-items-center justify-content-center text-decoration-none shadow"
                                    style={{ minWidth: '200px' }}
                                >
                                    <Award size={20} className="me-2" />
                                    View Award Details
                                    <ChevronRight size={20} className="ms-2" />
                                </Link>
                                <Link
                                    to="/applicant/interview"
                                    className="btn btn-outline-success btn-modern d-flex align-items-center justify-content-center text-decoration-none"
                                    style={{ minWidth: '200px' }}
                                >
                                    <Calendar size={20} className="me-2" />
                                    Schedule Interview
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    const DeniedView = () => (
        <>
            <style>{customStyles}</style>
            <div className="bg-danger-page min-vh-100 d-flex align-items-center">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8 text-center">
                            <div className="bg-gradient-danger icon-circle-xl d-inline-flex justify-content-center align-items-center mb-5 shadow">
                                <XCircle size={50} className="text-white" />
                            </div>
                            <h1 className="display-5 fw-bold text-dark mb-4">Application Not Approved</h1>
                            <p className="lead text-muted mb-5">
                                Unfortunately, your application didn't meet the current criteria. Don't give up – try again next cycle!
                            </p>

                            <div className="card card-modern glass-effect mb-5">
                                <div className="card-body p-4">
                                    <Timeline current="denied" />
                                </div>
                            </div>

                            <div className="d-flex justify-content-center">
                                <Link
                                    to="/applicant/apply"
                                    className="btn btn-outline-primary btn-modern d-flex align-items-center text-decoration-none"
                                >
                                    <Pencil size={20} className="me-2" />
                                    Apply for Next Cycle
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    // Loading state
    if (applicationInfo === null) {
        return (
            <>
                <style>{customStyles}</style>
                <div className="bg-hero min-vh-100 d-flex align-items-center justify-content-center">
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-4" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted fw-semibold">Loading your dashboard...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!applicationInfo.has_applied) return <NotAppliedView />;

    switch (applicationInfo.status) {
        case 'pending':
            return <PendingView submitted_at={applicationInfo.submitted_at} />;
        case 'approved':
            return <ApprovedView />;
        case 'denied':
            return <DeniedView />;
        default:
            return <NotAppliedView />;
    }
};

export default Home;