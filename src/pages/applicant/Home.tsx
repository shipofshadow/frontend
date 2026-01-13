import { useEffect, useState } from "react";
import {
    Bell,
    Eye,
    GraduationCap,
    Plus,
    User,
    MessageCircle,
    FileText,
    Calendar,
    TrendingUp,
    CheckCircle,
    Clock,
    XCircle,
    BookOpen,
    Award,
    ArrowRight,
    Info,
    Library,
    Send, Search, AlertCircle, XOctagon
} from "lucide-react";

import type { ApplicationStatus } from "../../interfaces/application_status.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import { hasApplied } from "../../services/applicationService.tsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchSemester } from "../../store/slices/semesterSlice.ts";
import type { AppDispatch, RootState } from "../../store/slices";
import {Link} from "react-router-dom";
import {API_BASE_URL} from "../../config.ts";
import {useSettings} from "../../context/SettingsContext.tsx";

interface Announcement {
    id: number;
    title: string;
    message: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    created_at: string;
    audience_type: string;
}
const Home = () => {
    const { user, token, applications} = useAuth();
    const [applicationInfo, setApplicationInfo] = useState<ApplicationStatus | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch<AppDispatch>();
    const { current } = useSelector((state: RootState) => state.semester);
    const { settings } = useSettings();
    const applicant = applications?.applications?.[0] ?? null;


    useEffect(() => {
        setIsLoading(true);
        hasApplied(token)
            .then(setApplicationInfo)
            .catch(() => setApplicationInfo({ has_applied: false }))
            .finally(() => setIsLoading(false));
        const fetchAnnouncements = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/announcements/feed`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const json = await res.json();
                if (json.success) {
                    setAnnouncements(json.data);
                }
            } catch (err) {
                console.error("Failed to load announcements", err);
            }
        };
        fetchAnnouncements();
    }, [token]);

    useEffect(() => {
        dispatch(fetchSemester());
    }, [dispatch]);



    const eligibilityScore = ((applicant?.evaluation?.score ?? 0) * 100).toFixed(2);

    // Format submitted date
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

    // Get status badge styling
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return { class: 'bg-success', icon: CheckCircle, text: 'Approved' };
            case 'pending':
                return { class: 'bg-warning text-dark', icon: Clock, text: 'Under Review' };
            case 'evaluated':
                return { class: 'bg-secondary text-white', icon: Clock, text: 'Evaluated' };
            case 'returned':
                return { class: 'bg-warning text-dark', icon: Clock, text: 'Returned' };
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
                    {settings.isApplicationOpen ? (
                        <Link to='/applicant/apply' className="btn btn-primary btn-lg px-4 d-inline-flex align-items-center">
                            <Plus size={20} className="me-2" />
                            Start Application
                        </Link>
                    ) : (
                        <button
                            className="btn btn-secondary btn-lg px-4 d-inline-flex align-items-center"
                            disabled
                            title="Applications are currently closed"
                        >
                            <Plus size={20} className="me-2" />
                            Application Closed
                        </button>
                    )}
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
                                            {applicant?.application?.submitted_at ? formatDate(applicant?.application?.submitted_at) : 'N/A'}
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
                                    {applicationInfo?.status === 'evaluated' && 'Processing your application!'}
                                    {applicationInfo?.status === 'approved' && 'Congratulations!'}
                                    {applicationInfo?.status === 'returned' && 'Please review your application!'}
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


                    {applicationInfo?.status === 'returned' && (
                        <div className="bg-danger bg-opacity-10 rounded-3 p-3 mb-4 animate__animated animate__shakeX">
                            <div className="d-flex align-items-start">
                                {/* Replace XOctagon with your actual imported icon component */}
                                <XOctagon className="text-danger me-2 mt-1 flex-shrink-0" size={20} />
                                <div>
                                    <h6 className="fw-bold text-danger mb-2">Application Returned for Revision (Action Required)</h6>
                                    <p className="mb-2 small">
                                        Your application was **returned** by the reviewer. Please check the **Feedback** section below for required corrections on your profile details or submitted documents.
                                    </p>
                                    <small className="text-muted">
                                        You must make the necessary revisions and **resubmit** your application before the deadline.
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

                    {applicationInfo?.status === 'evaluated' && (
                        <div className="bg-info bg-opacity-10 rounded-3 p-3 mb-4">
                            <div className="d-flex align-items-start">
                                <Search className="text-info me-2 mt-1 flex-shrink-0" size={20} />
                                <div>
                                    <h6 className="fw-bold text-info mb-2">Application Evaluated</h6>
                                    <p className="mb-2 small">
                                        Your scholarship application has been successfully evaluated by our system.
                                        Our admissions team is now reviewing the evaluation results for final decision.
                                    </p>
                                    <small className="text-muted">
                                        Final approval decision will be communicated within 3-5 business days.
                                    </small>

                                    {applicant?.evaluation && (
                                        <div className="mt-3 p-2 bg-light rounded-2">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <span className="small fw-medium">Eligibility Score:</span>
                                                <span className={`badge ${
                                                    applicant?.evaluation?.score * 100 >= 80 ? 'bg-success' :
                                                        applicant?.evaluation?.score * 100 >= 60 ? 'bg-warning' : 'bg-secondary'
                                                } px-2 py-1`}>
                                                    {applicant?.evaluation?.score * 100}
                                                </span>
                                            </div>
                                            <div className="progress mt-2" style={{height: '4px'}}>
                                                <div
                                                    className={`progress-bar ${
                                                        applicant?.evaluation?.score * 100 >= 80 ? 'bg-success' :
                                                            applicant?.evaluation?.score * 100 >= 60 ? 'bg-warning' : 'bg-secondary'
                                                    }`}
                                                    style={{width: `${applicant?.evaluation?.score * 100}%`}}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="d-flex gap-2 flex-wrap">
                        <Link
                            to={`/applicant/application/${applicant?.application?.id}`}
                            className="btn btn-primary"
                        >
                            <Eye size={18} className="me-2" />
                            View Full Application
                        </Link>

                        {/*<button className="btn btn-outline-secondary">*/}
                        {/*    <Download size={18} className="me-2" />*/}
                        {/*    Download PDF*/}
                        {/*</button>*/}
                        {/*{applicationInfo?.status === 'pending' && (*/}
                        {/*    <button className="btn btn-outline-info">*/}
                        {/*        <MessageCircle size={18} className="me-2" />*/}
                        {/*        Contact Reviewer*/}
                        {/*    </button>*/}
                        {/*)}*/}
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
                                    <div className="col-md-6 mb-2">
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

                {/* Main Content Grid */}
                <div className="row g-4">
                    {/* Left Column - Primary Content */}
                    <div className="col-lg-8">
                        {/* Conditional Application Status */}
                        {applicationInfo?.has_applied ? <AppliedView /> : <NotAppliedView />}



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
                                    <button className="btn btn-secondary">
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

                    {/* Right Column - Secondary Content */}
                    <div className="col-lg-4">
                        {/* Enhanced Quick Actions */}
                        <section className="card shadow-sm border-0 rounded-4 mb-4">
                            <div className="card-header bg-gradient border-0 rounded-top-4">
                                <h5 className="fw-bold mb-0">Quick Actions</h5>
                            </div>
                            <div className="card-body d-grid gap-3">
                                {!applicationInfo?.has_applied ? (
                                    // CASE 1: User hasn't applied yet. Check if portal is OPEN.
                                    settings.isApplicationOpen ? (
                                        <Link to="/applicant/apply" className="btn btn-primary d-flex align-items-center justify-content-between rounded-3 py-3">
                                            <div className="d-flex align-items-center">
                                                <Plus size={20} className="me-3" />
                                                <span className="fw-semibold">New Application</span>
                                            </div>
                                            <ArrowRight size={18} />
                                        </Link>
                                    ) : (
                                        // CASE 2: User hasn't applied, but portal is CLOSED.
                                        <button
                                            className="btn btn-secondary d-flex align-items-center justify-content-between rounded-3 py-3 w-100"
                                            disabled
                                            title="The application period is currently closed."
                                        >
                                            <div className="d-flex align-items-center">
                                                <Plus size={20} className="me-3" />
                                                <span className="fw-semibold">Application Closed</span>
                                            </div>
                                        </button>
                                    )
                                ) : (
                                    // CASE 3: User has already applied.
                                    <Link to="/applicant/status" className="btn btn-outline-primary d-flex align-items-center justify-content-between rounded-3 py-3">
                                        <div className="d-flex align-items-center">
                                            <Eye size={20} className="me-3" />
                                            <span className="fw-semibold">View Application</span>
                                        </div>
                                        <ArrowRight size={18} />
                                    </Link>
                                )}
                                <Link to="/applicant/profile/edit" className="btn btn-outline-secondary d-flex align-items-center justify-content-between rounded-3 py-3">
                                    <div className="d-flex align-items-center">
                                        <User size={20} className="me-3" />
                                        <span className="fw-semibold">Update Profile</span>
                                    </div>
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        </section>


                        {/* Recent Announcements - DYNAMIC */}
                        <section className="card shadow-sm border-0 rounded-4 mb-4">
                            <div className="card-header bg-gradient border-0 rounded-top-4">
                                <div className="d-flex align-items-center">
                                    <Bell className="text-info me-2" size={20} />
                                    <h5 className="fw-bold mb-0">Recent Announcements</h5>
                                </div>
                            </div>
                            <div className="card-body">
                                {announcements.length > 0 ? (
                                    <div className="list-group list-group-flush">
                                        {announcements.map((ann) => {
                                            // Determine styling based on priority
                                            let iconColor = 'text-info';
                                            let bgClass = 'bg-info';
                                            let Icon = Info;

                                            if (ann.priority === 'urgent') {
                                                iconColor = 'text-danger';
                                                bgClass = 'bg-danger';
                                                Icon = AlertCircle;
                                            } else if (ann.priority === 'high') {
                                                iconColor = 'text-warning';
                                                bgClass = 'bg-warning';
                                                Icon = Award; // Or Star
                                            } else if (ann.priority === 'normal') {
                                                iconColor = 'text-primary';
                                                bgClass = 'bg-primary';
                                                Icon = Bell;
                                            }

                                            return (
                                                <div key={ann.id} className="list-group-item px-0 py-3 border-0">
                                                    <div className="d-flex align-items-start">
                                                        <div className={`${bgClass} bg-opacity-10 rounded-2 p-2 me-3 flex-shrink-0`}>
                                                            <Icon className={iconColor} size={18} />
                                                        </div>
                                                        <div className="flex-grow-1">
                                                            <h6 className="fw-bold mb-1">{ann.title}</h6>
                                                            <p className="mb-2 small text-muted">
                                                                {ann.message.length > 80 ? ann.message.substring(0, 80) + '...' : ann.message}
                                                            </p>
                                                            <small className="text-muted">
                                                                {new Date(ann.created_at).toLocaleDateString()}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted">
                                        <Bell size={32} className="mb-2 opacity-25" />
                                        <p className="mb-0 small">No new announcements.</p>
                                    </div>
                                )}

                                <button className="btn btn-outline-info w-100 mt-3">
                                    <Bell size={18} className="me-2" />
                                    View All Announcements
                                </button>
                            </div>
                        </section>

                    </div>
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