import {useState, useEffect, type JSX} from "react";
import {
    Calendar,
    DollarSign,
    FileText,
    CheckCircle,
    Clock,
    AlertCircle,
    User,
    School,
    ArrowLeft,
    Star,
    TrendingUp,
    BookOpen,
    CreditCard,
    XOctagon,
    Award,
} from "lucide-react";
import { API_BASE_URL } from "../../config.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import FilePreview from "../../components/admin/FilePreview.tsx";
import ScholarshipRecommendations from "./ScholarshipRecommendations.tsx";

// Type Definitions (Keeping these for context)
interface Student {
    name: string;
    student_id: string;
    email: string;
    phone: string;
    course: string;
    year_level: string;
    campus: string;
}

interface Application {
    id: number;
    reference_number: string | null;
    status: string;
    student: Student;
    submitted_at: string;
}

interface Evaluation {
    classification: string | null;
    gwa: number | null;
    income: number | null;
    score: number | null;
    total_units: number | null;
    // Assuming the backend sends back a field for specific feedback
    feedback?: string;
}

interface Requirement {
    file_name: string;
    status: "verified" | "pending" | "rejected";
    type: string;
    uploaded_at: string;
    size?: string;
}

interface AdminContact {
    name: string;
    email: string;
    phone: string;
    title?: string;
}

interface CommonData {
    application: Application;
    evaluation: Evaluation;
    requirements: Requirement[];
    scholarship_rules: Record<string, unknown>;
}

interface ScholarshipRequirements {
    min_gwa: number;
    min_units: number;
    max_income: number;
}

interface ScholarshipStatusResponse {
    name: string;
    description: string;
    grant_amount: number;
    approved_at: string;
    selection_reason: string;
    denial_reason?: string;
    status: "pending" | "evaluated" | "approved" | "denied" | "returned"; // Added "returned"
    admin_contact: AdminContact;
    common: CommonData;
    scholarship_requirements?: ScholarshipRequirements;
}

interface StatusConfig {
    badge: string;
    icon: JSX.Element;
    text: string;
    color: string;
    bgClass: string;
    textClass: string;
}

interface TabConfig {
    id: string;
    name: string;
    icon: React.ComponentType<{ size: number; className?: string }>;
}

