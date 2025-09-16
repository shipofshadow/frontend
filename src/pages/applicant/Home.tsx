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
} from "lucide-react";
import type { ApplicationStatus } from "../../interfaces/application_status.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import { hasApplied } from "../../services/applicationService.tsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchSemester } from "../../store/slices/semesterSlice.ts";
import type { AppDispatch, RootState } from "../../store/slices";

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
        <main className="min-vh-100 bg-light d-flex flex-column">
            <div className="container py-5">
                {/* Welcome Banner */}
                <section
                    className="mb-5 rounded-4 text-white p-5 shadow-sm"
                    style={{ background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)" }}
                    aria-label="Welcome section"
                >
                    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
                        <div>
                            <h1 className="h1 fw-bold mb-2">
                                Welcome back, {user?.profile?.first_name} {user?.profile?.last_name}!
                            </h1>
                            <p className="lead text-white-75 mb-0">
                                Current semester: <strong className="text-white">{current}</strong>
                            </p>
                        </div>
                        <GraduationCap size={96} className="opacity-50" aria-hidden="true" />
                    </div>
                </section>

                {/* Two Columns */}
                <div className="row g-4">
                    {/* Left Column */}
                    <div className="col-lg-8 d-flex flex-column gap-4">
                        {/* Application Status */}
                        <section className="card shadow-sm rounded-4 border-0">
                            <header className="card-header border-0 bg-white rounded-top-4 pb-2 d-flex align-items-center gap-2">
                                <FileText size={22} className="text-primary" aria-hidden="true" />
                                <h4 className="mb-0 fw-bold">Application Status</h4>
                            </header>
                            <div className="card-body">
                                <h6 className="text-muted fw-semibold">Current Application</h6>
                                <p className="fs-5 fw-medium mb-3">{current}</p>

                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <span className="text-muted">Status:</span>
                                    <span className="badge bg-warning text-dark fw-semibold d-inline-flex align-items-center gap-1 px-3 py-2 rounded-pill">
                    <Clock size={16} aria-hidden="true" /> {applicationInfo?.status ?? "Pending"}
                  </span>
                                </div>

                                <div className="mb-4">
                                    <span className="small text-muted d-block">Application Progress</span>
                                    <div className="d-flex align-items-center gap-3 mt-2 flex-wrap">
                                        <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-success rounded-circle p-2">
                        <CheckCircle size={14} aria-hidden="true" />
                      </span>
                                            <span className="text-muted">Submitted</span>
                                        </div>
                                        <span className="fs-5 text-muted">→</span>
                                        <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-primary rounded-circle p-2">
                        <Clock size={14} aria-hidden="true" />
                      </span>
                                            <span className="fw-semibold text-primary">Review</span>
                                        </div>
                                        <span className="fs-5 text-muted">→</span>
                                        <div className="text-muted">Decision</div>
                                    </div>
                                </div>

                                <button className="btn btn-outline-primary btn-outline-visible">
                                    <Eye size={20} className="me-2" aria-hidden="true" />
                                    View Application Details
                                </button>
                            </div>
                        </section>

                        {/* Eligibility + Documents */}
                        <div className="d-flex gap-4 flex-column flex-md-row">
                            {/* Eligibility Assessment */}
                            <section className="card flex-fill shadow-sm rounded-4 border-0">
                                <header className="card-header border-0 bg-white rounded-top-4 pb-2 d-flex align-items-center gap-2">
                                    <TrendingUp size={22} className="text-primary" aria-hidden="true" />
                                    <h4 className="mb-0 fw-bold">Eligibility Assessment</h4>
                                </header>
                                <div className="card-body">
                                    <div className="row align-items-center mb-4">
                                        <div className="col-md-6 text-center mb-3 mb-md-0">
                                            <div className="display-5 fw-bold text-primary mb-2">78%</div>
                                            <span className="badge bg-success-subtle text-success-emphasis rounded-pill px-4 py-2 fs-6">
                        Above Average
                      </span>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="progress mb-2 rounded-pill" style={{ height: "14px" }}>
                                                <div
                                                    className="progress-bar bg-primary rounded-pill"
                                                    style={{ width: "78%" }}
                                                    role="progressbar"
                                                    aria-valuenow={78}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                />
                                            </div>
                                            <small className="text-muted">Eligibility Score</small>
                                        </div>
                                    </div>

                                    <div className="row text-center g-3">
                                        {[
                                            { label: "GWA: 1.75", icon: CheckCircle, color: "text-success", text: "Excellent" },
                                            { label: "Income Level", icon: CheckCircle, color: "text-success", text: "Qualified" },
                                            { label: "Family Status", icon: AlertTriangle, color: "text-warning", text: "Needs Review" },
                                        ].map(({ label, icon: Icon, color, text }) => (
                                            <div key={label} className="col-4">
                                                <div className="d-flex align-items-center justify-content-center mb-1 gap-1">
                                                    <Icon className={color} size={18} aria-hidden="true" />
                                                    <span className="fw-semibold">{label}</span>
                                                </div>
                                                <small className={color}>{text}</small>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="alert alert-info bg-opacity-25 border-0 d-flex align-items-start gap-2 py-3 rounded-3 mt-3">
                                        <div aria-hidden="true">💡</div>
                                        <div>
                                            <strong>Tip:</strong> Upload an updated Income Tax Return to potentially increase the eligibility score.
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Document Status */}
                            <section className="card flex-fill shadow-sm rounded-4 border-0">
                                <header className="card-header border-0 bg-white rounded-top-4 pb-2 d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-2">
                                        <Upload className="text-secondary" size={22} aria-hidden="true" />
                                        <h4 className="mb-0 fw-bold">Document Status</h4>
                                    </div>
                                    <button className="btn btn-primary btn-sm d-flex align-items-center gap-1 px-3 py-2 rounded-pill">
                                        <Upload size={16} aria-hidden="true" /> Upload Documents
                                    </button>
                                </header>
                                <div className="card-body">
                                    <div className="list-group list-group-flush">
                                        {[
                                            { label: "Academic Grades", status: "Verified", icon: CheckCircle, bg: "bg-success-subtle", color: "text-success-emphasis" },
                                            { label: "Income Tax Return", status: "Pending Review", icon: Clock, bg: "bg-warning-subtle", color: "text-warning-emphasis" },
                                            { label: "Birth Certificate", status: "Needs Re-upload", icon: XCircle, bg: "bg-danger-subtle", color: "text-danger-emphasis" },
                                        ].map(({ label, status, icon: Icon, bg, color }) => (
                                            <div key={label} className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center border-0">
                                                <span className="fw-semibold">{label}</span>
                                                <span className={`badge ${bg} ${color} d-inline-flex align-items-center gap-1 rounded-pill px-3 py-1`}>
                          <Icon size={14} aria-hidden="true" />
                                                    {status}
                        </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Scholarship Recommendations */}
                        <section className="card shadow-sm rounded-4 border-0">
                            <header className="card-header border-0 bg-white rounded-top-4 pb-2 d-flex align-items-center gap-2">
                                <Target size={22} className="text-success" aria-hidden="true" />
                                <h4 className="mb-0 fw-bold">Recommended for You</h4>
                            </header>
                            <div className="card-body">
                                <div className="list-group list-group-flush mb-3">
                                    <div className="list-group-item px-0 py-3 border-0 d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="mb-1 fw-semibold">Academic Excellence Grant</h6>
                                            <small className="text-muted">Based on GWA of 1.75</small>
                                        </div>
                                        <button className="btn btn-link p-0 fw-semibold">View Details →</button>
                                    </div>
                                    <div className="list-group-item px-0 py-3 border-0 d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="mb-1 fw-semibold">Financial Assistance Scholarship</h6>
                                            <small className="text-muted">Matches income bracket</small>
                                        </div>
                                        <button className="btn btn-link p-0 fw-semibold">View Details →</button>
                                    </div>
                                </div>
                                <button className="btn btn-outline-primary btn-hover-gradient w-100 d-flex justify-content-center align-items-center gap-2">
                                    <Eye size={18} aria-hidden="true" /> View All Scholarships
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Right Column */}
                    <aside className="col-lg-4 d-flex flex-column gap-4">
                        {/* Quick Actions */}
                        <section className="card shadow-sm border-0 rounded-4">
                            <header className="card-header border-0 bg-white rounded-top-4 pb-2">
                                <h4 className="fw-bold mb-0">Quick Actions</h4>
                            </header>
                            <div className="card-body d-grid gap-3">
                                <button className="btn btn-primary d-flex align-items-center justify-content-center gap-2 rounded-3 py-3 fs-6 fw-semibold">
                                    <Plus size={20} aria-hidden="true" /> Apply for Scholarship
                                </button>
                                <button className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 rounded-3 py-3 fs-6 fw-semibold">
                                    <User size={20} aria-hidden="true" /> Update Profile
                                </button>
                                <button className="btn btn-outline-info d-flex align-items-center justify-content-center gap-2 rounded-3 py-3 fs-6 fw-semibold">
                                    <Download size={20} aria-hidden="true" /> Download Application PDF
                                </button>
                                <button className="btn btn-outline-success d-flex align-items-center justify-content-center gap-2 rounded-3 py-3 fs-6 fw-semibold">
                                    <MessageCircle size={20} aria-hidden="true" /> Contact Support
                                </button>
                            </div>
                        </section>

                        {/* Announcements */}
                        <section className="card shadow-sm border-0 rounded-4">
                            <header className="card-header border-0 bg-white rounded-top-4 pb-2 d-flex align-items-center gap-2">
                                <Bell size={22} className="text-info" aria-hidden="true" />
                                <h4 className="mb-0 fw-bold">Recent Announcements</h4>
                            </header>
                            <div className="card-body">
                                <div className="list-group list-group-flush">
                                    <div className="list-group-item px-0 py-3 border-0 d-flex align-items-start gap-3">
                                        <Calendar className="text-danger mt-1 flex-shrink-0" size={18} aria-hidden="true" />
                                        <div>
                                            <h6 className="mb-1 fw-semibold">Application Deadline Reminder</h6>
                                            <p className="mb-0 small text-muted">AY 2025–2026 applications due September 30, 2025</p>
                                        </div>
                                    </div>
                                    <div className="list-group-item px-0 py-3 border-0 d-flex align-items-start gap-3">
                                        <Plus className="text-success mt-1 flex-shrink-0" size={18} aria-hidden="true" />
                                        <div>
                                            <h6 className="mb-1 fw-semibold">New Scholarship Available</h6>
                                            <p className="mb-0 small text-muted">STEM Innovators Grant now accepting applications</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>

            {/* Styles: icon normalization + CTA polish */}
            <style>{`
        .lucide { stroke-width: 2; }
        .btn-outline-visible {
          border-width: 2px;
          color: #0d6efd;
          border-color: #0d6efd;
          font-weight: 600;
          padding: 0.55rem 1.25rem;
          border-radius: 0.5rem;
          display: inline-flex;
          align-items: center;
          transition: background .2s ease, color .2s ease, border-color .2s ease;
        }
        .btn-outline-visible:hover, .btn-outline-visible:focus {
          background: linear-gradient(90deg, #0d6efd 0%, #6610f2 100%);
          color: #fff;
          border-color: transparent;
          outline: none;
        }
        .btn-hover-gradient:hover {
          background: linear-gradient(90deg, rgba(13,110,253,.12), rgba(102,16,242,.12));
          border-color: rgba(13,110,253,.25);
        }
        .card { border-radius: .85rem; }
        .card-header { background: transparent; }
        .badge { font-weight: 600; }
      `}</style>
        </main>
    );
};

export default Home;