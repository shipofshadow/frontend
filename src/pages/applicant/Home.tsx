import React, { useState } from 'react';
import {
    FileText,
    CheckCircle,
    Info,
    Bell,
    User,
    Award,
    Pencil,
    Calendar,
    TrendingUp,
    Clock,
    AlertCircle,
    Download,
    Upload,
    Star,
    ChevronRight,
    Target,
    BookOpen,
    DollarSign,
    GraduationCap,
    Brain,
    Zap,
    Settings
} from 'lucide-react';

const Home: React.FC = () => {
    const [hasApplication, setHasApplication] = useState(true); // Toggle this to see both views

    const NotAppliedView = () => (
        <div className="bg-light min-vh-100">
            <div className="container py-5">
                {/* Welcome Header */}
                <div className="text-center mb-5">
                    <h1 className="display-4 fw-bold text-primary mb-3">Welcome to iScholar, Cyanne! 🎓</h1>
                    <p className="lead text-muted fs-5">An Intelligent Scholarship Prequalification System Using Fuzzy Logic and Prescriptive Analytics</p>
                    <small className="text-muted">For Ilocos Sur Polytechnic State College</small>
                </div>

                {/* System Intelligence Features */}
                <div className="row justify-content-center mb-5">
                    <div className="col-lg-10">
                        <div className="card bg-gradient-primary text-white border-0 shadow-lg rounded-4">
                            <div className="card-body p-4">
                                <div className="text-center mb-4">
                                    <Brain size={48} className="mb-3" />
                                    <h3 className="fw-bold mb-2">Intelligent Evaluation System</h3>
                                    <p className="opacity-75 mb-0">Our advanced system uses fuzzy logic and prescriptive analytics to provide fair and accurate scholarship assessments</p>
                                </div>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <div className="text-center">
                                            <Target size={32} className="mb-2" />
                                            <h6 className="fw-semibold">Smart Data Modeling</h6>
                                            <small className="opacity-75">Advanced algorithms analyze your academic and financial data</small>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="text-center">
                                            <Zap size={32} className="mb-2" />
                                            <h6 className="fw-semibold">Real-Time Results</h6>
                                            <small className="opacity-75">Get instant prequalification feedback upon submission</small>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="text-center">
                                            <Settings size={32} className="mb-2" />
                                            <h6 className="fw-semibold">User-Friendly Design</h6>
                                            <small className="opacity-75">Intuitive interface tested for optimal user experience</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Application Card */}
                <div className="row justify-content-center mb-5">
                    <div className="col-lg-10">
                        <div className="card shadow-lg border-0 rounded-4">
                            <div className="card-body p-5">
                                <div className="text-center mb-5">
                                    <div className="bg-primary bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{width: '100px', height: '100px'}}>
                                        <Pencil size={48} className="text-white" />
                                    </div>
                                    <h2 className="display-6 fw-bold mb-3">Apply for Scholarship</h2>
                                    <p className="lead text-muted mb-4">
                                        Submit your academic records and family income information to be evaluated by our intelligent system.
                                        Experience real-time prequalification results powered by advanced analytics.
                                    </p>
                                </div>

                                {/* Requirements Overview */}
                                <div className="row g-4 mb-5">
                                    <div className="col-md-6">
                                        <div className="text-center p-4 bg-success bg-opacity-10 rounded-3 h-100">
                                            <GraduationCap size={48} className="text-success mb-3" />
                                            <h5 className="fw-bold mb-2">Academic Requirements</h5>
                                            <p className="small text-muted mb-2">Submit your official grades/transcript</p>
                                            <ul className="list-unstyled small text-muted">
                                                <li>• Minimum GPA requirement</li>
                                                <li>• Official academic records</li>
                                                <li>• Current enrollment status</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="text-center p-4 bg-warning bg-opacity-10 rounded-3 h-100">
                                            <DollarSign size={48} className="text-warning mb-3" />
                                            <h5 className="fw-bold mb-2">Financial Requirements</h5>
                                            <p className="small text-muted mb-2">Provide family income documentation</p>
                                            <ul className="list-unstyled small text-muted">
                                                <li>• Income Tax Return (ITR)</li>
                                                <li>• Certificate of Income</li>
                                                <li>• Supporting financial documents</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <div className="text-center">
                                    <button
                                        className="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-semibold"
                                        onClick={() => setHasApplication(true)}
                                    >
                                        <Pencil size={20} className="me-2" />
                                        Start Your Application
                                        <ChevronRight size={20} className="ms-2" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information Cards */}
                <div className="row g-4">
                    <div className="col-lg-6">
                        <div className="card h-100 border-0 shadow-sm rounded-4">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                                        <BookOpen size={24} className="text-info" />
                                    </div>
                                    <h5 className="fw-bold mb-0">Scholarship Details</h5>
                                </div>
                                <p className="text-muted mb-3">Learn about the scholarship amount, duration, and eligibility criteria.</p>
                                <button className="btn btn-outline-info btn-sm">
                                    View Details <ChevronRight size={16} className="ms-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="card h-100 border-0 shadow-sm rounded-4">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                                        <Info size={24} className="text-success" />
                                    </div>
                                    <h5 className="fw-bold mb-0">Application Guide</h5>
                                </div>
                                <p className="text-muted mb-3">Step-by-step guide on preparing your documents and completing your application.</p>
                                <button className="btn btn-outline-success btn-sm">
                                    Get Help <ChevronRight size={16} className="ms-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const AppliedView = () => (
        <div className="bg-light min-vh-100">
            <div className="container py-5">
                {/* Header */}
                <div className="text-center mb-5">
                    <h1 className="display-4 fw-bold text-primary mb-3">Your Scholarship Application 📋</h1>
                    <p className="lead text-muted">Track your application status and manage documents</p>
                    <small className="text-muted">Powered by intelligent fuzzy logic evaluation system</small>
                </div>

                {/* Application Status */}
                <div className="row justify-content-center mb-5">
                    <div className="col-lg-8">
                        <div className="card bg-primary text-white border-0 shadow-lg rounded-4">
                            <div className="card-body text-center p-5">
                                <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{width: '80px', height: '80px'}}>
                                    <Clock size={40} />
                                </div>
                                <h3 className="fw-bold mb-3">APPLICATION UNDER REVIEW</h3>
                                <p className="mb-2 opacity-75 fs-5">Submitted: June 10, 2025</p>
                                <p className="opacity-50">Expected decision: Within 2-3 weeks</p>
                                <div className="mt-3">
                                    <small className="opacity-75">
                                        <Brain size={16} className="me-1" />
                                        Analyzed by intelligent prequalification system
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Analysis Results */}
                <div className="row justify-content-center mb-4">
                    <div className="col-lg-10">
                        <div className="card bg-gradient-success text-white border-0 shadow-lg rounded-4">
                            <div className="card-body p-4">
                                <div className="text-center">
                                    <Brain size={32} className="mb-2" />
                                    <h5 className="fw-bold mb-2">Intelligent System Analysis Complete</h5>
                                    <p className="opacity-75 mb-0">Your application has been processed using advanced fuzzy logic algorithms and prescriptive analytics</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Evaluation Results */}
                <div className="row g-4 mb-5">
                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <GraduationCap size={24} className="text-success me-2" />
                                    <h5 className="fw-bold mb-0">Academic Evaluation</h5>
                                </div>
                                <div className="row">
                                    <div className="col-6">
                                        <p className="mb-1"><strong>Current GPA:</strong></p>
                                        <h4 className="text-success fw-bold">3.82</h4>
                                    </div>
                                    <div className="col-6">
                                        <p className="mb-1"><strong>AI Assessment:</strong></p>
                                        <span className="badge bg-success fs-6">QUALIFIED</span>
                                    </div>
                                </div>
                                <small className="text-muted">Analyzed using fuzzy logic data modeling • Minimum requirement: 3.0 GPA</small>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <DollarSign size={24} className="text-warning me-2" />
                                    <h5 className="fw-bold mb-0">Financial Assessment</h5>
                                </div>
                                <div className="row">
                                    <div className="col-6">
                                        <p className="mb-1"><strong>Family Income:</strong></p>
                                        <h6 className="text-warning fw-bold">₱285,000/year</h6>
                                    </div>
                                    <div className="col-6">
                                        <p className="mb-1"><strong>AI Assessment:</strong></p>
                                        <span className="badge bg-warning fs-6">ELIGIBLE</span>
                                    </div>
                                </div>
                                <small className="text-muted">Processed by prescriptive analytics • Based on submitted ITR</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Overall Assessment */}
                <div className="row justify-content-center mb-5">
                    <div className="col-lg-8">
                        <div className="card bg-success text-white border-0 shadow-lg rounded-4">
                            <div className="card-body text-center p-4">
                                <div className="d-flex align-items-center justify-content-center mb-3">
                                    <Award size={32} className="me-2" />
                                    <h4 className="fw-bold mb-0">PRELIMINARY ASSESSMENT: QUALIFIED</h4>
                                </div>
                                <p className="mb-2 opacity-75">You meet both academic and financial requirements based on intelligent system analysis.</p>
                                <small className="opacity-75">
                                    <Zap size={16} className="me-1" />
                                    Real-time prequalification completed • Final decision pending committee review
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Cards */}
                <div className="row g-4 mb-5">
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body text-center p-4">
                                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '56px', height: '56px'}}>
                                    <CheckCircle size={28} className="text-primary" />
                                </div>
                                <h5 className="fw-bold mb-2">Application Status</h5>
                                <p className="text-muted small mb-3">View detailed status and timeline of your intelligent evaluation process.</p>
                                <button className="btn btn-outline-primary btn-sm">
                                    View Timeline <ChevronRight size={16} className="ms-1" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body text-center p-4">
                                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '56px', height: '56px'}}>
                                    <FileText size={28} className="text-success" />
                                </div>
                                <h5 className="fw-bold mb-2">Documents</h5>
                                <p className="text-muted small mb-3">View analyzed documents (Grades, ITR) and upload additional files if needed.</p>
                                <button className="btn btn-outline-success btn-sm">
                                    View Files <FileText size={16} className="ms-1" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body text-center p-4">
                                <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '56px', height: '56px'}}>
                                    <Info size={28} className="text-info" />
                                </div>
                                <h5 className="fw-bold mb-2">System Information</h5>
                                <p className="text-muted small mb-3">Learn about the intelligent evaluation system and how it works.</p>
                                <button className="btn btn-outline-info btn-sm">
                                    Learn More <ChevronRight size={16} className="ms-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="row g-4">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <Bell size={24} className="text-danger me-2" />
                                    <h5 className="fw-bold mb-0">System Processing Updates</h5>
                                </div>
                                <div className="list-group list-group-flush">
                                    <div className="list-group-item border-0 px-0 py-2">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-success bg-opacity-10 rounded-circle p-1 me-3">
                                                <Brain size={16} className="text-success" />
                                            </div>
                                            <div className="flex-grow-1">
                                                <small className="fw-semibold">Fuzzy Logic Analysis Complete</small>
                                                <div><small className="text-muted">Financial data processed using advanced algorithms • 1 day ago</small></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="list-group-item border-0 px-0 py-2">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-success bg-opacity-10 rounded-circle p-1 me-3">
                                                <Zap size={16} className="text-success" />
                                            </div>
                                            <div className="flex-grow-1">
                                                <small className="fw-semibold">Real-Time Prequalification Generated</small>
                                                <div><small className="text-muted">Instant results provided based on prescriptive analytics • 2 days ago</small></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="list-group-item border-0 px-0 py-2">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-primary bg-opacity-10 rounded-circle p-1 me-3">
                                                <Settings size={16} className="text-primary" />
                                            </div>
                                            <div className="flex-grow-1">
                                                <small className="fw-semibold">System Usability Validated</small>
                                                <div><small className="text-muted">Application interface tested and optimized for user experience • 3 days ago</small></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <User size={24} className="text-secondary me-2" />
                                    <h5 className="fw-bold mb-0">Applicant Info</h5>
                                </div>
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <small className="text-muted">Student ID</small>
                                        <small className="fw-semibold">E25-00123</small>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <small className="text-muted">Name</small>
                                        <small className="fw-semibold">Cyanne Vega</small>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <small className="text-muted">Course</small>
                                        <small className="fw-semibold">BSIT, 3rd Year</small>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <small className="text-muted">Application Date</small>
                                        <small className="fw-semibold">June 10, 2025</small>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">System Version</small>
                                        <small className="fw-semibold text-primary">iScholar v2.0</small>
                                    </div>
                                </div>
                                <button className="btn btn-outline-secondary btn-sm w-100">
                                    View Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return hasApplication ? <AppliedView /> : <NotAppliedView />;
};

export default Home;