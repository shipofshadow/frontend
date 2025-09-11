import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { hasApplied } from '../../services/applicationService';
import { Link } from 'react-router-dom';
import '../../index.css';
import type { ApplicationStatus } from "../../interfaces/application_status.ts";

interface TimelineProps {
    current: string;
}

interface PendingViewProps {
    submitted_at?: string;
}

// Enhanced modern CSS with improved animations and layouts
const customStyles = `
    .card-modern {
        border: 0;
        border-radius: 20px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        backdrop-filter: blur(10px);
        background: rgba(255, 255, 255, 0.95);
    }
    
    .card-modern:hover {
        box-shadow: 0 20px 64px rgba(0, 0, 0, 0.15);
        transform: translateY(-8px) scale(1.02);
    }
    
    .card-glass {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .bg-gradient-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6B73FF 100%);
    }
    
    .bg-gradient-success {
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }
    
    .bg-gradient-info {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .bg-gradient-warning {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    
    .bg-gradient-danger {
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
    }
    
    .icon-circle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
    }
    
    .icon-circle::before {
        content: '';
        position: absolute;
        inset: -2px;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3), transparent 70%);
        border-radius: 50%;
        z-index: 0;
    }
    
    .icon-circle > * {
        position: relative;
        z-index: 1;
    }
    
    .icon-circle-lg {
        width: 90px;
        height: 90px;
    }
    
    .icon-circle-xl {
        width: 120px;
        height: 120px;
    }
    
    .timeline-container {
        position: relative;
        padding: 4rem 0 2rem;
    }
    
    .timeline-line {
        position: absolute;
        top: 60px;
        left: 10%;
        right: 10%;
        height: 6px;
        background: linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 10px;
        z-index: 0;
    }
    
    .timeline-progress {
        position: absolute;
        top: 60px;
        left: 10%;
        height: 6px;
        background: linear-gradient(90deg, #11998e 0%, #38ef7d 100%);
        border-radius: 10px;
        z-index: 1;
        transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 0 20px rgba(56, 239, 125, 0.4);
    }
    
    .timeline-step {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
    }
    
    .bg-hero {
        background: 
            radial-gradient(circle at 20% 80%, #667eea22 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, #764ba222 0%, transparent 50%),
            linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        min-height: 100vh;
    }
    
    .bg-pending {
        background: 
            radial-gradient(circle at 30% 70%, #e0f2fe22 0%, transparent 50%),
            linear-gradient(135deg, #f1f8ff 0%, #e6f3ff 100%);
    }
    
    .bg-success-page {
        background: 
            radial-gradient(circle at 20% 80%, #dcfce722 0%, transparent 50%),
            linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
    }
    
    .bg-danger-page {
        background: 
            radial-gradient(circle at 20% 80%, #fef2f222 0%, transparent 50%),
            linear-gradient(135deg, #fef7f7 0%, #fefefe 100%);
    }
    
    .btn-modern {
        border-radius: 16px;
        padding: 16px 32px;
        font-weight: 600;
        border: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        text-transform: none;
        letter-spacing: 0.02em;
    }
    
    .btn-modern:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
    
    .btn-modern::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.6s;
    }
    
    .btn-modern:hover::before {
        left: 100%;
    }
    
    .status-badge {
        padding: 12px 24px;
        border-radius: 25px;
        font-weight: 600;
        font-size: 0.9rem;
        backdrop-filter: blur(10px);
    }
    
    .activity-card {
        border-left: 5px solid;
        background: rgba(248, 250, 252, 0.8);
        border-radius: 0 20px 20px 0;
        padding: 1.5rem 2rem;
        margin-bottom: 1.5rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
    }
    
    .activity-card:hover {
        transform: translateX(8px);
        background: rgba(255, 255, 255, 0.95);
    }
    
    .stats-counter {
        font-size: 2.5rem;
        font-weight: 800;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .floating-card {
        animation: floatUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        opacity: 0;
        transform: translateY(30px);
    }
    
    .floating-card:nth-child(1) { animation-delay: 0.1s; }
    .floating-card:nth-child(2) { animation-delay: 0.2s; }
    .floating-card:nth-child(3) { animation-delay: 0.3s; }
    
    @keyframes floatUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #22c55e;
        animation: pulse 2s infinite;
        margin-right: 8px;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.7; }
    }
    
    .feature-badge {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 20px;
        padding: 8px 16px;
        font-size: 0.8rem;
        font-weight: 500;
        backdrop-filter: blur(10px);
    }
    
    @media (max-width: 768px) {
        .timeline-line, .timeline-progress {
            left: 5%;
            right: 5%;
        }
        
        .icon-circle-xl {
            width: 80px;
            height: 80px;
        }
        
        .stats-counter {
            font-size: 2rem;
        }
    }
`;

