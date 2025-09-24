import { useState, useEffect } from "react";
import {
    Award,
    Calendar,
    DollarSign,
    FileText,
    CheckCircle,
    Clock,
    AlertCircle,
    User,
    School,
    Mail,
    Phone,
    Download,
    Eye,
    ArrowLeft,
    Star,
    TrendingUp,
    Shield,
    BookOpen,
    CreditCard,
} from "lucide-react";
import {API_BASE_URL} from "../../config.ts";
import {useAuth} from "../../context/AuthContext.tsx";
import axios from "axios";
import { useParams, useNavigate} from "react-router-dom";


interface ScholarshipStatusResponse {
    name: string;
    description: string;
    grant_amount: number;
    approved_at: string;
    selection_reason: string;
    denial_reason?: string;
    status: "pending" | "evaluated" | "approved" | "denied";  // overall state
    admin_contact: {
        name: string;
        email: string;
        phone: string;
    }
    common: {
        application: {
            id: number;
            reference_number: string | null;
            status: string;
            student: {
                campus: string;
                course: string;
                email: string;
                name: string;
                phone: string;
                student_id: string;
                year_level: string;
            };
            submitted_at: string; // ISO date
        };
        evaluation: {
            classification: string | null;
            gwa: number | null;
            income: number | null;
            score: number | null;
            total_units: number | null;
        };
        requirements: Array<{
            file_name: string;
            status: "verified" | "pending" | "rejected";
            type: string;
            uploaded_at: string; // ISO date
        }>;
        scholarship_rules: Record<string, any>; // JSON rules
    };
}



