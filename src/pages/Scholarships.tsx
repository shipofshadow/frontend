import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config.ts";
import { Award, TrendingUp, Users, CheckCircle, Target } from 'lucide-react';
import {useAuth} from "../context/AuthContext.tsx";

interface Scholarship {
    id: number;
    name: string;
    description: string;
    grant_amount: string;
    is_active: boolean;
    rules: {
        min_gwa?: number | null;
        max_gwa?: number | null;
        min_income?: number | null;
        max_income?: number | null;
        priorities?: {
            must_be_ofw?: boolean;
            prefer_pwd?: boolean;
            require_ip?: boolean;
            prefer_farmers_child?: boolean;
        };
    };
}

const Scholarships: React.FC = () => {
    const [scholarships, setScholarships] = useState<Scholarship[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
    const {isAuthenticated} = useAuth();
    useEffect(() => {
        const fetchScholarships = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/scholarships/`);
                if (!res.ok) throw new Error("Failed to fetch scholarships");
                const data = await res.json();
                setScholarships(data);
            } catch {
                setError("Something went wrong");
            } finally {
                setLoading(false);
            }
        };
        fetchScholarships();
    }, []);

    const SkeletonCard = () => (
        <div className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100 border-0 rounded-4 shadow-sm">
                <div className="card-body p-4">
                    <div className="placeholder-glow">
                        <div className="d-flex justify-content-between mb-3">
                            <span className="placeholder col-7 rounded-3" style={{ height: '24px' }}></span>
                            <span className="placeholder col-3 rounded-pill" style={{ height: '24px' }}></span>
                        </div>
                        <span className="placeholder col-12 mb-2 d-block rounded-2" style={{ height: '16px' }}></span>
                        <span className="placeholder col-10 mb-2 d-block rounded-2" style={{ height: '16px' }}></span>
                        <span className="placeholder col-8 mb-4 d-block rounded-2" style={{ height: '16px' }}></span>
                        <div className="d-flex gap-2 mb-3">
                            <span className="placeholder col-5 rounded-3" style={{ height: '36px' }}></span>
                            <span className="placeholder col-6 rounded-3" style={{ height: '36px' }}></span>
                        </div>
                    </div>
                </div>
                <div className="card-footer border-0 p-4" style={{ backgroundColor: '#f8f9fe' }}>
                    <span className="placeholder col-6 rounded-2"></span>
                </div>
            </div>
        </div>
    );

    const filteredScholarships = scholarships.filter(s => {
        if (filter === 'active') return s.is_active;
        if (filter === 'closed') return !s.is_active;
        return true;
    });

    if (loading) {
        return (

            <section className="py-5" style={{ backgroundColor: '#f8f9fe', minHeight: '100vh' }}>
                <div className="container py-5"    style={{
                    zIndex: 2,
                    marginTop: !isAuthenticated ? '5rem' : undefined
                }}>
                    <div className="text-center mb-5">
                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                             style={{ width: '80px', height: '80px', backgroundColor: '#e8eaf6' }}>
                            <Award style={{ color: '#5e72e4' }} size={40} />
                        </div>
                        <h2 className="display-5 fw-bold mb-3">Available Scholarships</h2>
                        <p className="lead text-muted">Loading opportunities for your future...</p>
                    </div>
                    <div className="row g-4">
                        {[...Array(6)].map((_, idx) => (
                            <SkeletonCard key={idx} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
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
                                    <h3 className="fw-bold mb-3">Unable to Load Scholarships</h3>
                                    <p className="text-muted mb-4">{error}</p>
                                    <button
                                        className="btn btn-lg px-5 py-3 rounded-pill shadow-sm"
                                        onClick={() => location.reload()}
                                        style={{ backgroundColor: '#5e72e4', color: 'white', fontWeight: 600, border: 'none' }}
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-5" style={{ backgroundColor: '#f8f9fe', minHeight: '100vh' }}>
            <div className="container py-5">
                {/* Header */}
                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                         style={{ width: '90px', height: '90px', backgroundColor: '#e8eaf6' }}>
                        <Award style={{ color: '#5e72e4' }} size={44} />
                    </div>
                    <h2 className="display-5 fw-bold mb-3">Available Scholarships</h2>
                    <p className="lead text-muted mx-auto" style={{ maxWidth: '700px', fontSize: '1.15rem' }}>
                        Explore opportunities tailored to your academic excellence, financial needs, and unique background
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="d-flex justify-content-center mb-5">
                    <div className="btn-group rounded-pill shadow-sm" role="group" style={{ backgroundColor: 'white', padding: '6px' }}>
                        <button
                            type="button"
                            className={`btn px-4 py-2 rounded-pill ${filter === 'all' ? '' : 'text-muted'}`}
                            onClick={() => setFilter('all')}
                            style={{
                                backgroundColor: filter === 'all' ? '#5e72e4' : 'transparent',
                                color: filter === 'all' ? 'white' : '#6c757d',
                                fontWeight: 600,
                                border: 'none',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            All Programs ({scholarships.length})
                        </button>
                        <button
                            type="button"
                            className={`btn px-4 py-2 rounded-pill ${filter === 'active' ? '' : 'text-muted'}`}
                            onClick={() => setFilter('active')}
                            style={{
                                backgroundColor: filter === 'active' ? '#5e72e4' : 'transparent',
                                color: filter === 'active' ? 'white' : '#6c757d',
                                fontWeight: 600,
                                border: 'none',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Open ({scholarships.filter(s => s.is_active).length})
                        </button>
                        <button
                            type="button"
                            className={`btn px-4 py-2 rounded-pill ${filter === 'closed' ? '' : 'text-muted'}`}
                            onClick={() => setFilter('closed')}
                            style={{
                                backgroundColor: filter === 'closed' ? '#5e72e4' : 'transparent',
                                color: filter === 'closed' ? 'white' : '#6c757d',
                                fontWeight: 600,
                                border: 'none',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Closed ({scholarships.filter(s => !s.is_active).length})
                        </button>
                    </div>
                </div>

                {/* Scholarship Cards */}
                <div className="row g-4">
                    {filteredScholarships.map((scholarship) => {
                        const grant = parseFloat(scholarship.grant_amount || "0");
                        const priorities = scholarship.rules?.priorities;
                        const hasPriorities = priorities && Object.values(priorities).some(v => v);

                        return (
                            <div className="col-md-6 col-lg-4" key={scholarship.id}>
                                <div className="card h-100 border-0 rounded-4 shadow-sm hover-card position-relative overflow-hidden" style={{ backgroundColor: 'white' }}>
                                    {/* Status Badge Ribbon */}
                                    <div className="position-absolute top-0 end-0 m-3">
                                        <span className={`badge rounded-pill px-3 py-2 ${scholarship.is_active ? 'bg-success' : 'bg-secondary'}`}
                                              style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                                            {scholarship.is_active ? (
                                                <>
                                                    <CheckCircle size={14} className="me-1" style={{ marginTop: '-2px' }} />
                                                    Open
                                                </>
                                            ) : (
                                                <>Closed</>
                                            )}
                                        </span>
                                    </div>

                                    <div className="card-body p-4 d-flex flex-column">
                                        {/* Icon */}
                                        <div className="mb-3">
                                            <div className="rounded-3 d-inline-flex align-items-center justify-content-center"
                                                 style={{ width: '56px', height: '56px', backgroundColor: '#e8eaf6' }}>
                                                <Award style={{ color: '#5e72e4' }} size={28} />
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h3 className="card-title h5 fw-bold mb-3 pe-5" style={{ lineHeight: '1.4' }}>
                                            {scholarship.name}
                                        </h3>

                                        {/* Description */}
                                        <p className="card-text text-muted mb-4 flex-grow-1" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                            {scholarship.description}
                                        </p>

                                        {/* Requirements */}
                                        <div className="mb-3">
                                            {(scholarship.rules?.min_gwa !== null && scholarship.rules?.min_gwa !== undefined) && (
                                                <div className="d-flex align-items-center mb-2 p-3 rounded-3" style={{ backgroundColor: '#e8eaf6' }}>
                                                    <Target style={{ color: '#5e72e4', flexShrink: 0 }} size={18} className="me-2" />
                                                    <small style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>
                                                        <strong>GWA Required:</strong> {scholarship.rules.min_gwa} – {scholarship.rules.max_gwa ?? "No limit"}
                                                    </small>
                                                </div>
                                            )}

                                            {(scholarship.rules?.max_income !== null && scholarship.rules?.max_income !== undefined) && (
                                                <div className="d-flex align-items-center p-3 rounded-3" style={{ backgroundColor: '#d1ecf1' }}>
                                                    <TrendingUp style={{ color: '#11cdef', flexShrink: 0 }} size={18} className="me-2" />
                                                    <small style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>
                                                        <strong>Max Income:</strong> ₱{scholarship.rules.max_income.toLocaleString()}
                                                    </small>
                                                </div>
                                            )}
                                        </div>

                                        {/* Priority Tags */}
                                        {hasPriorities && (
                                            <div className="d-flex flex-wrap gap-2 mb-3">
                                                {priorities?.must_be_ofw && (
                                                    <span className="badge border-0 px-3 py-2" style={{ backgroundColor: '#fff3cd', color: '#856404', fontSize: '0.75rem', fontWeight: 600 }}>
                                                        🌍 OFW Dependent
                                                    </span>
                                                )}
                                                {priorities?.prefer_pwd && (
                                                    <span className="badge border-0 px-3 py-2" style={{ backgroundColor: '#d1ecf1', color: '#0c5460', fontSize: '0.75rem', fontWeight: 600 }}>
                                                        ♿ PWD Priority
                                                    </span>
                                                )}
                                                {priorities?.require_ip && (
                                                    <span className="badge border-0 px-3 py-2" style={{ backgroundColor: '#f8d7da', color: '#721c24', fontSize: '0.75rem', fontWeight: 600 }}>
                                                        🪶 Indigenous
                                                    </span>
                                                )}
                                                {priorities?.prefer_farmers_child && (
                                                    <span className="badge border-0 px-3 py-2" style={{ backgroundColor: '#d4edda', color: '#155724', fontSize: '0.75rem', fontWeight: 600 }}>
                                                        🌾 Farmer's Child
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer with Grant Amount */}
                                    <div className="card-footer border-0 p-4" style={{ backgroundColor: '#f8f9fe' }}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted d-block mb-1" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                                    Grant Amount
                                                </small>
                                                <div className="fw-bold h5 mb-0" style={{ color: '#2dce89' }}>
                                                    ₱{Number.isFinite(grant) ? grant.toLocaleString() : "—"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty State */}
                    {filteredScholarships.length === 0 && (
                        <div className="col-12">
                            <div className="card border-0 rounded-4 shadow-sm">
                                <div className="card-body text-center py-5">
                                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                                         style={{ width: '120px', height: '120px', backgroundColor: '#e8eaf6' }}>
                                        <Award style={{ color: '#5e72e4' }} size={60} />
                                    </div>
                                    <h3 className="fw-bold mb-3">No Scholarships Found</h3>
                                    <p className="text-muted mb-4" style={{ fontSize: '1rem' }}>
                                        {filter === 'active' && 'No active scholarships at the moment.'}
                                        {filter === 'closed' && 'No closed scholarships to display.'}
                                        {filter === 'all' && 'Check back soon for new opportunities.'}
                                    </p>
                                    {filter !== 'all' && (
                                        <button
                                            className="btn px-5 py-3 rounded-pill shadow-sm"
                                            onClick={() => setFilter('all')}
                                            style={{ backgroundColor: '#5e72e4', color: 'white', fontWeight: 600, border: 'none' }}
                                        >
                                            View All Scholarships
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Footer */}
                {filteredScholarships.length > 0 && (
                    <div className="row g-4 mt-5">
                        <div className="col-md-4">
                            <div className="card border-0 rounded-4 shadow-sm text-center p-4" style={{ backgroundColor: 'white' }}>
                                <div className="mb-2">
                                    <Award style={{ color: '#5e72e4' }} size={32} />
                                </div>
                                <h3 className="h4 fw-bold mb-1" style={{ color: '#5e72e4' }}>
                                    {filteredScholarships.length}
                                </h3>
                                <p className="text-muted small mb-0" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                    {filter === 'all' ? 'Total Programs' : filter === 'active' ? 'Open Programs' : 'Closed Programs'}
                                </p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 rounded-4 shadow-sm text-center p-4" style={{ backgroundColor: 'white' }}>
                                <div className="mb-2">
                                    <CheckCircle style={{ color: '#2dce89' }} size={32} />
                                </div>
                                <h3 className="h4 fw-bold mb-1" style={{ color: '#2dce89' }}>
                                    {scholarships.filter(s => s.is_active).length}
                                </h3>
                                <p className="text-muted small mb-0" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                    Currently Open
                                </p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 rounded-4 shadow-sm text-center p-4" style={{ backgroundColor: 'white' }}>
                                <div className="mb-2">
                                    <Users style={{ color: '#11cdef' }} size={32} />
                                </div>
                                <h3 className="h4 fw-bold mb-1" style={{ color: '#11cdef' }}>
                                    FREE
                                </h3>
                                <p className="text-muted small mb-0" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                    Application Fee
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .hover-card {
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .hover-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15) !important;
                }

                .btn-group button {
                    cursor: pointer;
                }

                .btn-group button:hover {
                    opacity: 0.9;
                }
            `}</style>
        </section>
    );
};

export default Scholarships;
