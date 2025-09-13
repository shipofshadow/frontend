import {useEffect, useState} from "react";
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
    AlertTriangle
} from "lucide-react";
import type {ApplicationStatus} from "../../interfaces/application_status.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import {hasApplied} from "../../services/applicationService.tsx";
import { useDispatch, useSelector } from 'react-redux';
import {fetchSemester} from "../../store/slices/semesterSlice.ts";
import type {AppDispatch, RootState} from "../../store/slices";

const Home = () => {
    const { user, token } = useAuth();
    const [applicationInfo, setApplicationInfo] = useState<ApplicationStatus | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { current } = useSelector((state: RootState) => state.semester);

    useEffect(() => {
        hasApplied(token)
            .then(setApplicationInfo)
            .catch(() => setApplicationInfo({ has_applied: false }));
    }, [token]);

    useEffect(() => {
        dispatch(fetchSemester());

    }, [dispatch]);


    return (
        <div className="min-vh-100 bg-light">

            <div className="container py-4">
                <div className="row g-4">

                    {/* Welcome Section */}
                    <div className="col-12">
                        <div className="card border-0 shadow-sm overflow-hidden">
                            <div
                                className="card-body p-4 text-white position-relative"
                                style={{
                                    background: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)',
                                }}
                            >
                                <div className="row align-items-center">
                                    <div className="col-md-9">
                                        <h1 className="h3 fw-bold mb-3 text-white">
                                            Welcome back, {user?.profile?.first_name} {user?.profile?.last_name}!
                                        </h1>

                                    </div>
                                    <div className="col-md-3 text-center">
                                        <GraduationCap size={80} className="text-white opacity-50" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Application Status */}
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white border-0 pb-0">
                                <div className="d-flex align-items-center">
                                    <FileText className="text-primary me-2" size={20} />
                                    <h5 className="fw-bold mb-0">Application Status</h5>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="mb-4">
                                    <h6 className="fw-semibold text-muted mb-2">Current Application</h6>
                                    <p className="mb-3 fw-medium">{current}</p>

                                    <div className="d-flex align-items-center mb-3">
                                        <span className="me-3">Status:</span>
                                        <span className="badge bg-warning text-warning-emphasis px-3 py-2">
                                            <Clock size={14} className="me-1" />
                                            {applicationInfo?.status}
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <span className="text-muted small">Application Progress:</span>
                                        <div className="mt-2">
                                            <div className="d-flex align-items-center">
                                                <span className="badge bg-success me-2">
                                                    <CheckCircle size={12} />
                                                </span>
                                                <span className="small text-muted me-3">Submitted</span>
                                                <span className="me-3">→</span>
                                                <span className="badge bg-primary me-2">
                                                    <Clock size={12} />
                                                </span>
                                                <span className="small fw-bold text-primary me-3">Review</span>
                                                <span className="me-3">→</span>
                                                <span className="small text-muted">Decision</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button className="btn btn-outline-primary">
                                    <Eye size={16} className="me-2" />
                                    View Application Details
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Scholarship Recommendations */}
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white border-0 pb-0">
                                <div className="d-flex align-items-center">
                                    <Target className="text-success me-2" size={20} />
                                    <h5 className="fw-bold mb-0">Recommended for You</h5>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="mb-4">
                                    <div className="list-group list-group-flush">
                                        <div className="list-group-item px-0 py-2 border-0">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-1 fw-medium">Academic Excellence Grant</h6>
                                                    <small className="text-muted">Based on your GWA of 1.75</small>
                                                </div>
                                                <button className="btn btn-link btn-sm p-0 text-decoration-none">
                                                    View Details →
                                                </button>
                                            </div>
                                        </div>
                                        <div className="list-group-item px-0 py-2 border-0">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-1 fw-medium">Financial Assistance Scholarship</h6>
                                                    <small className="text-muted">Matches your income bracket</small>
                                                </div>
                                                <button className="btn btn-link btn-sm p-0 text-decoration-none">
                                                    View Details →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button className="btn btn-primary">
                                    View All Scholarships
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Announcements */}
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white border-0 pb-0">
                                <div className="d-flex align-items-center">
                                    <Bell className="text-info me-2" size={20} />
                                    <h5 className="fw-bold mb-0">Recent Announcements</h5>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="list-group list-group-flush">
                                    <div className="list-group-item px-0 py-3 border-0">
                                        <div className="d-flex align-items-start">
                                            <Calendar className="text-danger me-2 mt-1 flex-shrink-0" size={16} />
                                            <div>
                                                <h6 className="mb-1 fw-medium">Application Deadline Reminder</h6>
                                                <p className="mb-0 small text-muted">
                                                    AY 2025–2026 applications due September 30, 2025
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="list-group-item px-0 py-3 border-0">
                                        <div className="d-flex align-items-start">
                                            <Plus className="text-success me-2 mt-1 flex-shrink-0" size={16} />
                                            <div>
                                                <h6 className="mb-1 fw-medium">New Scholarship Available</h6>
                                                <p className="mb-0 small text-muted">
                                                    STEM Innovators Grant now accepting applications
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Document Status */}
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white border-0 pb-0 d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <Upload className="text-secondary me-2" size={20} />
                                    <h5 className="fw-bold mb-0">Document Status</h5>
                                </div>
                                <button className="btn btn-primary btn-sm">
                                    <Upload size={14} className="me-1" />
                                    Upload Documents
                                </button>
                            </div>
                            <div className="card-body">
                                <div className="list-group list-group-flush">
                                    <div className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center border-0">
                                        <span className="fw-medium">Academic Grades</span>
                                        <span className="badge bg-success-subtle text-success-emphasis">
                                            <CheckCircle size={12} className="me-1" />
                                            Verified
                                        </span>
                                    </div>
                                    <div className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center border-0">
                                        <span className="fw-medium">Income Tax Return</span>
                                        <span className="badge bg-warning-subtle text-warning-emphasis">
                                            <Clock size={12} className="me-1" />
                                            Pending Review
                                        </span>
                                    </div>
                                    <div className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center border-0">
                                        <span className="fw-medium">Birth Certificate</span>
                                        <span className="badge bg-danger-subtle text-danger-emphasis">
                                            <XCircle size={12} className="me-1" />
                                            Needs Re-upload
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Eligibility Score */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white border-0 pb-0">
                                <div className="d-flex align-items-center">
                                    <TrendingUp className="text-primary me-2" size={20} />
                                    <h5 className="fw-bold mb-0">Eligibility Assessment</h5>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="row align-items-center mb-4">
                                    <div className="col-md-6">
                                        <div className="text-center">
                                            <div className="display-4 fw-bold text-primary mb-2">78%</div>
                                            <span className="badge bg-success-subtle text-success-emphasis px-3 py-2">
                                                Above Average
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="progress mb-2" style={{ height: '12px' }}>
                                            <div
                                                className="progress-bar bg-primary"
                                                style={{ width: '78%' }}
                                                role="progressbar"
                                                aria-valuenow={78}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                            ></div>
                                        </div>
                                        <small className="text-muted">Eligibility Score</small>
                                    </div>
                                </div>

                                <div className="row text-center mb-4">
                                    <div className="col-4">
                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                            <CheckCircle className="text-success me-1" size={16} />
                                            <span className="fw-medium">GWA: 1.75</span>
                                        </div>
                                        <small className="text-success">Excellent</small>
                                    </div>
                                    <div className="col-4">
                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                            <CheckCircle className="text-success me-1" size={16} />
                                            <span className="fw-medium">Income Level</span>
                                        </div>
                                        <small className="text-success">Qualified</small>
                                    </div>
                                    <div className="col-4">
                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                            <AlertTriangle className="text-warning me-1" size={16} />
                                            <span className="fw-medium">Family Status</span>
                                        </div>
                                        <small className="text-warning">Needs Review</small>
                                    </div>
                                </div>

                                <div className="alert alert-info border-0 bg-info-subtle">
                                    <div className="d-flex align-items-start">
                                        <div className="me-2">💡</div>
                                        <div>
                                            <strong>Tip:</strong> Upload your updated Income Tax Return to potentially increase your eligibility score.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white border-0 pb-0">
                                <h5 className="fw-bold mb-0">Quick Actions</h5>
                            </div>
                            <div className="card-body">
                                <div className="d-grid gap-3">
                                    <button className="btn btn-primary d-flex align-items-center">
                                        <Plus size={18} className="me-2" />
                                        Apply for Scholarship
                                    </button>
                                    <button className="btn btn-outline-secondary d-flex align-items-center">
                                        <User size={18} className="me-2" />
                                        Update Profile
                                    </button>
                                    <button className="btn btn-outline-info d-flex align-items-center">
                                        <Download size={18} className="me-2" />
                                        Download Application PDF
                                    </button>
                                    <button className="btn btn-outline-success d-flex align-items-center">
                                        <MessageCircle size={18} className="me-2" />
                                        Contact Support
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Home;
