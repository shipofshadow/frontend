import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config.ts";
import { Award, Target, TrendingUp, CheckCircle, ArrowLeft, ExternalLink, Users, GraduationCap, Briefcase, MapPin, Calendar } from 'lucide-react';
import { useAuth } from "../context/AuthContext.tsx";

interface ScholarshipRules {
    min_gwa?: number | null;
    max_gwa?: number | null;
    min_income?: number | null;
    max_income?: number | null;
    min_units_enrolled?: number | null;
    max_units_enrolled?: number | null;
    preferred_campus_ids?: number[];
    preferred_course_ids?: number[];
    preferred_department_ids?: number[];
    preferred_year_levels?: string[];
    priorities?: {
        must_be_ofw?: boolean;
        prefer_pwd?: boolean;
        require_ip?: boolean;
        prefer_farmers_child?: boolean;
    };
}

interface Scholarship {
    id: number;
    name: string;
    description: string;
    grant_amount: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    rules: ScholarshipRules;
}

const ScholarshipView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [scholarship, setScholarship] = useState<Scholarship | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchScholarship = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/scholarships/${id}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error("Scholarship not found");
                    }
                    throw new Error("Failed to fetch scholarship");
                }
                const data = await res.json();
                setScholarship(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchScholarship();
        }
    }, [id]);

    const handleApplyNow = () => {
        if (isAuthenticated) {
            navigate('/applicant/apply');
        } else {
            navigate('/login', { state: { returnTo: '/applicant/apply' } });
        }
    };

    const SkeletonLoader = () => (
        <section className="py-5" style={{ backgroundColor: '#f8f9fe', minHeight: '100vh' }}>
            <div className="container py-5">
                <div className="mb-4">
                    <span className="placeholder col-2 rounded-3" style={{ height: '40px' }}></span>
                </div>
                <div className="row">
                    <div className="col-lg-8">
                        <div className="card border-0 rounded-4 shadow-sm">
                            <div className="card-body p-5 placeholder-glow">
                                <span className="placeholder col-6 mb-3 d-block" style={{ height: '32px' }}></span>
                                <span className="placeholder col-8 mb-2 d-block" style={{ height: '16px' }}></span>
                                <span className="placeholder col-10 mb-2 d-block" style={{ height: '16px' }}></span>
                                <span className="placeholder col-7 mb-4 d-block" style={{ height: '16px' }}></span>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="card border-0 rounded-4 shadow-sm">
                            <div className="card-body p-4 placeholder-glow">
                                <span className="placeholder col-4 mb-2 d-block" style={{ height: '16px' }}></span>
                                <span className="placeholder col-8 mb-3 d-block" style={{ height: '32px' }}></span>
                                <span className="placeholder col-12 d-block" style={{ height: '48px' }}></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );

    if (loading) {
        return <SkeletonLoader />;
    }

    if (error || !scholarship) {
        return (
            <section className="py-5 d-flex align-items-center" style={{ backgroundColor: '#f8f9fe', minHeight: '100vh' }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6">
                            <div className="card border-0 rounded-4 shadow-sm text-center">
                                <div className="card-body p-5">
                                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                                         style={{ width: '100px', height: '100px', backgroundColor: '#fff3cd' }}>
                                        <span style={{ fontSize: '3rem' }}>⚠️</span>
                                    </div>
                                    <h3 className="fw-bold mb-3">{error || "Scholarship Not Found"}</h3>
                                    <p className="text-muted mb-4">The scholarship you're looking for doesn't exist or has been removed.</p>
                                    <Link
                                        to="/scholarships"
                                        className="btn btn-lg px-5 py-3 rounded-pill shadow-sm"
                                        style={{ backgroundColor: '#5e72e4', color: 'white', fontWeight: 600, border: 'none' }}
                                    >
                                        <ArrowLeft size={18} className="me-2" />
                                        Back to Scholarships
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const grant = parseFloat(scholarship.grant_amount || "0");
    const priorities = scholarship.rules?.priorities;
    const hasPriorities = priorities && Object.values(priorities).some(v => v);

    return (
        <section className="py-5" style={{ backgroundColor: '#f8f9fe', minHeight: '100vh' }}>
            <div className="container py-4">
                {/* Back Button */}
                <div className="mb-4">
                    <Link
                        to="/scholarships"
                        className="btn btn-outline-secondary rounded-pill px-4"
                        style={{ fontWeight: 600 }}
                    >
                        <ArrowLeft size={18} className="me-2" />
                        Back to Scholarships
                    </Link>
                </div>

                <div className="row g-4">
                    {/* Main Content */}
                    <div className="col-lg-8">
                        <div className="card border-0 rounded-4 shadow-sm">
                            <div className="card-body p-4 p-md-5">
                                {/* Header */}
                                <div className="d-flex align-items-start mb-4">
                                    <div className="rounded-3 d-inline-flex align-items-center justify-content-center me-3"
                                         style={{ width: '72px', height: '72px', backgroundColor: '#e8eaf6', flexShrink: 0 }}>
                                        <Award style={{ color: '#5e72e4' }} size={36} />
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                                            <h1 className="h3 fw-bold mb-0">{scholarship.name}</h1>
                                            <span className={`badge rounded-pill px-3 py-2 ${scholarship.is_active ? 'bg-success' : 'bg-secondary'}`}
                                                  style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                                                {scholarship.is_active ? (
                                                    <>
                                                        <CheckCircle size={14} className="me-1" style={{ marginTop: '-2px' }} />
                                                        Open for Applications
                                                    </>
                                                ) : (
                                                    <>Closed</>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* About Section */}
                                <div className="mb-5">
                                    <h5 className="fw-bold mb-3" style={{ color: '#5e72e4' }}>
                                        <GraduationCap size={20} className="me-2" />
                                        About This Scholarship
                                    </h5>
                                    <p className="text-muted mb-0" style={{ fontSize: '1rem', lineHeight: '1.8' }}>
                                        {scholarship.description}
                                    </p>
                                </div>

                                {/* Eligibility Requirements */}
                                <div className="mb-5">
                                    <h5 className="fw-bold mb-3" style={{ color: '#5e72e4' }}>
                                        <Target size={20} className="me-2" />
                                        Eligibility Requirements
                                    </h5>
                                    <div className="row g-3">
                                        {/* GWA Requirement */}
                                        {(scholarship.rules?.min_gwa !== null && scholarship.rules?.min_gwa !== undefined) && (
                                            <div className="col-md-6">
                                                <div className="d-flex align-items-center p-3 rounded-3" style={{ backgroundColor: '#e8eaf6' }}>
                                                    <GraduationCap style={{ color: '#5e72e4', flexShrink: 0 }} size={24} className="me-3" />
                                                    <div>
                                                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>GWA Requirement</small>
                                                        <span className="fw-bold">
                                                            {scholarship.rules.min_gwa} – {scholarship.rules.max_gwa ?? "No limit"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Income Requirement */}
                                        {(scholarship.rules?.max_income !== null && scholarship.rules?.max_income !== undefined) && (
                                            <div className="col-md-6">
                                                <div className="d-flex align-items-center p-3 rounded-3" style={{ backgroundColor: '#d1ecf1' }}>
                                                    <TrendingUp style={{ color: '#11cdef', flexShrink: 0 }} size={24} className="me-3" />
                                                    <div>
                                                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Maximum Family Income</small>
                                                        <span className="fw-bold">
                                                            ₱{scholarship.rules.max_income.toLocaleString()}
                                                            {scholarship.rules.min_income && (
                                                                <small className="text-muted"> (Min: ₱{scholarship.rules.min_income.toLocaleString()})</small>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Units Requirement */}
                                        {(scholarship.rules?.min_units_enrolled !== null && scholarship.rules?.min_units_enrolled !== undefined) && (
                                            <div className="col-md-6">
                                                <div className="d-flex align-items-center p-3 rounded-3" style={{ backgroundColor: '#fff3cd' }}>
                                                    <Calendar style={{ color: '#856404', flexShrink: 0 }} size={24} className="me-3" />
                                                    <div>
                                                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Units Enrolled</small>
                                                        <span className="fw-bold">
                                                            {scholarship.rules.min_units_enrolled} – {scholarship.rules.max_units_enrolled ?? "No limit"} units
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Year Level Preference */}
                                        {scholarship.rules?.preferred_year_levels && scholarship.rules.preferred_year_levels.length > 0 && (
                                            <div className="col-md-6">
                                                <div className="d-flex align-items-center p-3 rounded-3" style={{ backgroundColor: '#f8d7da' }}>
                                                    <Users style={{ color: '#721c24', flexShrink: 0 }} size={24} className="me-3" />
                                                    <div>
                                                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Preferred Year Levels</small>
                                                        <span className="fw-bold">
                                                            {scholarship.rules.preferred_year_levels.join(', ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Priority Groups */}
                                {hasPriorities && (
                                    <div className="mb-5">
                                        <h5 className="fw-bold mb-3" style={{ color: '#5e72e4' }}>
                                            <Users size={20} className="me-2" />
                                            Priority Applicants
                                        </h5>
                                        <p className="text-muted mb-3">
                                            This scholarship gives priority to applicants from the following groups:
                                        </p>
                                        <div className="d-flex flex-wrap gap-2">
                                            {priorities?.must_be_ofw && (
                                                <span className="badge border-0 px-4 py-3" style={{ backgroundColor: '#fff3cd', color: '#856404', fontSize: '0.875rem', fontWeight: 600 }}>
                                                    🌍 OFW Dependent
                                                </span>
                                            )}
                                            {priorities?.prefer_pwd && (
                                                <span className="badge border-0 px-4 py-3" style={{ backgroundColor: '#d1ecf1', color: '#0c5460', fontSize: '0.875rem', fontWeight: 600 }}>
                                                    ♿ PWD Priority
                                                </span>
                                            )}
                                            {priorities?.require_ip && (
                                                <span className="badge border-0 px-4 py-3" style={{ backgroundColor: '#f8d7da', color: '#721c24', fontSize: '0.875rem', fontWeight: 600 }}>
                                                    🪶 Indigenous People
                                                </span>
                                            )}
                                            {priorities?.prefer_farmers_child && (
                                                <span className="badge border-0 px-4 py-3" style={{ backgroundColor: '#d4edda', color: '#155724', fontSize: '0.875rem', fontWeight: 600 }}>
                                                    🌾 Farmer's Child
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Additional Info */}
                                <div className="p-4 rounded-3" style={{ backgroundColor: '#f8f9fe' }}>
                                    <h6 className="fw-bold mb-3">
                                        <Briefcase size={18} className="me-2" />
                                        How to Apply
                                    </h6>
                                    <ol className="mb-0 ps-3">
                                        <li className="mb-2">Create an account or log in to iScholar</li>
                                        <li className="mb-2">Complete your profile with accurate information</li>
                                        <li className="mb-2">Submit your scholarship application with required documents</li>
                                        <li className="mb-2">Wait for evaluation and notification of results</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        {/* Grant Amount Card */}
                        <div className="card border-0 rounded-4 shadow-sm mb-4 sticky-top" style={{ top: '20px' }}>
                            <div className="card-body p-4">
                                <div className="text-center mb-4">
                                    <small className="text-muted d-block mb-2" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                                        Grant Amount
                                    </small>
                                    <div className="fw-bold display-5" style={{ color: '#2dce89' }}>
                                        ₱{Number.isFinite(grant) ? grant.toLocaleString() : "—"}
                                    </div>
                                </div>

                                <hr />

                                {/* Status */}
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <span className="text-muted">Status</span>
                                    <span className={`badge rounded-pill px-3 py-2 ${scholarship.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                        {scholarship.is_active ? 'Open' : 'Closed'}
                                    </span>
                                </div>

                                {/* Apply Button */}
                                {scholarship.is_active ? (
                                    <button
                                        onClick={handleApplyNow}
                                        className="btn btn-lg w-100 rounded-pill shadow-sm"
                                        style={{ backgroundColor: '#5e72e4', color: 'white', fontWeight: 600, border: 'none' }}
                                    >
                                        <ExternalLink size={18} className="me-2" />
                                        Apply Now
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-secondary btn-lg w-100 rounded-pill"
                                        disabled
                                    >
                                        Applications Closed
                                    </button>
                                )}

                                {!isAuthenticated && scholarship.is_active && (
                                    <p className="text-center text-muted small mt-3 mb-0">
                                        <MapPin size={14} className="me-1" />
                                        You'll need to log in or create an account to apply
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Quick Facts Card */}
                        <div className="card border-0 rounded-4 shadow-sm">
                            <div className="card-body p-4">
                                <h6 className="fw-bold mb-3">Quick Facts</h6>
                                <ul className="list-unstyled mb-0">
                                    <li className="d-flex align-items-center mb-2">
                                        <CheckCircle size={16} className="text-success me-2" />
                                        <small>Free application – no fees required</small>
                                    </li>
                                    <li className="d-flex align-items-center mb-2">
                                        <CheckCircle size={16} className="text-success me-2" />
                                        <small>AI-powered eligibility matching</small>
                                    </li>
                                    <li className="d-flex align-items-center mb-2">
                                        <CheckCircle size={16} className="text-success me-2" />
                                        <small>Track your application status online</small>
                                    </li>
                                    <li className="d-flex align-items-center">
                                        <CheckCircle size={16} className="text-success me-2" />
                                        <small>Get notified of results via email</small>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .sticky-top {
                    z-index: 1000;
                }
                
                @media (max-width: 991px) {
                    .sticky-top {
                        position: relative !important;
                        top: 0 !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default ScholarshipView;