// Component
const Application = () => {
    const [scholarship, setScholarship] = useState<ScholarshipStatusResponse>();
    const [activeTab, setActiveTab] = useState<string>("overview");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();
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
                            Authorization: `Bearer ${token}`,
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
    }, [application_id, token]);

    const getStatusConfig = (status: string): StatusConfig => {
        const configs: Record<string, StatusConfig> = {
            pending: {
                badge: "bg-warning text-dark",
                icon: <Clock size={18} />,
                text: "Under Review",
                color: "warning",
                bgClass: "bg-warning-subtle",
                textClass: "text-warning-emphasis"
            },
            evaluated: {
                badge: "bg-secondary text-white",
                icon: <Clock size={18} />,
                text: "Under Evaluation",
                color: "secondary",
                bgClass: "bg-secondary-subtle",
                textClass: "text-secondary-emphasis"
            },
            approved: {
                badge: "bg-success text-white",
                icon: <CheckCircle size={18} />,
                text: "Approved",
                color: "success",
                bgClass: "bg-success-subtle",
                textClass: "text-success-emphasis"
            },
            denied: {
                badge: "bg-danger text-white",
                icon: <AlertCircle size={18} />,
                text: "Not Approved",
                color: "danger",
                bgClass: "bg-danger-subtle",
                textClass: "text-danger-emphasis"
            },
            returned: { // ADDED RETURNED STATUS
                badge: "bg-danger text-white",
                icon: <XOctagon size={18} />,
                text: "Revision Required",
                color: "danger",
                bgClass: "bg-danger-subtle",
                textClass: "text-danger-emphasis"
            }
        };

        return configs[status] || configs.pending;
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    };

    const handleBackToApplications = () => {
        navigate("/applicant/status");
    };

    // Handler to navigate to the edit page for resubmission
    const handleGoToEdit = () => {
        // application/6/edit
        navigate(`/applicant/application/${scholarship?.common?.application?.id}/edit`);
    };

    const getFileIcon = (type: string): JSX.Element => {
        const icons: Record<string, JSX.Element> = {
            itr: <CreditCard size={20} className="text-primary" />,
            grades: <BookOpen size={20} className="text-success" />,
            cor: <FileText size={20} className="text-info" />
        };
        return icons[type] || <FileText size={20} className="text-muted" />;
    };

    const getFileTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
            itr: 'Income Tax Return',
            grades: 'Academic Records',
            cor: 'Certificate of Registration'
        };
        return labels[type] || 'Document';
    };

    const tabs: TabConfig[] = [
        { id: "overview", name: "Overview", icon: User },
        { id: "requirements", name: "Requirements", icon: FileText },
        { id: "evaluation", name: "Evaluation & Feedback", icon: TrendingUp },
        { id: "scholarships", name: "Scholarships", icon: Award },
    ];

    // Loading State
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

    // Error State
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

    // No Data State
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

    // Student Information Component
    const StudentInfoSection = () => (
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
    );

    // Academic Performance Component
    const AcademicPerformanceSection = () => (
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
                            <div className="h4 mb-1 text-warning">{scholarship.common.evaluation.gwa || "N/A"}</div>
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
                            <div className="h4 mb-1 text-info">{scholarship.common.evaluation.total_units || "N/A"}</div>
                            <small className="text-muted">Units</small>
                        </div>
                    </div>
                </div>
                <div className="text-center">
                    <span className="badge bg-success bg-gradient px-3 py-2">
                        {scholarship.common.evaluation.classification || "N/A"}
                    </span>
                </div>
            </div>
        </div>
    );

    // Requirements Component
    const RequirementsSection = () => {
        const getStatusBadge = (status: Requirement['status']) => {
            switch (status) {
                case 'verified':
                    return <span className="badge bg-success">Verified</span>;
                case 'rejected':
                    return <span className="badge bg-danger">Rejected</span>;
                default:
                    return <span className="badge bg-warning text-dark">Pending</span>;
            }
        };

        return (
            <div className="row g-3">
                {scholarship.common.requirements.length === 0 ? (
                    <div className="col-12 text-center py-4 text-muted">
                        <FileText size={40} className="mb-2" />
                        <p className="mb-0">No requirements uploaded yet.</p>
                    </div>
                ) : (
                    scholarship.common.requirements.map((req, index) => (
                        <div key={index} className="col-md-6">
                            <div className="card h-100 border-0 bg-light">
                                <div className="card-body p-3">
                                    {/* File Header Info */}
                                    <div className="d-flex align-items-start mb-3">
                                        <div className="p-2 bg-white rounded me-3">
                                            {getFileIcon(req.type)}
                                        </div>
                                        <div className="flex-grow-1 min-w-0">
                                            <div className="d-flex align-items-center justify-content-between mb-1">
                                                <h6 className="mb-0 text-truncate me-2">
                                                    {getFileTypeLabel(req.type)}
                                                </h6>
                                                {getStatusBadge(req.status)}
                                            </div>
                                            <small className="text-muted">
                                                <Calendar size={12} className="me-1" />
                                                {formatDate(req.uploaded_at)}
                                            </small>
                                        </div>
                                    </div>

                                    {/* Immediate File Preview */}
                                    <div className="border-top pt-3">
                                        <FilePreview
                                            label={req.type}
                                            filePath={req.file_name}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "overview":
                return (
                    <div className="row g-4">
                        <StudentInfoSection />
                        <AcademicPerformanceSection />
                    </div>
                );
            case "requirements":
                return <RequirementsSection />;
            case "evaluation":
                return (
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <h5 className="mb-3 d-flex align-items-center">
                                <TrendingUp size={20} className="me-2 text-primary" />
                                Evaluation Details
                            </h5>
                            <div className="row g-3 text-center">
                                <div className="col-md-3">
                                    <div className="bg-light rounded-3 p-3">
                                        <Star size={24} className="text-warning mb-2" />
                                        <div className="h4 mb-1 text-warning">{scholarship.common.evaluation.gwa || "N/A"}</div>
                                        <small className="text-muted">Current GWA</small>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="bg-light rounded-3 p-3">
                                        <DollarSign size={24} className="text-success mb-2" />
                                        <div className="h6 mb-1 text-success">
                                            {scholarship.common.evaluation.income ?
                                                formatCurrency(scholarship.common.evaluation.income) : "N/A"}
                                        </div>
                                        <small className="text-muted">Family Income</small>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="bg-light rounded-3 p-3">
                                        <BookOpen size={24} className="text-info mb-2" />
                                        <div className="h4 mb-1 text-info">{scholarship.common.evaluation.total_units || "N/A"}</div>
                                        <small className="text-muted">Total Units</small>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="bg-light rounded-3 p-3">
                                        <TrendingUp size={24} className="text-primary mb-2" />
                                        <div className="h4 mb-1 text-primary">
                                            {scholarship?.common?.evaluation?.score != null
                                                ? `${(scholarship.common.evaluation.score * 100).toFixed(2)}%`
                                                : "N/A"}
                                        </div>
                                        <small className="text-muted">Eligibility Score</small>
                                    </div>
                                </div>
                            </div>

                            {/* Evaluation Feedback Section */}
                            {scholarship.status === 'returned' && (
                                <div className="mt-5 p-4 border border-danger rounded-4 bg-danger-subtle">
                                    <h6 className="text-danger fw-bold mb-3 d-flex align-items-center">
                                        <XOctagon size={20} className="me-2" /> Reviewer Feedback
                                    </h6>
                                    <p className="mb-0 small text-danger">
                                        {/* Assuming the feedback field is available in the evaluation object */}
                                        {scholarship.common.evaluation.feedback || "No specific feedback was provided. Please review all required documents and profile details for completeness."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case "scholarships": {
                const appIdNum = application_id ? Number(application_id) : undefined;
                return (
                    <ScholarshipRecommendations
                        applicationId={!isNaN(appIdNum!) ? appIdNum : undefined}
                        embedded
                    />
                );
            }
            default:
                return null;
        }
    };

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
                                                <h1 className="h3 mb-2">{scholarship.name}</h1>
                                                <p className="text-muted mb-2">
                                                    <Calendar size={16} className="me-1" />
                                                    Submitted on {formatDate(scholarship?.common?.application?.submitted_at)}
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
                                            <code className="bg-light px-2 py-1 rounded">
                                                {scholarship.common.application?.reference_number ||
                                                    `#REF-${scholarship.common.application.id.toString().padStart(8, '0')}`}
                                            </code>
                                            {scholarship.grant_amount > 0 && (
                                                <div className="mt-2">
                                                    <small className="text-muted">Grant Amount</small>
                                                    <div className="h5 mb-0 text-success">
                                                        {formatCurrency(scholarship.grant_amount)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status-specific Messages */}

                {/* APPROVED STATUS */}
                {scholarship.status === "approved" && (
                    <div className="row mb-4">
                        <div className="col">
                            <div className="card border-success border-2 shadow-sm">
                                <div className="card-body text-center p-4">
                                    <CheckCircle size={64} className="text-success mb-3" />
                                    <h3 className="text-success-emphasis mb-3">Congratulations!</h3>
                                    <p className="text-muted mb-3 lead">Your scholarship application has been approved!</p>
                                    {scholarship.selection_reason && (
                                        <div className="alert alert-success" role="alert">
                                            <strong>Selection Reason:</strong> {scholarship.selection_reason}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* DENIED STATUS */}
                {scholarship.status === "denied" && (
                    <div className="row mb-4">
                        <div className="col">
                            <div className="card border-danger border-2 shadow-sm">
                                <div className="card-body text-center p-4">
                                    <AlertCircle size={64} className="text-danger mb-3" />
                                    <h3 className="text-danger-emphasis mb-3">Application Not Approved</h3>
                                    <p className="text-muted mb-3">Unfortunately, your scholarship application was not approved this time.</p>
                                    {scholarship.denial_reason && (
                                        <div className="alert alert-danger" role="alert">
                                            <strong>Reason:</strong> {scholarship.denial_reason}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* RETURNED STATUS (ACTION REQUIRED) */}
                {scholarship.status === "returned" && (
                    <div className="row mb-4">
                        <div className="col">
                            <div className="card border-danger border-2 shadow-lg animate__animated animate__shakeX">
                                <div className="card-body text-center p-4">
                                    <XOctagon size={64} className="text-danger mb-3" />
                                    <h3 className="h4 mb-3 text-danger-emphasis">Application Returned for Revision</h3>
                                    <p className="text-muted mb-4 lead">
                                        Your application was **returned** by the reviewer. Please check the **Evaluation & Feedback** tab for required corrections.
                                        You must make the necessary revisions and **resubmit** your application before the deadline.
                                    </p>
                                    <button
                                        className="btn btn-danger btn-lg rounded-pill px-5 fw-bold"
                                        onClick={handleGoToEdit}
                                    >
                                        <ArrowLeft size={20} className="me-2 rotate-180" /> {/* ArrowRight or rotated ArrowLeft */}
                                        Go to Application Editor
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PENDING STATUS */}
                {scholarship.status === "pending" && (
                    <div className="row mb-4">
                        <div className="col">
                            <div className="card border-warning border-2 shadow-sm">
                                <div className="card-body text-center p-4">
                                    <div className="mb-4">
                                        <div className="position-relative d-inline-block">
                                            <Clock size={64} className="text-warning" />
                                            <div className="position-absolute top-0 start-100 translate-middle">
                                                <div className="spinner-border spinner-border-sm text-warning">
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
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* Tabs Navigation */}
                <div className="row mb-4">
                    <div className="col">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-transparent border-0">
                                <ul className="nav nav-pills" id="applicationTabs">
                                    {tabs.map((tab) => (
                                        <li key={tab.id} className="nav-item me-2">
                                            <button
                                                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                                                onClick={() => setActiveTab(tab.id)}
                                            >
                                                <tab.icon size={16} className="me-2" />
                                                {tab.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="card-body">
                                {renderTabContent()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Application;