// Enhanced Timeline component with better progress indication
const Timeline: React.FC<TimelineProps> = ({ current }) => {
    const steps = [
        {
            key: 'pending',
            label: 'Submitted',
            fa: 'fa-paper-plane',
            description: 'Application received'
        },
        {
            key: 'under_evaluation',
            label: 'Review',
            fa: 'fa-search',
            description: 'Under evaluation'
        },
        {
            key: 'approved',
            label: 'Approved',
            fa: 'fa-check-circle',
            description: 'Congratulations!'
        },
    ];

    const getStatus = (step: string) => {
        const order = ['pending', 'under_evaluation', 'approved', 'denied'];
        const currentIndex = order.indexOf(current);
        const stepIndex = order.indexOf(step);

        if (current === 'denied' && step === 'approved') {
            return 'denied';
        }
        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'active';
        return 'upcoming';
    };

    const getProgressWidth = () => {
        const order = ['pending', 'under_evaluation', 'approved', 'denied'];
        const currentIndex = order.indexOf(current);
        if (current === 'denied') return '66%';
        return `${(currentIndex / (order.length - 2)) * 100}%`;
    };

    return (
        <div className="timeline-container">
            <div className="position-relative">
                <div className="timeline-line"></div>
                <div className="timeline-progress" style={{ width: getProgressWidth() }}></div>

                <div className="d-flex justify-content-between">
                    {steps.map((step) => {
                        const status = getStatus(step.key);
                        const isDenied = current === 'denied' && step.key === 'approved';
                        let stepClass = 'bg-light text-muted border border-3';
                        let textClass = 'text-muted';

                        if (status === 'completed') {
                            stepClass = 'bg-gradient-success text-white shadow-lg';
                            textClass = 'text-success fw-bold';
                        } else if (status === 'active') {
                            stepClass = 'bg-gradient-primary text-white shadow-lg';
                            textClass = 'text-primary fw-bold';
                        } else if (isDenied) {
                            stepClass = 'bg-gradient-danger text-white shadow-lg';
                            textClass = 'text-danger fw-bold';
                        }

                        return (
                            <div key={step.key} className="timeline-step">
                                <div className={`icon-circle ${stepClass}`}>
                                    {status === 'completed' ? (
                                        <i className="fa fa-check fa-lg" aria-hidden="true"></i>
                                    ) : isDenied ? (
                                        <i className="fa fa-times fa-lg" aria-hidden="true"></i>
                                    ) : (
                                        <i className={`fa ${step.fa} fa-lg`} aria-hidden="true"></i>
                                    )}
                                </div>
                                <div className="text-center mt-3">
                                    <div className={`fw-bold ${textClass} mb-1`}>
                                        {isDenied ? 'Not Approved' : step.label}
                                    </div>
                                    <div className="text-muted small">
                                        {isDenied ? 'Better luck next time' : step.description}
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

// Enhanced StatCard with better animations
type StatCardProps = {
    iconFa: string;
    title: string;
    value: string;
    description: string;
    gradientClass?: string;
    delay?: number;
};

const StatCard = ({ iconFa, title, value, description, gradientClass = 'bg-gradient-primary', delay = 0 }: StatCardProps) => {
    return (
        <div className={`card card-modern h-100 floating-card`} style={{ animationDelay: `${delay}s` }}>
            <div className="card-body p-4 text-center">
                <div className={`icon-circle ${gradientClass} mb-3 mx-auto`}>
                    <i className={`fa ${iconFa} fa-2x text-white`} aria-hidden="true"></i>
                </div>
                <h5 className="fw-semibold text-dark mb-3">{title}</h5>
                <div className={`stats-counter mb-2`}>{value}</div>
                <p className="text-muted mb-0">{description}</p>
            </div>
        </div>
    );
};

// Enhanced ActionCard component
type ActionCardProps = {
    iconFa: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    gradientClass?: string;
    buttonClass?: string;
};

const ActionCard = ({ iconFa, title, description, buttonText, buttonLink, gradientClass = 'bg-gradient-primary', buttonClass = 'btn-outline-primary' }: ActionCardProps) => {
    return (
        <div className="card card-modern h-100">
            <div className="card-body p-4 d-flex flex-column">
                <div className="d-flex align-items-center mb-4">
                    <div className={`icon-circle ${gradientClass} me-3`}>
                        <i className={`fa ${iconFa} fa-lg text-white`} aria-hidden="true"></i>
                    </div>
                    <h5 className="fw-semibold text-dark mb-0">{title}</h5>
                </div>
                <p className="text-muted mb-4 flex-grow-1">{description}</p>
                <Link
                    to={buttonLink}
                    className={`btn ${buttonClass} btn-modern w-100 d-flex align-items-center justify-content-center text-decoration-none`}
                >
                    {buttonText}
                    <i className="fa fa-arrow-right ms-2" aria-hidden="true"></i>
                </Link>
            </div>
        </div>
    );
};

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
            <div className="bg-hero">
                <div className="container py-5">
                    {/* Hero Section */}
                    <div className="text-center py-5">
                        <div className="bg-gradient-primary icon-circle-xl d-inline-flex justify-content-center align-items-center mb-4 shadow-lg">
                            <i className="fa fa-graduation-cap fa-3x text-white" aria-hidden="true"></i>
                        </div>
                        <h1 className="display-4 fw-bold text-dark mb-4">
                            Welcome back, <span className="text-primary">{user?.profile?.first_name}!</span>
                        </h1>
                        <p className="lead text-muted mb-5 mx-auto" style={{ maxWidth: '700px' }}>
                            Your gateway to academic excellence and financial support. Join thousands of students who have
                            successfully secured their educational funding through our scholarship program.
                        </p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="row g-4 mb-5">
                        <div className="col-md-4">
                            <StatCard
                                iconFa="fa-users"
                                title="Active Applications"
                                value="3,247"
                                description="Students applied this semester"
                                gradientClass="bg-gradient-primary"
                                delay={0.1}
                            />
                        </div>
                        <div className="col-md-4">
                            <StatCard
                                iconFa="fa-trophy"
                                title="Success Rate"
                                value="78%"
                                description="Applications approved this year"
                                gradientClass="bg-gradient-success"
                                delay={0.2}
                            />
                        </div>
                        <div className="col-md-4">
                            <StatCard
                                iconFa="fa-dollar"
                                title="Average Award"
                                value="₱15,750"
                                description="Per successful application"
                                gradientClass="bg-gradient-info"
                                delay={0.3}
                            />
                        </div>
                    </div>

                    {/* Main CTA Section */}
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <div className="card card-modern card-glass">
                                <div className="row g-0">
                                    <div className="col-lg-6">
                                        <div className="bg-gradient-primary text-white p-5 h-100 d-flex flex-column justify-content-center">
                                            <h2 className="fw-bold mb-3">Ready to Start Your Journey?</h2>
                                            <p className="mb-4 opacity-90">
                                                Complete your scholarship application in just a few steps. Our streamlined
                                                process ensures you can focus on what matters most - your education.
                                            </p>
                                            <div className="d-flex gap-2 flex-wrap">
                                                <span className="feature-badge">
                                                    <i className="fa fa-check me-1"></i>10-minute process
                                                </span>
                                                <span className="feature-badge">
                                                    <i className="fa fa-shield me-1"></i>Secure & Private
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="p-5 text-center d-flex flex-column justify-content-center h-100">
                                            <i className="fa fa-rocket fa-3x text-primary mb-4"></i>
                                            <Link
                                                to="/applicant/apply"
                                                className="btn bg-gradient-primary btn-modern text-white text-decoration-none d-inline-flex align-items-center justify-content-center px-5 py-3 mb-4"
                                            >
                                                <i className="fa fa-paper-plane me-2" aria-hidden="true"></i>
                                                Start Application
                                                <i className="fa fa-arrow-right ms-2" aria-hidden="true"></i>
                                            </Link>
                                            <div className="d-flex justify-content-center gap-3 flex-wrap small text-muted">
                                                <span><i className="fa fa-clock-o me-1"></i>Quick Setup</span>
                                                <span><i className="fa fa-money me-1"></i>No Fees</span>
                                                <span><i className="fa fa-bolt me-1"></i>Fast Results</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    const PendingView = ({ submitted_at }: PendingViewProps) => (
        <>
            <style>{customStyles}</style>
            <div className="bg-pending min-vh-100">
                <div className="container py-5">
                    {/* Status Header */}
                    <div className="text-center mb-5">
                        <div className="bg-gradient-primary icon-circle-lg d-inline-flex justify-content-center align-items-center mb-4 shadow-lg position-relative">
                            <div className="pulse-dot position-absolute" style={{ top: '-5px', right: '-5px' }}></div>
                            <i className="fa fa-clock-o fa-2x text-white" aria-hidden="true"></i>
                        </div>
                        <h1 className="display-5 fw-bold text-dark mb-3">Application Under Review</h1>
                        <p className="text-muted lead">
                            Submitted on <span className="fw-semibold text-primary">{submitted_at}</span>
                        </p>
                        <div className="status-badge bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center mt-3">
                            <div className="pulse-dot me-2"></div>
                            <span className="fw-semibold">Processing</span>
                        </div>
                    </div>

                    {/* Progress Timeline */}
                    <div className="row justify-content-center mb-5">
                        <div className="col-12">
                            <div className="card card-modern card-glass">
                                <div className="card-body p-4">
                                    <Timeline current="pending" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Cards */}
                    <div className="row g-4">
                        <div className="col-lg-4">
                            <ActionCard
                                iconFa="fa-file-text-o"
                                title="Review Documents"
                                description="View and manage all your submitted documents and files"
                                buttonText="View Documents"
                                buttonLink="/applicant/documents"
                                gradientClass="bg-gradient-success"
                                buttonClass="btn-outline-success"
                            />
                        </div>
                        <div className="col-lg-4">
                            <ActionCard
                                iconFa="fa-line-chart"
                                title="Track Progress"
                                description="Monitor your application status and get real-time updates"
                                buttonText="View Status"
                                buttonLink="/applicant/status"
                                gradientClass="bg-gradient-info"
                                buttonClass="btn-outline-info"
                            />
                        </div>
                        <div className="col-lg-4">
                            <ActionCard
                                iconFa="fa-question-circle-o"
                                title="Need Assistance?"
                                description="Get help from our dedicated support team anytime"
                                buttonText="Contact Support"
                                buttonLink="/support"
                                gradientClass="bg-gradient-warning"
                                buttonClass="btn-outline-warning"
                            />
                        </div>
                    </div>

                    {/* Information Panel */}
                    <div className="row justify-content-center mt-5">
                        <div className="col-lg-8">
                            <div className="card card-modern">
                                <div className="card-body p-4">
                                    <div className="row align-items-center">
                                        <div className="col-md-2 text-center">
                                            <i className="fa fa-info-circle fa-2x text-info" aria-hidden="true"></i>
                                        </div>
                                        <div className="col-md-10">
                                            <h5 className="fw-semibold text-dark mb-2">What happens next?</h5>
                                            <p className="text-muted mb-0">
                                                Our evaluation team is currently reviewing your application. You'll receive
                                                an email notification once the review is complete. This process typically
                                                takes 5-7 business days.
                                            </p>
                                        </div>
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
            <div className="bg-success-page min-vh-100 d-flex align-items-center">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-10 text-center">
                            {/* Success Animation */}
                            <div className="mb-5">
                                <div className="bg-gradient-success icon-circle-xl d-inline-flex justify-content-center align-items-center mb-4 shadow-lg">
                                    <i className="fa fa-trophy fa-3x text-white" aria-hidden="true"></i>
                                </div>
                                <h1 className="display-4 fw-bold text-dark mb-4">
                                    🎉 Congratulations!
                                </h1>
                                <p className="lead text-muted mb-5">
                                    Your scholarship application has been <span className="fw-bold text-success">successfully approved!</span><br/>
                                    Welcome to the iScholar community of academic achievers.
                                </p>
                            </div>

                            {/* Timeline */}
                            <div className="card card-modern card-glass mb-5">
                                <div className="card-body p-4">
                                    <Timeline current="approved" />
                                </div>
                            </div>

                            {/* Success Actions */}
                            <div className="row g-4 mb-5">
                                <div className="col-md-6">
                                    <div className="card card-modern h-100">
                                        <div className="card-body p-4 text-center">
                                            <div className="bg-gradient-success icon-circle mb-3 mx-auto">
                                                <i className="fa fa-medal fa-2x text-white" aria-hidden="true"></i>
                                            </div>
                                            <h5 className="fw-semibold mb-3">Award Details</h5>
                                            <p className="text-muted mb-4">View your scholarship amount, terms, and disbursement schedule</p>
                                            <Link
                                                to="/applicant/status"
                                                className="btn bg-gradient-success btn-modern text-white w-100 text-decoration-none"
                                            >
                                                <i className="fa fa-trophy me-2" aria-hidden="true"></i>
                                                View Award
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card card-modern h-100">
                                        <div className="card-body p-4 text-center">
                                            <div className="bg-gradient-primary icon-circle mb-3 mx-auto">
                                                <i className="fa fa-calendar fa-2x text-white" aria-hidden="true"></i>
                                            </div>
                                            <h5 className="fw-semibold mb-3">Next Steps</h5>
                                            <p className="text-muted mb-4">Schedule your interview and complete the final requirements</p>
                                            <Link
                                                to="/applicant/interview"
                                                className="btn btn-outline-primary btn-modern w-100 text-decoration-none"
                                            >
                                                <i className="fa fa-calendar-check-o me-2" aria-hidden="true"></i>
                                                Schedule Interview
                                            </Link>
                                        </div>
                                    </div>
                                </div>
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
                            <div className="bg-gradient-danger icon-circle-xl d-inline-flex justify-content-center align-items-center mb-5 shadow-lg">
                                <i className="fa fa-heart fa-3x text-white" aria-hidden="true"></i>
                            </div>
                            <h1 className="display-5 fw-bold text-dark mb-4">We're Sorry</h1>
                            <p className="lead text-muted mb-5">
                                While your application wasn't approved this time, we encourage you to apply again next semester.
                                Every application strengthens your candidacy for future opportunities.
                            </p>

                            <div className="card card-modern card-glass mb-5">
                                <div className="card-body p-4">
                                    <Timeline current="denied" />
                                </div>
                            </div>

                            <div className="row g-4 mb-5">
                                <div className="col-md-6">
                                    <div className="card card-modern h-100">
                                        <div className="card-body p-4 text-center">
                                            <div className="bg-gradient-info icon-circle mb-3 mx-auto">
                                                <i className="fa fa-lightbulb-o fa-2x text-white" aria-hidden="true"></i>
                                            </div>
                                            <h5 className="fw-semibold mb-3">Improvement Tips</h5>
                                            <p className="text-muted mb-4">Get feedback and tips to strengthen your next application</p>
                                            <Link
                                                to="/applicant/feedback"
                                                className="btn btn-outline-info btn-modern w-100 text-decoration-none"
                                            >
                                                <i className="fa fa-comments-o me-2" aria-hidden="true"></i>
                                                View Feedback
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card card-modern h-100">
                                        <div className="card-body p-4 text-center">
                                            <div className="bg-gradient-primary icon-circle mb-3 mx-auto">
                                                <i className="fa fa-refresh fa-2x text-white" aria-hidden="true"></i>
                                            </div>
                                            <h5 className="fw-semibold mb-3">Try Again</h5>
                                            <p className="text-muted mb-4">Apply for the next scholarship cycle with improved credentials</p>
                                            <Link
                                                to="/applicant/apply"
                                                className="btn btn-outline-primary btn-modern w-100 text-decoration-none"
                                            >
                                                <i className="fa fa-paper-plane me-2" aria-hidden="true"></i>
                                                New Application
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    // Loading State
    if (applicationInfo === null) {
        return (
            <>
                <style>{customStyles}</style>
                <div className="bg-hero min-vh-100 d-flex align-items-center justify-content-center">
                    <div className="text-center">
                        <div className="bg-gradient-primary icon-circle-lg d-inline-flex justify-content-center align-items-center mb-4">
                            <div className="spinner-border text-white" style={{ width: '2rem', height: '2rem' }}>
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        <h4 className="text-dark fw-semibold mb-2">Loading Dashboard</h4>
                        <p className="text-muted">Please wait while we fetch your information...</p>
                    </div>
                </div>
            </>
        );
    }

    // Route to appropriate view
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
