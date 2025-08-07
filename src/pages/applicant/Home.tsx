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
    Settings,
    Star,
    Award,
    Calendar,
    AlertCircle,
    Users,
    TrendingUp,
    Search,
    XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { hasApplied } from '../../services/applicationService';
import { Link } from 'react-router-dom';
import '../../index.css';

// Custom CSS animations and styles
const customStyles = `
    .pulse-animation {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: .5;
        }
    }
    
    .bounce-animation {
        animation: bounce 1s infinite;
    }
    
    @keyframes bounce {
        0%, 100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8,0,1,1);
        }
        50% {
            transform: none;
            animation-timing-function: cubic-bezier(0,0,0.2,1);
        }
    }
    
    .card-hover {
        transition: all 0.3s ease;
    }
    
    .card-hover:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
    }
    
    .gradient-bg {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .gradient-primary {
        background: linear-gradient(135deg, #007bff 0%, #6f42c1 100%);
    }
    
    .gradient-success {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    }
    
    .gradient-info {
        background: linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%);
    }
    
    .gradient-warning {
        background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
    }
    
    .gradient-danger {
        background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
    }
    
    .timeline-container {
        position: relative;
        padding: 2rem 0;
    }
    
    .timeline-line {
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #e9ecef 0%, #dee2e6 100%);
        transform: translateY(-50%);
        z-index: 0;
        border-radius: 2px;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .timeline-line.progress-line {
        background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
        transition: width 1s ease-in-out;
        box-shadow: 0 0 10px rgba(40, 167, 69, 0.3);
    }
    
    .step-container {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    .step-icon {
        position: relative;
        z-index: 2;
        transition: all 0.3s ease;
    }
    
    .step-icon.completed {
        transform: scale(1.1);
    }
    
    .step-icon.active {
        transform: scale(1.2);
        animation: pulse 2s infinite;
    }
    
    .step-content {
        text-align: center;
        margin-top: 1rem;
        transition: all 0.3s ease;
    }
    
    .glass-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.18);
    }
    
    .hero-bg {
        background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 50%, #f3e5f5 100%);
        min-height: 100vh;
    }
    
    .pending-bg {
        background: linear-gradient(135deg, #e3f2fd 0%, #f8f9ff 50%, #e8eaf6 100%);
        min-height: 100vh;
    }
    
    .evaluation-bg {
        background: linear-gradient(135deg, #fff3e0 0%, #fce4ec 50%, #f3e5f5 100%);
        min-height: 100vh;
    }
    
    .success-bg {
        background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 50%, #e0f2f1 100%);
        min-height: 100vh;
    }
    
    .danger-bg {
        background: linear-gradient(135deg, #ffebee 0%, #fce4ec 50%, #fff3e0 100%);
        min-height: 100vh;
    }
    
    .btn-gradient {
        background: linear-gradient(135deg, #007bff 0%, #6f42c1 100%);
        border: none;
        transition: all 0.3s ease;
    }
    
    .btn-gradient:hover {
        background: linear-gradient(135deg, #0056b3 0%, #5a32a3 100%);
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }
    
    .activity-item {
        transition: all 0.3s ease;
    }
    
    .activity-item:hover {
        transform: translateX(5px);
    }
`;