const Application = () => {
    const [scholarship, setScholarship] = useState<ScholarshipStatusResponse>();
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {token} = useAuth();
    const { application_id } = useParams<{ application_id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchScholarship = async () => {
            try {
                setLoading(true);
                const res = await axios.get<ScholarshipStatusResponse>(
                    `${API_BASE_URL}/api/profile/scholarship-status/${application_id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // JWT token
                        },
                    }
                );
                setScholarship(res.data);
            } catch {
                setError("Failed to fetch scholarship data");
            } finally {
                setLoading(false);
            }
        };

        if (token && application_id) {
            fetchScholarship();
        }
    }, [application_id, token]); // add deps so it refetches if these change





    const getStatusConfig = (status: string) => {
        switch (status) {
            case "pending":
                return {
                    badge: "bg-warning text-dark",
                    icon: <Clock size={18} />,
                    text: "Under Review",
                    color: "warning",
                    bgClass: "bg-warning-subtle",
                    textClass: "text-warning-emphasis"
                };
            case "evaluated":
                return {
                    badge: "bg-secondary text-white",
                    icon: <Clock size={18} />,
                    text: "Under Evaluation",
                    color: "secondary",
                    bgClass: "bg-secondary-subtle",
                    textClass: "text-secondary-emphasis"
                };
            case "approved":
                return {
                    badge: "bg-success text-white",
                    icon: <CheckCircle size={18} />,
                    text: "Approved",
                    color: "success",
                    bgClass: "bg-success-subtle",
                    textClass: "text-success-emphasis"
                };
            case "denied":
                return {
                    badge: "bg-danger text-white",
                    icon: <AlertCircle size={18} />,
                    text: "Not Approved",
                    color: "danger",
                    bgClass: "bg-danger-subtle",
                    textClass: "text-danger-emphasis"
                };
            default:
                return {
                    badge: "bg-secondary text-white",
                    icon: <Clock size={18} />,
                    text: "Unknown",
                    color: "secondary",
                    bgClass: "bg-secondary-subtle",
                    textClass: "text-secondary-emphasis"
                };
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    };

    const handleBackToApplications = () => {
        navigate("/applicant/home");
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h5 className="text-muted">Loading your application status...</h5>
                    <p className="text-muted">Please wait a moment</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6">
                            <div className="card border-danger shadow-sm">
                                <div className="card-body text-center p-4">
                                    <AlertCircle size={48} className="text-danger mb-3" />
                                    <h4 className="text-danger">Error Loading Application</h4>
                                    <p className="text-muted mb-4">{error}</p>
                                    <button className="btn btn-primary" onClick={() => window.location.reload()}>
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!scholarship) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6">
                            <div className="card shadow-sm">
                                <div className="card-body text-center p-4">
                                    <AlertCircle size={48} className="text-info mb-3" />
                                    <h4>No Application Found</h4>
                                    <p className="text-muted mb-4">No application data available for this request.</p>
                                    <button className="btn btn-primary" onClick={handleBackToApplications}>
                                        <ArrowLeft size={18} className="me-2" />
                                        Back to Applications
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(scholarship.status);

    return (
        <div className="bg-light min-vh-100">

            <div className="container py-4">
                {/* Header Section */}
                <div className="row mb-4">
                    <div className="col">
                        <button
                            className="btn btn-outline-secondary mb-3 d-inline-flex align-items-center"
                            onClick={handleBackToApplications}
                        >
                            <ArrowLeft size={16} className="me-2" />
                            Back to Applications
                        </button>

                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4">
                                <div className="row align-items-center">
                                    <div className="col-lg-8">
                                        <div className="d-flex align-items-start">
                                            <div className={`p-3 ${statusConfig.bgClass} rounded-circle me-3`}>
                                                {statusConfig.icon}
                                            </div>
                                            <div>
                                                <h1 className="h3 mb-2">Scholarship Application Status</h1>
                                                <p className="text-muted mb-2">
                                                    <Calendar size={16} className="me-1" />
                                                    Submitted on {formatDate(scholarship.common.application.submitted_at)}
                                                </p>
                                                <span className={`badge ${statusConfig.badge} fs-6 px-3 py-2`}>
                                                    {statusConfig.icon}
                                                    <span className="ms-2">{statusConfig.text}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                                        <div className="d-flex flex-column align-items-lg-end">
                                            <small className="text-muted mb-1">Application ID</small>
                                            <code className="bg-light px-2 py-1 rounded">#REF-{scholarship.common.application.id.toString().padStart(8, '0')}</code>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {(scholarship.status === "evaluated") && (

                    <div className="row g-4">
                        <div className="col-lg-7">
                            {/* Pending Status Card */}
                            <div className="card border-warning border-2 shadow-sm mb-4">
                                <div className="card-body text-center p-5">
                                    <div className="mb-4">
                                        <div className="position-relative d-inline-block">
                                            <Clock size={64} className="text-warning" />
                                            <div className="position-absolute top-0 start-100 translate-middle">
                                                <div className="spinner-border spinner-border-sm text-warning" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="h4 mb-3 text-warning-emphasis">Application Under Review</h3>
                                    <p className="text-muted mb-4 lead">
                                        Our scholarship committee is currently evaluating your application.
                                        You'll receive an email notification once a decision has been made.
                                    </p>
                                    <div className="alert alert-warning bg-warning-subtle border-warning-subtle">
                                        <h6 className="alert-heading mb-2">What's happening now?</h6>
                                        <ul className="list-unstyled mb-0">
                                            <li className="mb-1"><CheckCircle size={16} className="text-success me-2" />Documents verification in progress</li>
                                            <li className="mb-1"><CheckCircle size={16} className="text-success me-2" />Academic performance evaluation</li>
                                            <li className="mb-1"><Clock size={16} className="text-warning me-2" />Committee review and final decision</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-5">
                            {/* Student Information */}
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-transparent border-0 pb-2">
                                    <h5 className="mb-0 d-flex align-items-center">
                                        <User size={20} className="me-2 text-primary" />
                                        Application Details
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        {[
                                            { label: "Full Name", value: scholarship.common.application.student.name, icon: User },
                                            { label: "Student ID", value: scholarship.common.application.student.student_id, icon: CreditCard },
                                            { label: "Course", value: scholarship.common.application.student.course, icon: BookOpen },
                                            { label: "Year Level", value: scholarship.common.application.student.year_level, icon: School },
                                            { label: "Campus", value: scholarship.common.application.student.campus, icon: School },
                                        ].map(({ label, value, icon: Icon }) => (
                                            <div key={label} className="col-md-6">
                                                <div className="d-flex align-items-center p-3 bg-light rounded">
                                                    <Icon size={18} className="text-muted me-2" />
                                                    <div>
                                                        <small className="text-muted d-block">{label}</small>
                                                        <span className="fw-medium">{value}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row g-4">
                            {/* Student Information */}
                            <div className="col-lg-6">
                                <h5 className="mb-3 d-flex align-items-center">
                                    <User size={20} className="me-2 text-primary" />
                                    Student Information
                                </h5>
                                <div className="bg-light rounded-3 p-3">
                                    {Object.entries({
                                        "Full Name": scholarship.common.application.student.name,
                                        "Student ID": scholarship.common.application.student.student_id,
                                        "Email": scholarship.common.application.student.email,
                                        "Phone": scholarship.common.application.student.phone,
                                        "Course": scholarship.common.application.student.course,
                                        "Year Level": scholarship.common.application.student.year_level,
                                        "Campus": scholarship.common.application.student.campus
                                    }).map(([key, value]) => (
                                        <div key={key} className="d-flex justify-content-between align-items-center py-2 border-bottom border-white">
                                            <span className="text-muted fw-medium">{key}:</span>
                                            <span className="fw-semibold text-end" style={{ maxWidth: '60%' }}>{value || "N/A"}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Academic Performance */}
                            <div className="col-lg-6">
                                <h5 className="mb-3 d-flex align-items-center">
                                    <School size={20} className="me-2 text-success" />
                                    Academic Performance
                                </h5>
                                <div className="bg-light rounded-3 p-3">
                                    <div className="row g-3 text-center mb-3">
                                        <div className="col-4">
                                            <div className="bg-white rounded-3 p-3 h-100">
                                                <Star size={24} className="text-warning mb-2" />
                                                <div className="h4 mb-1 text-warning">{scholarship.common.evaluation.gwa}</div>
                                                <small className="text-muted">GWA</small>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="bg-white rounded-3 p-3 h-100">
                                                <TrendingUp size={24} className="text-primary mb-2" />
                                                <div className="h4 mb-1 text-primary">
                                                    {scholarship?.common?.evaluation?.score != null
                                                        ? `${(scholarship.common.evaluation.score * 100).toFixed(2)}%`
                                                        : "N/A"}
                                                </div>
                                                <small className="text-muted">Score</small>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="bg-white rounded-3 p-3 h-100">
                                                <BookOpen size={24} className="text-info mb-2" />
                                                <div className="h4 mb-1 text-info">{scholarship.common.evaluation.total_units}</div>
                                                <small className="text-muted">Units</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                                    <span className="badge bg-success bg-gradient px-3 py-2">
                                                        {scholarship.common.evaluation.classification}
                                                    </span>
                                    </div>
                                </div>
                            </div>
                        </div>



                    </div>

                )}

                {/* Main Content Based on Status */}
                {(scholarship.status === "pending") && (
                    <div className="row g-4">
                        <div className="col-lg-8">
                            {/* Pending Status Card */}
                            <div className="card border-warning border-2 shadow-sm mb-4">
                                <div className="card-body text-center p-5">
                                    <div className="mb-4">
                                        <div className="position-relative d-inline-block">
                                            <Clock size={64} className="text-warning" />
                                            <div className="position-absolute top-0 start-100 translate-middle">
                                                <div className="spinner-border spinner-border-sm text-warning" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="h4 mb-3 text-warning-emphasis">Application Under Review</h3>
                                    <p className="text-muted mb-4 lead">
                                        Our scholarship committee is currently evaluating your application.
                                        You'll receive an email notification once a decision has been made.
                                    </p>
                                    <div className="alert alert-warning bg-warning-subtle border-warning-subtle">
                                        <h6 className="alert-heading mb-2">What's happening now?</h6>
                                        <ul className="list-unstyled mb-0">
                                            <li className="mb-1"><CheckCircle size={16} className="text-success me-2" />Documents verification in progress</li>
                                            <li className="mb-1"><CheckCircle size={16} className="text-success me-2" />Academic performance evaluation</li>
                                            <li className="mb-1"><Clock size={16} className="text-warning me-2" />Committee review and final decision</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Student Information */}
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-transparent border-0 pb-2">
                                    <h5 className="mb-0 d-flex align-items-center">
                                        <User size={20} className="me-2 text-primary" />
                                        Application Details
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        {[
                                            { label: "Full Name", value: scholarship.common.application.student.name, icon: User },
                                            { label: "Student ID", value: scholarship.common.application.student.student_id, icon: CreditCard },
                                            { label: "Course", value: scholarship.common.application.student.course, icon: BookOpen },
                                            { label: "Year Level", value: scholarship.common.application.student.year_level, icon: School },
                                            { label: "Campus", value: scholarship.common.application.student.campus, icon: School },
                                        ].map(({ label, value, icon: Icon }) => (
                                            <div key={label} className="col-md-6">
                                                <div className="d-flex align-items-center p-3 bg-light rounded">
                                                    <Icon size={18} className="text-muted me-2" />
                                                    <div>
                                                        <small className="text-muted d-block">{label}</small>
                                                        <span className="fw-medium">{value}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            {/* Timeline Card */}
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-body p-4">
                                    <h6 className="mb-3 d-flex align-items-center">
                                        <Clock size={18} className="me-2 text-warning" />
                                        Expected Timeline
                                    </h6>
                                    <div className="text-center">
                                        <div className="display-6 text-warning fw-bold">5-7</div>
                                        <small className="text-muted">business days</small>
                                    </div>
                                </div>
                            </div>

                            {/* Help Card */}
                            <div className="card border-primary border-2">
                                <div className="card-body p-4">
                                    <div className="text-center">
                                        <Mail size={32} className="text-primary mb-3" />
                                        <h6 className="mb-2">Need Help?</h6>
                                        <p className="text-muted small mb-3">
                                            Questions about your application status?
                                        </p>
                                        <button className="btn btn-primary btn-sm w-100">
                                            Contact Support
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {scholarship.status === "approved" && (
                    <div>
                        {/* Success Banner */}
                        <div className="alert alert-success border-0 shadow-sm mb-4">
                            <div className="row align-items-center">
                                <div className="col-auto">
                                    <div className="p-2 bg-success bg-opacity-25 rounded-circle">
                                        <CheckCircle size={32} className="text-success" />
                                    </div>
                                </div>
                                <div className="col">
                                    <h4 className="alert-heading mb-1">Congratulations!</h4>
                                    <p className="mb-0 lead">Your scholarship application has been approved and awarded.</p>
                                </div>
                            </div>
                        </div>

                        {/* Scholarship Award Details */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-4">
                                <div className="row align-items-center">
                                    <div className="col-lg-8">
                                        <div className="d-flex align-items-start">
                                            <div className="p-3 bg-success bg-opacity-10 rounded-3 me-4">
                                                <Award size={32} className="text-success" />
                                            </div>
                                            <div>
                                                <h3 className="h4 mb-2 text-success-emphasis">{scholarship.name}</h3>
                                                <p className="text-muted mb-3">{scholarship.description}</p>
                                                <div className="d-flex align-items-center mb-2">
                                                    <DollarSign size={20} className="text-success me-2" />
                                                    <span className="h4 mb-0 text-success fw-bold">
                                                        {formatCurrency(scholarship.grant_amount)}
                                                    </span>
                                                </div>
                                                <small className="text-muted">
                                                    <Calendar size={14} className="me-1" />
                                                    Approved on {formatDate(scholarship.approved_at)}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 text-lg-center mt-3 mt-lg-0">
                                        <div className="p-4 bg-success-subtle rounded-3">
                                            <Shield size={40} className="text-success mb-2" />
                                            <div className="h5 mb-1 text-success-emphasis">Award Status</div>
                                            <span className="badge bg-success px-3 py-2">Confirmed</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-0">
                                <ul className="nav nav-pills nav-fill p-3">
                                    {[
                                        { id: "overview", name: "Overview", icon: Eye },
                                        { id: "details", name: "Selection Details", icon: FileText },
                                        { id: "requirements", name: "Documents", icon: CheckCircle },
                                        { id: "contact", name: "Contact", icon: Mail },
                                    ].map(({ id, name, icon: Icon }) => (
                                        <li className="nav-item" key={id}>
                                            <button
                                                className={`nav-link d-flex align-items-center justify-content-center py-3 ${
                                                    activeTab === id ? "active" : ""
                                                }`}
                                                onClick={() => setActiveTab(id)}
                                            >
                                                <Icon size={18} className="me-2" />
                                                <span className="d-none d-md-inline">{name}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-4">
                                {activeTab === "overview" && (
                                    <div className="row g-4">
                                        {/* Student Information */}
                                        <div className="col-lg-6">
                                            <h5 className="mb-3 d-flex align-items-center">
                                                <User size={20} className="me-2 text-primary" />
                                                Student Information
                                            </h5>
                                            <div className="bg-light rounded-3 p-3">
                                                {Object.entries({
                                                    "Full Name": scholarship.common.application.student.name,
                                                    "Student ID": scholarship.common.application.student.student_id,
                                                    "Email": scholarship.common.application.student.email,
                                                    "Phone": scholarship.common.application.student.phone,
                                                    "Course": scholarship.common.application.student.course,
                                                    "Year Level": scholarship.common.application.student.year_level,
                                                    "Campus": scholarship.common.application.student.campus
                                                }).map(([key, value]) => (
                                                    <div key={key} className="d-flex justify-content-between align-items-center py-2 border-bottom border-white">
                                                        <span className="text-muted fw-medium">{key}:</span>
                                                        <span className="fw-semibold text-end" style={{ maxWidth: '60%' }}>{value || "N/A"}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Academic Performance */}
                                        <div className="col-lg-6">
                                            <h5 className="mb-3 d-flex align-items-center">
                                                <School size={20} className="me-2 text-success" />
                                                Academic Performance
                                            </h5>
                                            <div className="bg-light rounded-3 p-3">
                                                <div className="row g-3 text-center mb-3">
                                                    <div className="col-4">
                                                        <div className="bg-white rounded-3 p-3 h-100">
                                                            <Star size={24} className="text-warning mb-2" />
                                                            <div className="h4 mb-1 text-warning">{scholarship.common.evaluation.gwa}</div>
                                                            <small className="text-muted">GWA</small>
                                                        </div>
                                                    </div>
                                                    <div className="col-4">
                                                        <div className="bg-white rounded-3 p-3 h-100">
                                                            <TrendingUp size={24} className="text-primary mb-2" />
                                                            <div className="h4 mb-1 text-primary">
                                                                {scholarship?.common?.evaluation?.score != null
                                                                    ? `${(scholarship.common.evaluation.score * 100).toFixed(2)}%`
                                                                    : "N/A"}
                                                            </div>
                                                            <small className="text-muted">Score</small>
                                                        </div>
                                                    </div>
                                                    <div className="col-4">
                                                        <div className="bg-white rounded-3 p-3 h-100">
                                                            <BookOpen size={24} className="text-info mb-2" />
                                                            <div className="h4 mb-1 text-info">{scholarship.common.evaluation.total_units}</div>
                                                            <small className="text-muted">Units</small>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <span className="badge bg-success bg-gradient px-3 py-2">
                                                        {scholarship.common.evaluation.classification}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "details" && (
                                    <div>
                                        <h5 className="mb-3">Selection Reason</h5>
                                        <div className="alert alert-success bg-success-subtle border-success-subtle">
                                            <CheckCircle size={20} className="text-success me-2" />
                                            {scholarship.selection_reason}
                                        </div>

                                        <h5 className="mb-3 mt-4">Next Steps</h5>
                                        <div className="list-group list-group-flush">
                                            <div className="list-group-item d-flex align-items-center px-0">
                                                <div className="p-2 bg-success bg-opacity-10 rounded me-3">
                                                    <CheckCircle size={20} className="text-success" />
                                                </div>
                                                <div>
                                                    <div className="fw-semibold">Application Approved</div>
                                                    <small className="text-muted">Your scholarship has been officially awarded</small>
                                                </div>
                                            </div>
                                            <div className="list-group-item d-flex align-items-center px-0">
                                                <div className="p-2 bg-primary bg-opacity-10 rounded me-3">
                                                    <Mail size={20} className="text-primary" />
                                                </div>
                                                <div>
                                                    <div className="fw-semibold">Check Your Email</div>
                                                    <small className="text-muted">Official award letter and instructions sent to your email</small>
                                                </div>
                                            </div>
                                            <div className="list-group-item d-flex align-items-center px-0">
                                                <div className="p-2 bg-info bg-opacity-10 rounded me-3">
                                                    <Download size={20} className="text-info" />
                                                </div>
                                                <div>
                                                    <div className="fw-semibold">Download Certificate</div>
                                                    <small className="text-muted">Official scholarship certificate available for download</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "requirements" && (
                                    <div>
                                        <h5 className="mb-3">Submitted Documents</h5>
                                        <div className="row g-3">
                                            {scholarship.requirements.map((req, index) => {
                                                const getFileIcon = (type) => {
                                                    switch(type) {
                                                        case 'itr': return <CreditCard size={20} className="text-primary" />;
                                                        case 'grades': return <BookOpen size={20} className="text-success" />;
                                                        case 'cor': return <FileText size={20} className="text-info" />;
                                                        default: return <FileText size={20} className="text-muted" />;
                                                    }
                                                };

                                                const getFileTypeLabel = (type: string) => {
                                                    switch(type) {
                                                        case 'itr': return 'Income Tax Return';
                                                        case 'grades': return 'Academic Records';
                                                        case 'cor': return 'Certificate of Registration';
                                                        default: return 'Document';
                                                    }
                                                };

                                                return (
                                                    <div key={index} className="col-md-6">
                                                        <div className="card h-100 border-0 bg-light">
                                                            <div className="card-body p-3">
                                                                <div className="d-flex align-items-start">
                                                                    <div className="p-2 bg-white rounded me-3">
                                                                        {getFileIcon(req.type)}
                                                                    </div>
                                                                    <div className="flex-grow-1 min-w-0">
                                                                        <h6 className="mb-1 text-truncate" title={req.file_name}>
                                                                            {req.file_name}
                                                                        </h6>
                                                                        <p className="text-muted small mb-2">
                                                                            {getFileTypeLabel(req.type)} • {req.size}
                                                                        </p>
                                                                        <small className="text-muted d-block mb-2">
                                                                            <Calendar size={12} className="me-1" />
                                                                            {formatDate(req.uploaded_at)}
                                                                        </small>
                                                                        <div className="d-flex justify-content-between align-items-center">
                                                                            <span className={`badge ${req.status === 'verified' ? 'bg-success' : 'bg-warning'} text-white`}>
                                                                                {req.status === 'verified' ? (
                                                                                    <>
                                                                                        <CheckCircle size={12} className="me-1" />
                                                                                        Verified
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <Clock size={12} className="me-1" />
                                                                                        Pending
                                                                                    </>
                                                                                )}
                                                                            </span>
                                                                            <div className="btn-group btn-group-sm">
                                                                                <button className="btn btn-outline-primary btn-sm">
                                                                                    <Eye size={14} />
                                                                                </button>
                                                                                <button className="btn btn-outline-secondary btn-sm">
                                                                                    <Download size={14} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {activeTab === "contact" && (
                                    <div className="row g-4">
                                        <div className="col-lg-6">
                                            <h5 className="mb-3">Scholarship Administrator</h5>
                                            <div className="card border-0 bg-light">
                                                <div className="card-body p-4">
                                                    <div className="d-flex align-items-start">
                                                        <div className="p-3 bg-primary bg-opacity-10 rounded-circle me-3">
                                                            <User size={24} className="text-primary" />
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-1">{scholarship.admin_contact.name}</h6>
                                                            <p className="text-muted mb-3">{scholarship.admin_contact.title}</p>
                                                            <div className="mb-2">
                                                                <Mail size={16} className="text-muted me-2" />
                                                                <a href={`mailto:${scholarship.admin_contact.email}`} className="text-decoration-none">
                                                                    {scholarship.admin_contact.email}
                                                                </a>
                                                            </div>
                                                            <div>
                                                                <Phone size={16} className="text-muted me-2" />
                                                                <a href={`tel:${scholarship.admin_contact.phone}`} className="text-decoration-none">
                                                                    {scholarship.admin_contact.phone}
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <h5 className="mb-3">Quick Actions</h5>
                                            <div className="d-grid gap-2">
                                                <button className="btn btn-primary d-flex align-items-center justify-content-center py-3">
                                                    <Mail size={18} className="me-2" />
                                                    Send Message
                                                </button>
                                                <button className="btn btn-outline-primary d-flex align-items-center justify-content-center py-3">
                                                    <Download size={18} className="me-2" />
                                                    Download Award Letter
                                                </button>
                                                <button className="btn btn-outline-secondary d-flex align-items-center justify-content-center py-3">
                                                    <FileText size={18} className="me-2" />
                                                    View Terms & Conditions
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {scholarship.status === "denied" && (
                    <div className="row g-4">
                        <div className="col-lg-8">
                            {/* Denial Notice */}
                            <div className="card border-danger border-2 shadow-sm mb-4">
                                <div className="card-body text-center p-5">
                                    <div className="mb-4">
                                        <AlertCircle size={64} className="text-danger" />
                                    </div>
                                    <h3 className="h4 mb-3 text-danger-emphasis">Application Not Approved</h3>
                                    <p className="text-muted mb-4 lead">
                                        We regret to inform you that your scholarship application has not been approved at this time.
                                    </p>
                                    <div className="alert alert-danger bg-danger-subtle border-danger-subtle text-start">
                                        <h6 className="alert-heading mb-2">
                                            <AlertCircle size={18} className="me-2" />
                                            Reason for Decision
                                        </h6>
                                        <p className="mb-0">{scholarship.denial_reason}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Scholarship Requirements */}
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-transparent border-0 pb-2">
                                    <h5 className="mb-0 d-flex align-items-center">
                                        <FileText size={20} className="me-2 text-info" />
                                        Scholarship Requirements
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <div className="text-center p-3 bg-light rounded">
                                                <Star size={24} className="text-warning mb-2" />
                                                <div className="h5 mb-1">Maximum GWA</div>
                                                <div className="display-6 fw-bold text-warning">{scholarship.scholarship_requirements.min_gwa}</div>
                                                <small className="text-muted">Required</small>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="text-center p-3 bg-light rounded">
                                                <BookOpen size={24} className="text-info mb-2" />
                                                <div className="h5 mb-1">Minimum Units</div>
                                                <div className="display-6 fw-bold text-info">{scholarship.scholarship_requirements.min_units}</div>
                                                <small className="text-muted">Required</small>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="text-center p-3 bg-light rounded">
                                                <DollarSign size={24} className="text-success mb-2" />
                                                <div className="h5 mb-1">Max Income</div>
                                                <div className="h6 fw-bold text-success">{formatCurrency(scholarship.scholarship_requirements.max_income)}</div>
                                                <small className="text-muted">Annual</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Your Application */}
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-transparent border-0 pb-2">
                                    <h5 className="mb-0 d-flex align-items-center">
                                        <User size={20} className="me-2 text-primary" />
                                        Your Application Summary
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <div className="text-center p-3 bg-danger-subtle rounded">
                                                <Star size={24} className="text-danger mb-2" />
                                                <div className="h5 mb-1">Your GWA</div>
                                                <div className="display-6 fw-bold text-danger">{scholarship.common.evaluation.gwa}</div>
                                                <small className="text-danger">Above limit</small>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="text-center p-3 bg-danger-subtle rounded">
                                                <BookOpen size={24} className="text-danger mb-2" />
                                                <div className="h5 mb-1">Your Units</div>
                                                <div className="display-6 fw-bold text-danger">{scholarship.common.evaluation.total_units}</div>
                                                <small className="text-danger">Below minimum</small>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="text-center p-3 bg-success-subtle rounded">
                                                <DollarSign size={24} className="text-success mb-2" />
                                                <div className="h5 mb-1">Your Income</div>
                                                <div className="h6 fw-bold text-success">{formatCurrency(scholarship.common.evaluation.income)}</div>
                                                <small className="text-success">Within limit</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            {/* Next Steps */}
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-body p-4">
                                    <h6 className="mb-3 d-flex align-items-center">
                                        <TrendingUp size={18} className="me-2 text-info" />
                                        What's Next?
                                    </h6>
                                    <div className="list-group list-group-flush">
                                        <div className="list-group-item px-0 py-3 border-0">
                                            <div className="d-flex align-items-start">
                                                <div className="p-2 bg-info bg-opacity-10 rounded me-3">
                                                    <BookOpen size={18} className="text-info" />
                                                </div>
                                                <div>
                                                    <div className="fw-semibold">Improve Your Grades</div>
                                                    <small className="text-muted">Focus on raising your GWA for future applications</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="list-group-item px-0 py-3 border-0">
                                            <div className="d-flex align-items-start">
                                                <div className="p-2 bg-primary bg-opacity-10 rounded me-3">
                                                    <School size={18} className="text-primary" />
                                                </div>
                                                <div>
                                                    <div className="fw-semibold">Enroll More Units</div>
                                                    <small className="text-muted">Take additional subjects to meet minimum requirements</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="list-group-item px-0 py-3 border-0">
                                            <div className="d-flex align-items-start">
                                                <div className="p-2 bg-warning bg-opacity-10 rounded me-3">
                                                    <Calendar size={18} className="text-warning" />
                                                </div>
                                                <div>
                                                    <div className="fw-semibold">Apply Next Semester</div>
                                                    <small className="text-muted">You can reapply once you meet the requirements</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Support */}
                            <div className="card border-primary border-2">
                                <div className="card-body p-4">
                                    <div className="text-center">
                                        <Mail size={32} className="text-primary mb-3" />
                                        <h6 className="mb-2">Need Guidance?</h6>
                                        <p className="text-muted small mb-3">
                                            Our academic advisors can help you create an improvement plan.
                                        </p>
                                        <button className="btn btn-primary btn-sm w-100 mb-2">
                                            Schedule Consultation
                                        </button>
                                        <button className="btn btn-outline-primary btn-sm w-100">
                                            View Other Scholarships
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Application;
