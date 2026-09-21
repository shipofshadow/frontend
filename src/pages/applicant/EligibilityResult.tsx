import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Award,
    CheckCircle,
    AlertCircle,
    FileText,
    ArrowRight,
    Printer,
    RefreshCw,
    TrendingUp,
    DollarSign,
    BookOpen,
    Users,
    Sparkles,
    GraduationCap,
    Clock,
    ChevronRight,
    Info,
    Calendar,
    Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getScholarshipSummary, getRecommendations } from '../../services/scholarshipService';
import type { ApplicationStatus } from '../../interfaces/application_status';
import { hasApplied } from '../../services/applicationService';

interface Recommendation {
    scholarship_id: number;
    name: string;
    description: string;
    amount: string | number;
    score: number;
    classification: string;
    reasons?: string[];
    eligibility_reasons?: string[];
}

interface EvaluationData {
    id?: number;
    gwa?: number;
    income?: number;
    total_units?: number;
    score?: number;
    classification?: string;
    remarks?: string;
}

interface ApplicationData {
    id: number;
    status: string;
    submitted_at: string | null;
    remarks: string | null;
    semester?: string;
    academic_year?: string;
}

const EligibilityResult: React.FC = () => {
    const { token, user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [application, setApplication] = useState<ApplicationData | null>(null);
    const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isPrequalifyFallback, setIsPrequalifyFallback] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);

    const loadAssessmentData = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Check general application status
            const appStatus = await hasApplied(token).catch(() => null);
            setApplicationStatus(appStatus);

            // Fetch comprehensive scholarship summary
            const summary = await getScholarshipSummary(token);
            const apps = summary?.applications ?? [];
            const activeApp = apps.find((a: { application?: { status?: string } }) => a.application?.status !== 'archived') ?? apps[0];

            if (activeApp && activeApp.application) {
                setApplication(activeApp.application);

                if (activeApp.evaluation) {
                    setEvaluation(activeApp.evaluation);
                }

                // Fetch recommendations for this application
                try {
                    const recs = await getRecommendations(activeApp.application.id, token);
                    setRecommendations(Array.isArray(recs) ? recs : []);
                } catch {
                    if (Array.isArray(activeApp.recommended_scholarships)) {
                        setRecommendations(activeApp.recommended_scholarships);
                    }
                }
            } else {
                // Check if user has a stored prequalification assessment
                const cachedPrequalify = sessionStorage.getItem('ischolar_prequalify_result') ||
                                         localStorage.getItem('ischolar_prequalify_result');
                if (cachedPrequalify) {
                    try {
                        const parsed = JSON.parse(cachedPrequalify);
                        setIsPrequalifyFallback(true);
                        setEvaluation({
                            score: (parsed.score || 0) / 100,
                            classification: parsed.classification || 'Prequalified',
                            gwa: parsed.gwa,
                            income: parsed.income,
                            total_units: parsed.total_units,
                        });
                        setRecommendations(parsed.recommended_scholarships || []);
                    } catch {
                        // ignore parse errors
                    }
                }
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to load eligibility assessment.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadAssessmentData();
    }, [loadAssessmentData]);

    // Format score into percentage (0 - 100)
    const rawScore = evaluation?.score !== undefined ? Number(evaluation.score) : null;
    const scorePercent = rawScore !== null
        ? rawScore > 1
            ? Math.min(100, Math.round(rawScore))
            : Math.min(100, Math.round(rawScore * 100))
        : null;

    const getScoreTier = (score: number | null) => {
        if (score === null) return { color: '#6c757d', label: 'Pending Evaluation', bg: 'bg-secondary-subtle text-secondary', border: 'border-secondary' };
        if (score >= 80) return { color: '#198754', label: 'Highly Eligible', bg: 'bg-success-subtle text-success', border: 'border-success' };
        if (score >= 60) return { color: '#ffc107', label: 'Moderately Eligible', bg: 'bg-warning-subtle text-warning-emphasis', border: 'border-warning' };
        if (score >= 40) return { color: '#0d6efd', label: 'Potentially Eligible', bg: 'bg-primary-subtle text-primary', border: 'border-primary' };
        return { color: '#dc3545', label: 'Needs Review', bg: 'bg-danger-subtle text-danger', border: 'border-danger' };
    };

    const tier = getScoreTier(scorePercent);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading assessment...</span>
                </div>
                <h5 className="mt-3 text-muted fw-semibold">Analyzing your eligibility assessment...</h5>
                <p className="small text-muted">Calculating fuzzy evaluation indexes, academic standing, and matched programs.</p>
            </div>
        );
    }

    return (
        <div className="container-xl py-4 assessment-page">
            {/* Action Bar (hidden in print) */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 d-print-none">
                <div className="d-flex align-items-center gap-2">
                    <Link to="/applicant/home" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 rounded-pill px-3">
                        <Compass size={15} />
                        Dashboard
                    </Link>
                    <span className="text-muted">/</span>
                    <span className="fw-semibold text-dark small">Eligibility Assessment</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <button onClick={loadAssessmentData} className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1">
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                    <button onClick={handlePrint} className="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1">
                        <Printer size={14} />
                        Print / Save PDF
                    </button>
                    <Link to="/applicant/prequalify" className="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1">
                        <Sparkles size={14} />
                        Recalculate
                    </Link>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger rounded-4 border-0 shadow-sm mb-4 d-flex align-items-center gap-2">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <div className="flex-grow-1">{error}</div>
                    <button onClick={loadAssessmentData} className="btn btn-sm btn-outline-danger">Try Again</button>
                </div>
            )}

            {/* Assessment Hero Card */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <div className="card-header bg-white border-bottom border-light p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-4">
                            <GraduationCap size={32} />
                        </div>
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                <h4 className="fw-bold text-dark mb-0">Scholarship Eligibility Assessment</h4>
                                <span className={`badge ${tier.bg} border ${tier.border} rounded-pill px-3 py-1`}>
                                    {isPrequalifyFallback ? 'Preliminary Assessment' : tier.label}
                                </span>
                            </div>
                            <p className="text-muted small mb-0">
                                {isPrequalifyFallback
                                    ? 'Based on your prequalification data. Submit an official application for final institutional verification.'
                                    : `Official Institutional Evaluation · Evaluated for ${application?.semester || 'Current Semester'} ${application?.academic_year || ''}`}
                            </p>
                        </div>
                    </div>
                    {application && (
                        <div className="text-end d-none d-md-block">
                            <div className="small text-muted">Application Ref #</div>
                            <div className="fw-bold text-dark">APP-{application.id.toString().padStart(6, '0')}</div>
                            <div className="small text-muted">{application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : 'Draft'}</div>
                        </div>
                    )}
                </div>

                <div className="card-body p-4 p-md-5">
                    <div className="row g-4 align-items-center">
                        {/* Left: Score Gauge */}
                        <div className="col-lg-4 text-center">
                            <div className="position-relative d-inline-flex justify-content-center align-items-center mb-3">
                                {/* Conic Radial Gauge */}
                                <div
                                    style={{
                                        width: '210px',
                                        height: '210px',
                                        borderRadius: '50%',
                                        background: scorePercent !== null
                                            ? `conic-gradient(${tier.color} ${scorePercent * 3.6}deg, #e9ecef 0deg)`
                                            : '#e9ecef',
                                        position: 'relative',
                                        boxShadow: '0 12px 28px -8px rgba(0,0,0,0.12)',
                                        transition: 'background 0.8s ease'
                                    }}
                                />
                                {/* Inner Mask */}
                                <div
                                    className="bg-white rounded-circle position-absolute d-flex flex-column align-items-center justify-content-center shadow-xs"
                                    style={{ width: '170px', height: '170px' }}
                                >
                                    {scorePercent !== null ? (
                                        <>
                                            <span className="display-4 fw-bold mb-0 lh-1" style={{ color: tier.color }}>
                                                {scorePercent}%
                                            </span>
                                            <span className="text-muted fw-bold text-uppercase mt-1" style={{ fontSize: '0.68rem', letterSpacing: '1px' }}>
                                                Qualification
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-muted fw-bold small">Pending</span>
                                    )}
                                </div>
                            </div>

                            <h5 className="fw-bold mb-1" style={{ color: tier.color }}>
                                {evaluation?.classification || tier.label}
                            </h5>
                            <p className="text-muted small mx-auto" style={{ maxWidth: '280px' }}>
                                {scorePercent !== null && scorePercent >= 80
                                    ? 'High priority candidate with strong academic standing and verified need.'
                                    : scorePercent !== null && scorePercent >= 60
                                    ? 'Qualified applicant meeting essential academic and economic criteria.'
                                    : 'Review criteria requirements below to maximize scholarship opportunities.'}
                            </p>
                        </div>

                        {/* Right: Key Evaluation Factors */}
                        <div className="col-lg-8">
                            <div className="row g-3">
                                {/* GWA Index */}
                                <div className="col-sm-6">
                                    <div className="p-3 bg-light rounded-4 border h-100">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="small text-muted fw-semibold">Academic Merit (GWA)</span>
                                            <BookOpen size={18} className="text-primary" />
                                        </div>
                                        <div className="fs-3 fw-bold text-dark">
                                            {evaluation?.gwa ? Number(evaluation.gwa).toFixed(2) : '—'}
                                        </div>
                                        <div className="small text-muted mt-1 d-flex align-items-center gap-1">
                                            {evaluation?.gwa && evaluation.gwa <= 2.0 ? (
                                                <span className="text-success fw-medium"><CheckCircle size={14} className="inline me-1" />Meets honors threshold</span>
                                            ) : (
                                                <span>General Weighted Average</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Economic Need Index */}
                                <div className="col-sm-6">
                                    <div className="p-3 bg-light rounded-4 border h-100">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="small text-muted fw-semibold">Monthly Household Income</span>
                                            <DollarSign size={18} className="text-success" />
                                        </div>
                                        <div className="fs-3 fw-bold text-dark">
                                            {evaluation?.income !== undefined ? `₱${Number(evaluation.income).toLocaleString()}` : '—'}
                                        </div>
                                        <div className="small text-muted mt-1">
                                            <span>Socioeconomic bracket assessment</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Academic Standing */}
                                <div className="col-sm-6">
                                    <div className="p-3 bg-light rounded-4 border h-100">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="small text-muted fw-semibold">Academic Standing & Units</span>
                                            <TrendingUp size={18} className="text-info" />
                                        </div>
                                        <div className="fs-5 fw-bold text-dark text-truncate">
                                            {user?.profile?.student_id ? `Student ID: ${user.profile.student_id}` : 'Enrolled Student'}
                                        </div>
                                        <div className="small text-muted mt-1">
                                            {evaluation?.total_units ? `${evaluation.total_units} units registered` : 'Active academic term'}
                                        </div>
                                    </div>
                                </div>

                                {/* Priority & Affirmative Action */}
                                <div className="col-sm-6">
                                    <div className="p-3 bg-light rounded-4 border h-100">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="small text-muted fw-semibold">Priority & Demographics</span>
                                            <Users size={18} className="text-warning" />
                                        </div>
                                        <div className="d-flex flex-wrap gap-1 mt-1">
                                            {Boolean(user?.profile?.is_4ps_member) && (
                                                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">4Ps Beneficiary</span>
                                            )}
                                            {Boolean(user?.profile?.ip_affiliation) && (
                                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">Indigenous Peoples</span>
                                            )}
                                            {user?.profile?.siblings_studying && Number(user.profile.siblings_studying) > 0 ? (
                                                <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill">
                                                    {user.profile.siblings_studying} Siblings Studying
                                                </span>
                                            ) : null}
                                            {user?.profile?.household_number && Number(user.profile.household_number) > 0 ? (
                                                <span className="badge bg-info-subtle text-info border border-info-subtle rounded-pill">
                                                    {user.profile.household_number} Household Members
                                                </span>
                                            ) : null}
                                            {!user?.profile?.is_4ps_member && !user?.profile?.ip_affiliation && !user?.profile?.siblings_studying && (
                                                <span className="text-muted small">Standard Institutional Category</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Matched Scholarships Section */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-header bg-white border-bottom border-light p-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                        <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                            <Award className="text-warning" size={22} />
                            Recommended Scholarship Matches
                        </h5>
                        <p className="text-muted small mb-0">Programs you meet eligibility rules for based on your evaluation score and criteria.</p>
                    </div>
                    <span className="badge bg-primary rounded-pill px-3 py-2">
                        {recommendations.length} Program{recommendations.length !== 1 ? 's' : ''} Available
                    </span>
                </div>

                <div className="card-body p-4">
                    {recommendations.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <Award size={48} className="text-muted opacity-50 mb-3" />
                            <h6 className="fw-bold text-dark">No specific scholarship matches found yet</h6>
                            <p className="small mb-3">
                                You can still explore general institutional grants or run a preliminary prequalification with updated grades.
                            </p>
                            <div className="d-flex justify-content-center gap-2">
                                <Link to="/applicant/prequalify" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                                    Prequalify Again
                                </Link>
                                <Link to="/scholarships" className="btn btn-primary btn-sm rounded-pill px-3">
                                    Browse All Scholarships
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="row g-3">
                            {recommendations.map((rec) => {
                                const amountStr = typeof rec.amount === 'number'
                                    ? `₱${rec.amount.toLocaleString()}`
                                    : rec.amount
                                    ? `₱${Number(rec.amount).toLocaleString()}`
                                    : 'Institutional Grant';

                                const reasons = rec.reasons || rec.eligibility_reasons || [];

                                return (
                                    <div key={rec.scholarship_id} className="col-lg-6">
                                        <div className="card h-100 border border-light rounded-4 shadow-xs p-4 d-flex flex-column transition-hover">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h6 className="fw-bold text-dark mb-0 flex-grow-1 pe-2">{rec.name}</h6>
                                                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1 small">
                                                    {Math.round(rec.score)}% Match
                                                </span>
                                            </div>

                                            <div className="fs-5 fw-bold text-success mb-2">{amountStr}</div>
                                            <p className="text-muted small flex-grow-1 mb-3">{rec.description}</p>

                                            {reasons.length > 0 && (
                                                <div className="mb-3 pt-2 border-top">
                                                    <div className="small fw-semibold text-muted mb-1">Eligibility Criteria Met:</div>
                                                    <ul className="list-unstyled mb-0 small text-muted">
                                                        {reasons.slice(0, 3).map((r, i) => (
                                                            <li key={i} className="d-flex align-items-center gap-1 mb-1">
                                                                <CheckCircle size={14} className="text-success flex-shrink-0" />
                                                                <span>{r}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="mt-auto pt-2 d-flex gap-2">
                                                <Link
                                                    to="/applicant/scholarship-recommendations"
                                                    className="btn btn-outline-primary btn-sm rounded-pill w-100 d-flex align-items-center justify-content-center gap-1 fw-semibold"
                                                >
                                                    Select This Scholarship
                                                    <ChevronRight size={16} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Application Roadmap & Next Steps */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-header bg-white border-bottom border-light p-4">
                    <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                        <Calendar className="text-primary" size={20} />
                        Scholarship Application Roadmap
                    </h5>
                    <p className="text-muted small mb-0">Follow these milestones to complete your scholarship awarding.</p>
                </div>
                <div className="card-body p-4">
                    <div className="row g-3 text-center">
                        <div className="col-6 col-md-3">
                            <div className="p-3 bg-success bg-opacity-10 rounded-4 h-100 border border-success-subtle">
                                <div className="badge bg-success rounded-circle p-2 mb-2">
                                    <CheckCircle size={20} className="text-white" />
                                </div>
                                <h6 className="fw-bold text-success mb-1">1. Assessment</h6>
                                <small className="text-muted d-block">Eligibility evaluated via fuzzy logic</small>
                            </div>
                        </div>

                        <div className="col-6 col-md-3">
                            <div className={`p-3 ${application ? 'bg-success bg-opacity-10 border border-success-subtle' : 'bg-light border'} rounded-4 h-100`}>
                                <div className={`badge ${application ? 'bg-success' : 'bg-secondary'} rounded-circle p-2 mb-2`}>
                                    <FileText size={20} className="text-white" />
                                </div>
                                <h6 className={`fw-bold ${application ? 'text-success' : 'text-dark'} mb-1`}>2. Application</h6>
                                <small className="text-muted d-block">
                                    {application ? 'Application submitted' : 'Fill details & upload documents'}
                                </small>
                            </div>
                        </div>

                        <div className="col-6 col-md-3">
                            <div className={`p-3 ${application?.status === 'approved' || application?.status === 'evaluated' ? 'bg-primary bg-opacity-10 border border-primary-subtle' : 'bg-light border'} rounded-4 h-100`}>
                                <div className={`badge ${application?.status === 'approved' || application?.status === 'evaluated' ? 'bg-primary' : 'bg-secondary'} rounded-circle p-2 mb-2`}>
                                    <Clock size={20} className="text-white" />
                                </div>
                                <h6 className="fw-bold text-dark mb-1">3. Verification</h6>
                                <small className="text-muted d-block">Admin review of submitted files</small>
                            </div>
                        </div>

                        <div className="col-6 col-md-3">
                            <div className={`p-3 ${application?.status === 'approved' ? 'bg-success bg-opacity-10 border border-success-subtle' : 'bg-light border'} rounded-4 h-100`}>
                                <div className={`badge ${application?.status === 'approved' ? 'bg-success' : 'bg-secondary'} rounded-circle p-2 mb-2`}>
                                    <Award size={20} className="text-white" />
                                </div>
                                <h6 className={`fw-bold ${application?.status === 'approved' ? 'text-success' : 'text-dark'} mb-1`}>4. Award</h6>
                                <small className="text-muted d-block">Grant release & disbursements</small>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        {!applicationStatus?.has_applied ? (
                            <Link to="/applicant/apply" className="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow-sm d-inline-flex align-items-center gap-2">
                                Start Your Official Application Now
                                <ArrowRight size={20} />
                            </Link>
                        ) : (
                            <Link to="/applicant/status" className="btn btn-outline-primary rounded-pill px-4 fw-semibold d-inline-flex align-items-center gap-2">
                                View Application Status & Documents
                                <ArrowRight size={16} />
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Helpful Notice */}
            <div className="alert alert-light border-0 shadow-xs rounded-4 p-4 d-flex align-items-start gap-3">
                <Info size={20} className="text-primary mt-1 flex-shrink-0" />
                <div className="small text-muted">
                    <strong className="text-dark d-block mb-1">About Your Assessment Score</strong>
                    The iScholar system uses a multi-factor fuzzy inference system combining academic merit (GWA), socioeconomic indicators (gross household income), and affirmative priority criteria (e.g. 4Ps membership, IP affiliation, PWD status). While this evaluation indicates high probability of award, final grant approval is subject to manual document validation by the Scholarship Committee.
                </div>
            </div>

            <style>{`
                @media print {
                    .d-print-none { display: none !important; }
                    .assessment-page { padding: 0 !important; }
                    .card { box-shadow: none !important; border: 1px solid #dee2e6 !important; }
                }
                .transition-hover {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .transition-hover:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08) !important;
                }
            `}</style>
        </div>
    );
};

export default EligibilityResult;