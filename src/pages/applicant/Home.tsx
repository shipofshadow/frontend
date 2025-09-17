import { useEffect, useState } from "react";
import {
    Bell,
    Download,
    Eye,
    GraduationCap,
    Plus,
    Upload,
    User,
    MessageCircle,
    FileText,
    Target,
    Calendar,
    TrendingUp,
    CheckCircle,
    Clock,
    XCircle,
    AlertTriangle,
    BookOpen,
    Award,
    DollarSign,
    Star,
    ArrowRight,
    Info,
    ChevronRight,
    Library,
    Send
} from "lucide-react";

import type { ApplicationStatus } from "../../interfaces/application_status.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import { hasApplied } from "../../services/applicationService.tsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchSemester } from "../../store/slices/semesterSlice.ts";
import type { AppDispatch, RootState } from "../../store/slices";
import {Link} from "react-router-dom";

const Home = () => {
    const { user, token } = useAuth();
    const [applicationInfo, setApplicationInfo] = useState<ApplicationStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch<AppDispatch>();
    const { current } = useSelector((state: RootState) => state.semester);

    useEffect(() => {
        setIsLoading(true);
        hasApplied(token)
            .then(setApplicationInfo)
            .catch(() => setApplicationInfo({ has_applied: false }))
            .finally(() => setIsLoading(false));
    }, [token]);

    useEffect(() => {
        dispatch(fetchSemester());
    }, [dispatch]);

    // Mock data - replace with actual data from your API
    const eligibilityScore = 82;
    const totalApplications = applicationInfo?.has_applied ? 1 : 0;
    const recommendedScholarships = 5;
    const documentsUploaded = 4;
    const documentsTotal = 6;

    // Format submitted date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status badge styling
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return { class: 'bg-success', icon: CheckCircle, text: 'Approved' };
            case 'pending':
                return { class: 'bg-warning text-dark', icon: Clock, text: 'Under Review' };
            case 'denied':
                return { class: 'bg-danger', icon: XCircle, text: 'Not Approved' };
            default:
                return { class: 'bg-secondary', icon: Clock, text: 'Unknown' };
        }
    };

    // Not Applied View
    const NotAppliedView = () => (
        <section className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-header bg-gradient border-0 rounded-top-4">
                <div className="d-flex align-items-center">
                    <div className="bg-info bg-opacity-15 rounded-3 p-2 me-3">
                        <Plus className="text-dark" size={20} />
                    </div>
                    <h5 className="mb-0 fw-bold">Start Your Scholarship Application</h5>
                </div>
            </div>
            <div className="card-body text-center py-5">
                <div className="mb-4">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                         style={{width: "80px", height: "80px"}}>
                        <GraduationCap size={40} className="text-primary" />
                    </div>
                    <h4 className="fw-bold mb-3">Ready to Apply for Scholarships?</h4>
                    <p className="text-muted mb-4 mx-auto" style={{maxWidth: "500px"}}>
                        You haven't submitted an application for the current semester yet.
                        Start your scholarship application process now to unlock financial opportunities
                        for your education.
                    </p>
                </div>

                <div className="row g-3 mb-4 justify-content-center">
                    <div className="col-md-4">
                        <div className="bg-light rounded-3 p-3">
                            <FileText className="text-primary mb-2" size={32} />
                            <h6 className="fw-bold">Simple Process</h6>
                            <small className="text-muted">Easy step-by-step application</small>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="bg-light rounded-3 p-3">
                            <TrendingUp className="text-success mb-2" size={32} />
                            <h6 className="fw-bold">AI-Powered Matching</h6>
                            <small className="text-muted">Get personalized recommendations</small>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="bg-light rounded-3 p-3">
                            <Award className="text-warning mb-2" size={32} />
                            <h6 className="fw-bold">Multiple Opportunities</h6>
                            <small className="text-muted">Apply to various scholarships</small>
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-3 justify-content-center flex-wrap">
                    <Link to='/applicant/apply' className="btn btn-primary btn-lg px-4">
                        <Plus size={20} className="me-2" />
                        Start Application
                    </Link>
                    <button className="btn btn-outline-secondary">
                        <Eye size={18} className="me-2" />
                        View Available Scholarships
                    </button>
                </div>

                <div className="mt-4 p-3 bg-info bg-opacity-10 rounded-3">
                    <div className="d-flex align-items-center justify-content-center">
                        <Info className="text-info me-2" size={20} />
                        <span className="fw-semibold">Current Semester: {current}</span>
                    </div>
                    <small className="text-muted d-block mt-1">
                        Make sure to submit your application before the deadline
                    </small>
                </div>
            </div>
        </section>
    );

    // Applied View
    const AppliedView = () => {
        const statusInfo = getStatusBadge(applicationInfo?.status || '');
        const StatusIcon = statusInfo.icon;

        return (
            <section className="card shadow-sm border-0 rounded-4 mb-4">
                <div className="card-header bg-gradient border-0 rounded-top-4">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-15 rounded-3 p-2 me-3">
                                <FileText className="text-white" size={20} />
                            </div>
                            <h5 className="mb-0 fw-bold">Your Scholarship Application</h5>
                        </div>
                        <span className={`badge ${statusInfo.class} px-3 py-2 rounded-pill`}>
                            <StatusIcon size={16} className="me-1" />
                            {statusInfo.text}
                        </span>
                    </div>
                </div>
                <div className="card-body">
                    <div className="row mb-4">
                        <div className="col-md-8">
                            <h6 className="text-muted mb-3">Application Details</h6>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="border rounded-3 p-3 bg-light">
                                        <div className="d-flex align-items-center mb-2">
                                            <Calendar className="text-primary me-2" size={18} />
                                            <span className="fw-medium">Semester</span>
                                        </div>
                                        <span className="fw-bold text-primary">{current}</span>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="border rounded-3 p-3 bg-light">
                                        <div className="d-flex align-items-center mb-2">
                                            <Clock className="text-success me-2" size={18} />
                                            <span className="fw-medium">Submitted</span>
                                        </div>
                                        <span className="fw-bold">
                                            {applicationInfo?.submitted_at ? formatDate(applicationInfo.submitted_at) : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="text-center">
                                <div className={`bg-${applicationInfo?.status === 'approved' ? 'success' :
                                    applicationInfo?.status === 'pending' ? 'warning' : 'danger'} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`}
                                     style={{width: "80px", height: "80px"}}>
                                    <StatusIcon size={40} className={`text-${applicationInfo?.status === 'approved' ? 'success' :
                                        applicationInfo?.status === 'pending' ? 'warning' : 'danger'}`} />
                                </div>
                                <div className="fw-bold mb-1">{statusInfo.text}</div>
                                <small className="text-muted">
                                    {applicationInfo?.status === 'pending' && 'Processing your application'}
                                    {applicationInfo?.status === 'approved' && 'Congratulations!'}
                                    {applicationInfo?.status === 'denied' && 'Please review requirements'}
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* Status-specific content */}
                    {applicationInfo?.status === 'pending' && (
                        <div className="bg-warning bg-opacity-10 rounded-3 p-3 mb-4">
                            <div className="d-flex align-items-start">
                                <Clock className="text-warning me-2 mt-1 flex-shrink-0" size={20} />
                                <div>
                                    <h6 className="fw-bold text-warning mb-2">Application Under Review</h6>
                                    <p className="mb-2 small">
                                        Your scholarship application is currently being reviewed by our evaluation team.
                                        This process typically takes 7-10 business days.
                                    </p>
                                    <small className="text-muted">
                                        You will receive an email notification once the review is complete.
                                    </small>
                                </div>
                            </div>
                        </div>
                    )}

                    {applicationInfo?.status === 'approved' && (
                        <div className="bg-success bg-opacity-10 rounded-3 p-3 mb-4">
                            <div className="d-flex align-items-start">
                                <CheckCircle className="text-success me-2 mt-1 flex-shrink-0" size={20} />
                                <div>
                                    <h6 className="fw-bold text-success mb-2">Application Approved!</h6>
                                    <p className="mb-2 small">
                                        Congratulations! Your scholarship application has been approved.
                                        You will receive further instructions regarding the scholarship award.
                                    </p>
                                    <small className="text-muted">
                                        Check your email and notifications for next steps.
                                    </small>
                                </div>
                            </div>
                        </div>
                    )}

                    {applicationInfo?.status === 'denied' && (
                        <div className="bg-danger bg-opacity-10 rounded-3 p-3 mb-4">
                            <div className="d-flex align-items-start">
                                <XCircle className="text-danger me-2 mt-1 flex-shrink-0" size={20} />
                                <div>
                                    <h6 className="fw-bold text-danger mb-2">Application Not Approved</h6>
                                    <p className="mb-2 small">
                                        Unfortunately, your scholarship application was not approved for this semester.
                                        Please review the requirements and consider reapplying next semester.
                                    </p>
                                    <small className="text-muted">
                                        You can contact the scholarship office for feedback and guidance.
                                    </small>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="d-flex gap-2 flex-wrap">
                        <button className="btn btn-primary">
                            <Eye size={18} className="me-2" />
                            View Full Application
                        </button>
                        <button className="btn btn-outline-secondary">
                            <Download size={18} className="me-2" />
                            Download PDF
                        </button>
                        {applicationInfo?.status === 'pending' && (
                            <button className="btn btn-outline-info">
                                <MessageCircle size={18} className="me-2" />
                                Contact Reviewer
                            </button>
                        )}
                        {applicationInfo?.status === 'denied' && (
                            <button className="btn btn-outline-warning">
                                <Send size={18} className="me-2" />
                                Request Feedback
                            </button>
                        )}
                    </div>
                </div>
            </section>
        );
    };

    if (isLoading) {
        return (
            <main className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Loading your dashboard...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-vh-100 bg-light">
            {/* Enhanced Header with Breadcrumb */}
            <div className="bg-white shadow-sm border-bottom">
                <div className="container py-3">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <Library size={16} className="me-1" />
                                Dashboard
                            </li>
                            <li className="breadcrumb-item active">Home</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="container py-4">
                {/* Enhanced Welcome Banner with Stats */}
                <section className="mb-4">
                    <div
                        className="rounded-4 p-4 shadow-sm position-relative overflow-hidden"
                        style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
                    >
                        {/* Background Pattern */}
                        <div
                            className="position-absolute top-0 end-0 opacity-10"
                            style={{
                                backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
                                width: "100%",
                                height: "100%"
                            }}
                        />

                        <div className="row align-items-center">
                            <div className="col-lg-8">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3">
                                        <GraduationCap size={32} />
                                    </div>
                                    <div>
                                        <h1 className="h2 fw-bold mb-1">
                                            Welcome back, {user?.profile?.first_name}!
                                        </h1>
                                        <p className="mb-0 opacity-90">
                                            <strong>{user?.profile?.student_id}</strong>
                                        </p>
                                    </div>
                                </div>

                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="bg-white bg-opacity-15 rounded-3 p-3">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>
                                                    <div className="h4 fw-bold mb-0">{eligibilityScore}%</div>
                                                    <small className="opacity-90">Eligibility Score</small>
                                                </div>
                                                <TrendingUp size={24} className="opacity-75" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="bg-white bg-opacity-15 rounded-3 p-3">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>
                                                    <div className="h4 fw-bold mb-0">
                                                        {applicationInfo?.has_applied ? 'Applied' : 'Not Applied'}
                                                    </div>
                                                    <small className="opacity-90">Application Status</small>
                                                </div>
                                                <FileText size={24} className="opacity-75" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4 text-center">
                                <div className="bg-white bg-opacity-15 rounded-3 p-4">
                                    <Calendar size={48} className="mb-3 opacity-75" />
                                    <div className="h5 fw-semibold mb-2">Current Semester</div>
                                    <div className="fw-bold">{current}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {applicationInfo?.has_applied && (


                    <section className="mb-4">
                        <div className="row g-3">
                            <div className="col-md-3 col-6">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body text-center">
                                        <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: "48px", height: "48px"}}>
                                            <FileText className="text-primary" size={24} />
                                        </div>
                                        <div className="h4 fw-bold text-primary mb-1">{totalApplications}</div>
                                        <div className="small text-muted">Applications</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 col-6">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body text-center">
                                        <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: "48px", height: "48px"}}>
                                            <Upload className="text-success" size={24} />
                                        </div>
                                        <div className="h4 fw-bold text-success mb-1">{documentsUploaded}/{documentsTotal}</div>
                                        <div className="small text-muted">Documents</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 col-6">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body text-center">
                                        <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: "48px", height: "48px"}}>
                                            <Award className="text-warning" size={24} />
                                        </div>
                                        <div className="h4 fw-bold text-warning mb-1">{recommendedScholarships}</div>
                                        <div className="small text-muted">Recommendations</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 col-6">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body text-center">
                                        <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: "48px", height: "48px"}}>
                                            <TrendingUp className="text-info" size={24} />
                                        </div>
                                        <div className="h4 fw-bold text-info mb-1">{eligibilityScore}%</div>
                                        <div className="small text-muted">Eligibility</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                )}

                {/* Main Content Grid */}
                <div className="row g-4">
                    {/* Left Column - Primary Content */}
                    <div className="col-lg-8">
                        {/* Conditional Application Status */}
                        {applicationInfo?.has_applied ? <AppliedView /> : <NotAppliedView />}

                        {/* Show additional sections only if applied and approved/pending */}
                        {applicationInfo?.has_applied && applicationInfo.status !== 'denied' && (
                            <>
                                {/* Enhanced Eligibility Assessment */}
                                <section className="card shadow-sm border-0 rounded-4 mb-4">
                                    <div className="card-header bg-gradient border-0 rounded-top-4">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-success bg-opacity-15 rounded-3 p-2 me-3">
                                                <TrendingUp className="text-white" size={20} />
                                            </div>
                                            <h5 className="mb-0 fw-bold">Eligibility Assessment</h5>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="row mb-4">
                                            <div className="col-md-4 text-center mb-3">
                                                <div className="position-relative d-inline-block">
                                                    <svg width="120" height="120" viewBox="0 0 120 120">
                                                        <circle cx="60" cy="60" r="50" fill="none" stroke="#e9ecef" strokeWidth="8"/>
                                                        <circle cx="60" cy="60" r="50" fill="none" stroke="#198754" strokeWidth="8"
                                                                strokeDasharray="314" strokeDashoffset="56" strokeLinecap="round"
                                                                transform="rotate(-90 60 60)"/>
                                                    </svg>
                                                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                                                        <div className="display-6 fw-bold text-success">{eligibilityScore}</div>
                                                        <small className="text-muted">Score</small>
                                                    </div>
                                                </div>
                                                <div className="mt-3">
                                                    <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fs-6">
                                                        <Star size={16} className="me-1" />
                                                        Highly Qualified
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="col-md-8">
                                                <h6 className="text-muted mb-3">Assessment Breakdown</h6>
                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <div className="d-flex align-items-center">
                                                            <CheckCircle className="text-success me-2" size={18} />
                                                            <span className="fw-medium">Academic Performance (GWA: 1.75)</span>
                                                        </div>
                                                        <span className="fw-bold text-success">95%</span>
                                                    </div>
                                                    <div className="progress mb-3" style={{height: "6px"}}>
                                                        <div className="progress-bar bg-success" style={{width: "95%"}}></div>
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <div className="d-flex align-items-center">
                                                            <CheckCircle className="text-success me-2" size={18} />
                                                            <span className="fw-medium">Financial Need Assessment</span>
                                                        </div>
                                                        <span className="fw-bold text-success">85%</span>
                                                    </div>
                                                    <div className="progress mb-3" style={{height: "6px"}}>
                                                        <div className="progress-bar bg-success" style={{width: "85%"}}></div>
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <div className="d-flex align-items-center">
                                                            <AlertTriangle className="text-warning me-2" size={18} />
                                                            <span className="fw-medium">Documentation Completeness</span>
                                                        </div>
                                                        <span className="fw-bold text-warning">67%</span>
                                                    </div>
                                                    <div className="progress mb-3" style={{height: "6px"}}>
                                                        <div className="progress-bar bg-warning" style={{width: "67%"}}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-light rounded-3 p-3">
                                            <div className="d-flex align-items-start">
                                                <Info className="text-primary me-2 mt-1 flex-shrink-0" size={20} />
                                                <div>
                                                    <h6 className="mb-2">Recommendation to Improve Score:</h6>
                                                    <ul className="mb-0 small">
                                                        <li>Upload missing Income Tax Return document (+15 points)</li>
                                                        <li>Submit updated Certificate of Enrollment (+8 points)</li>
                                                        <li>Complete family background information (+5 points)</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Scholarship Recommendations - Enhanced */}
                                <section className="card shadow-sm border-0 rounded-4">
                                    <div className="card-header bg-gradient border-0 rounded-top-4">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-warning bg-opacity-15 rounded-3 p-2 me-3">
                                                    <Target className="text-white" size={20} />
                                                </div>
                                                <h5 className="mb-0 fw-bold">Scholarship Recommendations</h5>
                                            </div>
                                            <span className="badge bg-primary px-3 py-2 rounded-pill">{recommendedScholarships} Available</span>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        {/* High Match Scholarships */}
                                        <div className="mb-4">
                                            <h6 className="text-success fw-bold mb-3">
                                                <Star size={18} className="me-1" />
                                                High Match (90%+)
                                            </h6>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <div className="border rounded-3 p-3 h-100 bg-success bg-opacity-5 border-success border-opacity-25">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <h6 className="fw-bold mb-1">Merit-Based Grant</h6>
                                                            <span className="badge bg-success rounded-pill">92% Match</span>
                                                        </div>
                                                        <p className="text-muted small mb-2">₱20,000 per semester</p>
                                                        <p className="small mb-3">Recognition for outstanding academic achievement across all programs.</p>
                                                        <button className="btn btn-success btn-sm">
                                                            Apply Now <ArrowRight size={14} className="ms-1" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Medium Match Scholarships */}
                                        <div className="mb-4">
                                            <h6 className="text-warning fw-bold mb-3">
                                                <Target size={18} className="me-1" />
                                                Good Match (70-89%)
                                            </h6>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <div className="border rounded-3 p-3 bg-warning bg-opacity-5 border-warning border-opacity-25">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <h6 className="fw-bold mb-1">Financial Assistance Program</h6>
                                                            <span className="badge bg-warning text-dark rounded-pill">78% Match</span>
                                                        </div>
                                                        <p className="text-muted small mb-2">₱15,000 per semester</p>
                                                        <p className="small mb-3">Need-based scholarship for students from low-income families.</p>
                                                        <button className="btn btn-outline-warning btn-sm">
                                                            View Details <ChevronRight size={14} className="ms-1" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="border rounded-3 p-3 bg-warning bg-opacity-5 border-warning border-opacity-25">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <h6 className="fw-bold mb-1">STEM Innovation Grant</h6>
                                                            <span className="badge bg-warning text-dark rounded-pill">75% Match</span>
                                                        </div>
                                                        <p className="text-muted small mb-2">₱18,000 per semester</p>
                                                        <p className="small mb-3">Supporting future innovators in Science and Technology fields.</p>
                                                        <button className="btn btn-outline-warning btn-sm">
                                                            View Details <ChevronRight size={14} className="ms-1" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <button className="btn btn-primary">
                                                <Eye size={18} className="me-2" />
                                                View All {recommendedScholarships} Scholarships
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </>
                        )}
                    </div>

                    {/* Right Column - Secondary Content */}
                    <div className="col-lg-4">
                        {/* Enhanced Quick Actions */}
                        <section className="card shadow-sm border-0 rounded-4 mb-4">
                            <div className="card-header bg-gradient border-0 rounded-top-4">
                                <h5 className="fw-bold mb-0">Quick Actions</h5>
                            </div>
                            <div className="card-body d-grid gap-3">
                                {!applicationInfo?.has_applied ? (
                                    <button className="btn btn-primary d-flex align-items-center justify-content-between rounded-3 py-3">
                                        <div className="d-flex align-items-center">
                                            <Plus size={20} className="me-3" />
                                            <span className="fw-semibold">New Application</span>
                                        </div>
                                        <ArrowRight size={18} />
                                    </button>
                                ) : (
                                    <button className="btn btn-outline-primary d-flex align-items-center justify-content-between rounded-3 py-3">
                                        <div className="d-flex align-items-center">
                                            <Eye size={20} className="me-3" />
                                            <span className="fw-semibold">View Application</span>
                                        </div>
                                        <ArrowRight size={18} />
                                    </button>
                                )}
                                <button className="btn btn-outline-secondary d-flex align-items-center justify-content-between rounded-3 py-3">
                                    <div className="d-flex align-items-center">
                                        <User size={20} className="me-3" />
                                        <span className="fw-semibold">Update Profile</span>
                                    </div>
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </section>


                        {/* Recent Announcements - Enhanced */}
                        <section className="card shadow-sm border-0 rounded-4 mb-4">
                            <div className="card-header bg-gradient border-0 rounded-top-4">
                                <div className="d-flex align-items-center">
                                    <Bell className="text-info me-2" size={20} />
                                    <h5 className="fw-bold mb-0">Recent Announcements</h5>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="list-group list-group-flush">
                                    <div className="list-group-item px-0 py-3 border-0">
                                        <div className="d-flex align-items-start">
                                            <div className="bg-danger bg-opacity-10 rounded-2 p-2 me-3 flex-shrink-0">
                                                <Calendar className="text-danger" size={18} />
                                            </div>
                                            <div className="flex-grow-1">
                                                <h6 className="fw-bold mb-1">Application Deadline Extended</h6>
                                                <p className="mb-2 small text-muted">
                                                    AY 2024-2025 scholarship applications deadline extended to October 15, 2024.
                                                </p>
                                                <small className="text-muted">2 days ago</small>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="list-group-item px-0 py-3 border-0">
                                        <div className="d-flex align-items-start">
                                            <div className="bg-success bg-opacity-10 rounded-2 p-2 me-3 flex-shrink-0">
                                                <Award className="text-success" size={18} />
                                            </div>
                                            <div className="flex-grow-1">
                                                <h6 className="fw-bold mb-1">New STEM Scholarship Available</h6>
                                                <p className="mb-2 small text-muted">
                                                    ₱30,000 scholarship for Computer Science and Engineering students.
                                                </p>
                                                <small className="text-muted">5 days ago</small>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="list-group-item px-0 py-3 border-0">
                                        <div className="d-flex align-items-start">
                                            <div className="bg-info bg-opacity-10 rounded-2 p-2 me-3 flex-shrink-0">
                                                <Info className="text-info" size={18} />
                                            </div>
                                            <div className="flex-grow-1">
                                                <h6 className="fw-bold mb-1">System Maintenance Notice</h6>
                                                <p className="mb-2 small text-muted">
                                                    Scheduled maintenance on October 20, 2024 from 2:00 AM - 4:00 AM.
                                                </p>
                                                <small className="text-muted">1 week ago</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button className="btn btn-outline-info w-100 mt-3">
                                    <Bell size={18} className="me-2" />
                                    View All Announcements
                                </button>
                            </div>
                        </section>

                        {/* Support & Help */}
                        <section className="card shadow-sm border-0 rounded-4">
                            <div className="card-header bg-gradient border-0 rounded-top-4">
                                <div className="d-flex align-items-center">
                                    <MessageCircle className="text-success me-2" size={20} />
                                    <h5 className="fw-bold mb-0">Need Help?</h5>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="text-center mb-3">
                                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: "64px", height: "64px"}}>
                                        <MessageCircle className="text-success" size={32} />
                                    </div>
                                    <h6 className="fw-bold mb-2">Get Support</h6>
                                    <p className="small text-muted mb-3">
                                        Our support team is here to help with your scholarship application process.
                                    </p>
                                </div>

                                <div className="d-grid gap-2">
                                    <button className="btn btn-success">
                                        <MessageCircle size={18} className="me-2" />
                                        Live Chat Support
                                    </button>
                                    <button className="btn btn-outline-secondary">
                                        <BookOpen size={18} className="me-2" />
                                        View FAQ
                                    </button>
                                    <button className="btn btn-outline-info">
                                        <FileText size={18} className="me-2" />
                                        User Guide
                                    </button>
                                </div>

                                <hr className="my-3" />

                                <div className="text-center">
                                    <small className="text-muted">
                                        <strong>Office Hours:</strong><br />
                                        Monday - Friday: 8:00 AM - 5:00 PM<br />
                                        <strong>Email:</strong> scholarships@university.edu.ph
                                    </small>
                                </div>
                            </div>
                        </section>
                    </div>
                    {/* Additional Information Section - Only show if applied and not denied */}
                    {applicationInfo?.has_applied && applicationInfo.status !== 'denied' && (
                        <section className="mt-5">
                            <div className="row g-4">
                                {/* Academic Performance Chart */}
                                <div className="col-lg-6">
                                    <div className="card shadow-sm border-0 rounded-4">
                                        <div className="card-header bg-gradient border-0 rounded-top-4">
                                            <div className="d-flex align-items-center">
                                                <BookOpen className="text-primary me-2" size={20} />
                                                <h5 className="fw-bold mb-0">Academic Performance Trend</h5>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="fw-medium">Current GWA</span>
                                                    <span className="badge bg-success px-3 py-2 rounded-pill">1.75</span>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="fw-medium">Previous Semester</span>
                                                    <span className="badge bg-info px-3 py-2 rounded-pill">1.85</span>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="fw-medium">Improvement</span>
                                                    <span className="badge bg-success px-3 py-2 rounded-pill">+0.10</span>
                                                </div>
                                            </div>

                                            <div className="bg-light rounded-3 p-3">
                                                <div className="d-flex align-items-center mb-2">
                                                    <TrendingUp className="text-success me-2" size={18} />
                                                    <span className="fw-semibold text-success">Excellent Progress!</span>
                                                </div>
                                                <small className="text-muted">
                                                    Your GWA improvement qualifies you for academic excellence scholarships.
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Information */}
                                <div className="col-lg-6">
                                    <div className="card shadow-sm border-0 rounded-4">
                                        <div className="card-header bg-gradient border-0 rounded-top-4">
                                            <div className="d-flex align-items-center">
                                                <DollarSign className="text-success me-2" size={20} />
                                                <h5 className="fw-bold mb-0">Financial Assessment</h5>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="fw-medium">Family Income Bracket</span>
                                                    <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">Low Income</span>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="fw-medium">Number of Siblings in School</span>
                                                    <span className="badge bg-info px-3 py-2 rounded-pill">2</span>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="fw-medium">4Ps Beneficiary</span>
                                                    <span className="badge bg-success px-3 py-2 rounded-pill">Yes</span>
                                                </div>
                                            </div>

                                            <div className="bg-light rounded-3 p-3">
                                                <div className="d-flex align-items-center mb-2">
                                                    <CheckCircle className="text-success me-2" size={18} />
                                                    <span className="fw-semibold text-success">High Financial Need</span>
                                                </div>
                                                <small className="text-muted">
                                                    Your financial status qualifies you for need-based scholarship programs.
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </div>


            </div>

            {/* Enhanced Custom Styles */}
            <style>{`
                .bg-gradient {
                  background: linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%);
                }
                
                .card {
                  border-radius: 1rem !important;
                  transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                
                .card:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
                }
                
                .card-header {
                  background: transparent;
                  border-bottom: 1px solid rgba(0,0,0,0.05);
                }
                
                .btn {
                  border-radius: 0.6rem !important;
                  font-weight: 600;
                  transition: all 0.2s ease;
                }
                
                .btn:hover {
                  transform: translateY(-1px);
                }
                
                .badge {
                  font-weight: 600;
                  letter-spacing: 0.02em;
                }
                
                .progress {
                  border-radius: 10px;
                  background-color: rgba(0,0,0,0.05);
                }
                
                .progress-bar {
                  border-radius: 10px;
                  transition: width 0.8s ease;
                }
                
                .list-group-item {
                  background: transparent;
                  transition: background-color 0.2s ease;
                }
                
                .list-group-item:hover {
                  background: rgba(0,0,0,0.02) !important;
                }
                
                .breadcrumb {
                  background: transparent;
                }
                
                .breadcrumb-item + .breadcrumb-item::before {
                  content: "›";
                  color: #6c757d;
                }
                
                .text-gradient {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                }
                
                @media (max-width: 768px) {
                  .card-body {
                    padding: 1rem;
                  }
                  
                  .display-6 {
                    font-size: 2rem;
                  }
                }
                
                /* Animation for progress bars */
                @keyframes slideIn {
                  from { width: 0; }
                  to { width: var(--progress-width); }
                }
                
                .progress-bar {
                  animation: slideIn 1s ease-out;
                }
                
                /* Subtle hover effects for interactive elements */
                .card-body .btn:hover {
                  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                
                /* Custom scrollbar for webkit browsers */
                ::-webkit-scrollbar {
                  width: 6px;
                }
                
                ::-webkit-scrollbar-track {
                  background: #f1f1f1;
                  border-radius: 10px;
                }
                
                ::-webkit-scrollbar-thumb {
                  background: #c1c1c1;
                  border-radius: 10px;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                  background: #a8a8a8;
                }
            `}</style>
        </main>
    );
};

export default Home;