import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config.ts";

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
            <div className="card h-100 shadow-sm">
                <div className="card-body">
                    <div className="placeholder-glow">
                        <span className="placeholder col-3 bg-success rounded-pill mb-3"></span>
                        <span className="placeholder col-9 mb-3 d-block"></span>
                        <span className="placeholder col-12 mb-2 d-block"></span>
                        <span className="placeholder col-8 mb-3 d-block"></span>
                        <span className="placeholder col-5 me-2 rounded-pill"></span>
                        <span className="placeholder col-6 rounded-pill"></span>
                    </div>
                </div>
                <div className="card-footer bg-light">
                    <span className="placeholder col-4"></span>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <section className="py-5 bg-light">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <span className="badge bg-primary-subtle text-primary px-3 py-2 mb-3">
                            ✨ Opportunities Await
                        </span>
                        <h2 className="fw-bold display-5 mb-3">Available Scholarships</h2>
                        <p className="text-muted fs-5">Loading tailored opportunities for your future…</p>
                    </div>
                    <div className="row">
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
            <section className="py-5 bg-light min-vh-100 d-flex align-items-center">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6 text-center">
                            <div className="display-1 mb-4">⚠️</div>
                            <h3 className="fw-bold mb-3">Unable to Load Scholarships</h3>
                            <p className="text-muted mb-4">{error}</p>
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={() => location.reload()}
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-5 bg-light min-vh-100">
            <div className="container py-5">
                <div className="text-center mt-5">
                    <h2 className="fw-bold display-5 mb-3">Available Scholarships</h2>
                    <p className="text-muted fs-5 mx-auto" style={{ maxWidth: '600px' }}>
                        Explore opportunities tailored to your academic excellence, financial needs, and unique background
                    </p>
                </div>

                <div className="row g-4">
                    {scholarships.map((scholarship) => {
                        const grant = parseFloat(scholarship.grant_amount || "0");
                        const priorities = scholarship.rules?.priorities;
                        const hasPriorities = priorities && Object.values(priorities).some(v => v);

                        return (
                            <div className="col-md-6 col-lg-4" key={scholarship.id}>
                                <div className="card h-100 shadow-sm border-0 hover-card">
                                    <div className="card-body d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <h3 className="card-title h5 fw-bold mb-0 flex-grow-1 pe-2">
                                                {scholarship.name}
                                            </h3>
                                            <span className={`badge ${scholarship.is_active ? 'bg-success' : 'bg-secondary'} rounded-pill`}>
                                                {scholarship.is_active ? 'Open' : 'Closed'}
                                            </span>
                                        </div>

                                        <p className="card-text text-muted mb-3 flex-grow-1">
                                            {scholarship.description}
                                        </p>

                                        {(scholarship.rules?.min_gwa !== null && scholarship.rules?.min_gwa !== undefined) && (
                                            <div className="alert alert-primary py-2 px-3 mb-2 d-flex align-items-center">
                                                <span className="me-2">🎯</span>
                                                <small>
                                                    <strong>GWA:</strong> {scholarship.rules.min_gwa} – {scholarship.rules.max_gwa ?? "No limit"}
                                                </small>
                                            </div>
                                        )}

                                        {(scholarship.rules?.max_income !== null && scholarship.rules?.max_income !== undefined) && (
                                            <div className="alert alert-info py-2 px-3 mb-2 d-flex align-items-center">
                                                <span className="me-2">💵</span>
                                                <small>
                                                    <strong>Max Income:</strong> ₱{scholarship.rules.max_income.toLocaleString()}
                                                </small>
                                            </div>
                                        )}

                                        {hasPriorities && (
                                            <div className="d-flex flex-wrap gap-2 mb-3">
                                                {priorities?.must_be_ofw && (
                                                    <span className="badge bg-light text-dark border">🌍 OFW Dependent</span>
                                                )}
                                                {priorities?.prefer_pwd && (
                                                    <span className="badge bg-light text-dark border">♿ PWD Priority</span>
                                                )}
                                                {priorities?.require_ip && (
                                                    <span className="badge bg-light text-dark border">🪶 Indigenous</span>
                                                )}
                                                {priorities?.prefer_farmers_child && (
                                                    <span className="badge bg-light text-dark border">🌾 Farmer's Child</span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="card-footer bg-success bg-opacity-10 border-0">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <small className="text-muted fw-semibold">GRANT AMOUNT</small>
                                            <span className="fs-5 fw-bold text-success">
                                                ₱{Number.isFinite(grant) ? grant.toLocaleString() : "—"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {scholarships.length === 0 && (
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center py-5">
                                    <div className="display-1 mb-3">🎓</div>
                                    <h3 className="fw-bold mb-2">No Scholarships Available</h3>
                                    <p className="text-muted mb-0">Check back soon for new opportunities</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .hover-card {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                
                .hover-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.15) !important;
                }

                .alert {
                    border: none;
                    border-left: 3px solid currentColor;
                }
            `}</style>
        </section>
    );
};

export default Scholarships;