// Enhanced Timeline component with 4 steps
const Timeline = ({ current }) => {
    const steps = [
        { key: 'pending', label: 'Applied', icon: <Pencil size={16} />, description: 'Application submitted' },
        { key: 'under_evaluation', label: 'Under Review', icon: <Search size={16} />, description: 'Initial screening' },
        { key: 'approved', label: 'Approved', icon: <CheckCircle size={16} />, description: 'Application accepted', successIcon: true },
        { key: 'denied', label: 'Decision', icon: <Award size={16} />, description: 'Final result' },
    ];

    const getStatus = (step) => {
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
            <div className="row">
                <div className="col-12">
                    <div className="position-relative">
                        {/* Background line */}
                        <div className="timeline-line"></div>
                        {/* Progress line */}
                        <div
                            className="timeline-line progress-line position-absolute"
                            style={{ width: getProgressWidth() }}
                        ></div>

                        {/* Steps */}
                        <div className="d-flex justify-content-between">
                            {steps.map((step, index) => {
                                const status = getStatus(step.key);
                                const isLastStep = index === steps.length - 1;
                                const isDenied = current === 'denied' && step.key === 'denied';

                                return (
                                    <div key={step.key} className="step-container">
                                        {/* Step circle */}
                                        <div
                                            className={`rounded-circle d-flex justify-content-center align-items-center step-icon ${status}
                                                ${status === 'completed' || (isDenied && step.key === 'denied')
                                                ? (isDenied ? 'bg-danger text-white shadow-lg' : 'bg-success text-white shadow-lg')
                                                : status === 'active'
                                                    ? 'bg-primary text-white shadow-lg'
                                                    : 'bg-light text-muted border border-2'}
                                            `}
                                            style={{
                                                width: 60,
                                                height: 60,
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            {status === 'completed' ? (
                                                <CheckCircle size={24} />
                                            ) : isDenied && step.key === 'denied' ? (
                                                <XCircle size={24} />
                                            ) : (
                                                React.cloneElement(step.icon, { size: 24 })
                                            )}
                                        </div>

                                        {/* Step content */}
                                        <div className="step-content">
                                            <div className={`fw-bold ${
                                                status === 'active' ? 'text-primary' :
                                                    status === 'completed' ? 'text-success' :
                                                        isDenied && step.key === 'denied' ? 'text-danger' : 'text-muted'
                                            }`}>
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
            </div>
        </div>
    );
};

// Enhanced stat cards
const StatCard = ({ icon, title, value, description, gradientClass = 'gradient-primary' }) => {
    return (
        <div className="card border-0 shadow-lg card-hover h-100">
            <div className="card-body p-4">
                <div className={`rounded-3 d-inline-flex justify-content-center align-items-center mb-3 ${gradientClass}`}
                     style={{ width: 60, height: 60 }}>
                    {React.cloneElement(icon, { size: 28, className: 'text-white' })}
                </div>
                <h5 className="fw-bold text-dark mb-2">{title}</h5>
                <div className="display-6 fw-bold text-dark mb-2">{value}</div>
                <p className="text-muted small mb-0">{description}</p>
            </div>
        </div>
    );
};

// Main Component
const Home = () => {
    const [applicationInfo, setApplicationInfo] = useState(null);
    const { user, token } = useAuth();

    useEffect(() => {
        hasApplied(token)
            .then(setApplicationInfo)
            .catch(() => setApplicationInfo({ has_applied: false }));
    }, [token]);

    const NotAppliedView = () => (
        <>
        <style>{customStyles}</style>
        <div className="hero-bg">
            <div className="container py-5">
                {/* Hero Section */}
                <div className="text-center py-5">
                    <div className="gradient-primary rounded-circle d-inline-flex justify-content-center align-items-center mb-4 shadow-lg"
                         style={{ width: 100, height: 100 }}>
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
                        gradientClass="gradient-primary"
                    />
                </div>
                <div className="col-md-4">
                    <StatCard
                        icon={<Award />}
                        title="Success Rate"
                        value="73%"
                        description="Applications approved"
                        gradientClass="gradient-success"
                    />
                </div>
                <div className="col-md-4">
                    <StatCard
                        icon={<TrendingUp />}
                        title="Average Award"
                        value="$12,500"
                        description="Per successful application"
                        gradientClass="gradient-info"
                    />
                </div>
            </div>

            {/* CTA Section */}
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-lg card-hover">
                        <div className="gradient-bg text-white p-5 text-center">
                            <h2 className="fw-bold mb-3">Ready to Begin?</h2>
                            <p className="mb-0 opacity-75">Your scholarship application takes just 10 minutes to complete</p>
                        </div>
                        <div className="card-body p-5 text-center">
                            <Link
                                to="/applicant/apply"
                                className="btn btn-gradient btn-lg text-white text-decoration-none d-inline-flex align-items-center px-5 py-3"
                            >
                                <Pencil size={20} className="me-2" />
                                Start Application
                                <ChevronRight size={20} className="ms-2" />
                            </Link>
                            <div className="mt-4">
                                <small className="text-muted">
                                    <span className="badge bg-light text-dark me-2">No application fee</span>
                                    <span className="badge bg-light text-dark me-2">Secure process</span>
                                    <span className="badge bg-light text-dark">Quick approval</span>
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
</>
);

const PendingView = ({ submitted_at }) => (
    <>
        <style>{customStyles}</style>
        <div className="pending-bg">
            <div className="container py-5">
                {/* Header */}
                <div className="text-center mb-5">
                    <div className="gradient-primary rounded-circle d-inline-flex justify-content-center align-items-center mb-4 shadow-lg"
                         style={{ width: 80, height: 80 }}>
                        <Clock size={40} className="text-white" />
                    </div>
                    <h1 className="display-5 fw-bold text-dark mb-3">Application Received</h1>
                    <p className="text-muted">
                        Submitted on <span className="fw-bold text-primary">{submitted_at}</span>
                    </p>
                </div>

                {/* Timeline */}
                <div className="row justify-content-center mb-5">
                    <div className="col-lg-12">
                        <div className="card border-0 shadow-lg glass-card">
                            <div className="card-body p-5">
                                <Timeline current="pending" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content cards remain the same */}
                <div className="row g-4 mb-5">
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-lg card-hover h-100">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-4">
                                    <div className="gradient-primary rounded-3 d-flex justify-content-center align-items-center me-3"
                                         style={{ width: 50, height: 50 }}>
                                        <CheckCircle size={24} className="text-white" />
                                    </div>
                                    <h5 className="fw-bold text-dark mb-0">Current Status</h5>
                                </div>
                                <div className="alert alert-primary d-flex align-items-center justify-content-center">
                                    <Clock size={16} className="me-2" />
                                    <strong>Application Received</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-lg card-hover h-100">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-4">
                                    <div className="gradient-success rounded-3 d-flex justify-content-center align-items-center me-3"
                                         style={{ width: 50, height: 50 }}>
                                        <FileText size={24} className="text-white" />
                                    </div>
                                    <h5 className="fw-bold text-dark mb-0">Documents</h5>
                                </div>
                                <p className="text-muted small mb-4">All required files submitted successfully</p>
                                <Link
                                    to="/applicant/documents"
                                    className="btn btn-outline-success w-100 d-flex align-items-center justify-content-center text-decoration-none"
                                >
                                    View Files
                                    <ChevronRight size={16} className="ms-1" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-lg card-hover h-100">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-4">
                                    <div className="gradient-info rounded-3 d-flex justify-content-center align-items-center me-3"
                                         style={{ width: 50, height: 50 }}>
                                        <Info size={24} className="text-white" />
                                    </div>
                                    <h5 className="fw-bold text-dark mb-0">Need Help?</h5>
                                </div>
                                <p className="text-muted small mb-4">Get support from our dedicated team</p>
                                <Link
                                    to="/support"
                                    className="btn btn-outline-info w-100 d-flex align-items-center justify-content-center text-decoration-none"
                                >
                                    Contact Us
                                    <ChevronRight size={16} className="ms-1" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
);

const UnderEvaluationView = ({ submitted_at }) => (
    <>
        <style>{customStyles}</style>
        <div className="evaluation-bg">
            <div className="container py-5">
                <div className="text-center mb-5">
                    <div className="gradient-warning rounded-circle d-inline-flex justify-content-center align-items-center mb-4 shadow-lg"
                         style={{ width: 80, height: 80 }}>
                        <Search size={40} className="text-white" />
                    </div>
                    <h1 className="display-5 fw-bold text-dark mb-3">Under Evaluation</h1>
                    <p className="text-muted">
                        Your application is being carefully reviewed by our committee
                    </p>
                </div>

                <div className="row justify-content-center mb-5">
                    <div className="col-lg-12">
                        <div className="card border-0 shadow-lg glass-card">
                            <div className="card-body p-5">
                                <Timeline current="under_evaluation" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="card border-0 shadow-lg glass-card">
                            <div className="card-body p-5">
                                <div className="d-flex align-items-center mb-4">
                                    <div className="gradient-warning rounded-3 d-flex justify-content-center align-items-center me-3"
                                         style={{ width: 50, height: 50 }}>
                                        <Bell size={24} className="text-white" />
                                    </div>
                                    <h5 className="fw-bold text-dark mb-0">Evaluation Progress</h5>
                                </div>
                                <div className="activity-item alert alert-warning d-flex align-items-center mb-3">
                                    <div className="bg-warning bg-opacity-25 rounded-circle d-flex justify-content-center align-items-center me-3"
                                         style={{ width: 40, height: 40 }}>
                                        <Search size={20} className="text-warning" />
                                    </div>
                                    <div className="flex-fill">
                                        <div className="fw-bold text-warning">Committee evaluation in progress</div>
                                        <small className="text-muted">Your application is being thoroughly reviewed</small>
                                    </div>
                                    <span className="badge bg-warning bg-opacity-25 text-warning">Active</span>
                                </div>
                                <div className="activity-item alert alert-success d-flex align-items-center mb-0">
                                    <div className="bg-success bg-opacity-25 rounded-circle d-flex justify-content-center align-items-center me-3"
                                         style={{ width: 40, height: 40 }}>
                                        <CheckCircle size={20} className="text-success" />
                                    </div>
                                    <div className="flex-fill">
                                        <div className="fw-bold text-success">Initial screening completed</div>
                                        <small className="text-muted">Your application passed the preliminary review</small>
                                    </div>
                                    <span className="badge bg-success bg-opacity-25 text-success">Completed</span>
                                </div>
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
        <div className="success-bg d-flex align-items-center">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-8 text-center">
                        <div className="gradient-success rounded-circle d-inline-flex justify-content-center align-items-center mb-5 shadow-lg bounce-animation"
                             style={{ width: 120, height: 120 }}>
                            <CheckCircle size={60} className="text-white" />
                        </div>
                        <h1 className="display-4 fw-bold text-dark mb-4">
                            🎉 Congratulations!
                        </h1>
                        <p className="lead text-muted mb-5">
                            Your scholarship application has been <span className="fw-bold text-success">approved!</span>
                        </p>

                        <div className="card border-0 shadow-lg glass-card mb-5">
                            <div className="card-body p-5">
                                <Timeline current="approved" />
                            </div>
                        </div>

                        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                            <Link
                                to="/applicant/status"
                                className="btn btn-success btn-lg d-flex align-items-center justify-content-center text-decoration-none shadow"
                                style={{ minWidth: '200px' }}
                            >
                                <Award size={20} className="me-2" />
                                View Award Details
                                <ChevronRight size={20} className="ms-2" />
                            </Link>
                            <Link
                                to="/applicant/interview"
                                className="btn btn-outline-success btn-lg d-flex align-items-center justify-content-center text-decoration-none"
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
        <div className="danger-bg d-flex align-items-center">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-8 text-center">
                        <div className="gradient-danger rounded-circle d-inline-flex justify-content-center align-items-center mb-5 shadow-lg"
                             style={{ width: 100, height: 100 }}>
                            <XCircle size={50} className="text-white" />
                        </div>
                        <h1 className="display-5 fw-bold text-dark mb-4">Application Not Approved</h1>
                        <p className="lead text-muted mb-5">
                            Unfortunately, your application didn't meet the current criteria. Don't give up – try again next cycle!
                        </p>

                        <div className="card border-0 shadow-lg glass-card mb-5">
                            <div className="card-body p-5">
                                <Timeline current="denied" />
                            </div>
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
            <div className="hero-bg d-flex align-items-center justify-content-center">
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
    case 'under_evaluation':
        return <UnderEvaluationView submitted_at={applicationInfo.submitted_at} />;
    case 'approved':
        return <ApprovedView />;
    case 'denied':
        return <DeniedView />;
    default:
        return <NotAppliedView />;
    }
    };

export default Home;