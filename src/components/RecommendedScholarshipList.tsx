import React from 'react';
import {
    CheckCircle,
    DollarSign,
    ArrowRight,
    Award,
    Star,
    TrendingUp,
    Zap,
    Lock,
    Loader2
} from "lucide-react";

// 1. Define the type based on your JSON
export type RecommendedScholarship = {
    id: number;
    scholarship_name: string;
    scholarship_description: string;
    grant_amount: number | null;
    score: number;
    classification: string;
    eligibility_reasons: string[];
    recommended_at: string;
};

interface Props {
    scholarships: RecommendedScholarship[];
    onSelect: (id: number) => void;
    currentStatus?: string;      // NEW: To check if locked
    selectedId?: number | null;  // NEW: To highlight selected card
}

const RecommendedScholarshipList: React.FC<Props> = ({
                                                         scholarships,
                                                         onSelect,
                                                         currentStatus,
                                                         selectedId
                                                     }) => {

    // Determine if selection should be disabled
    const isLocked = currentStatus === 'approved' || currentStatus === 'awaiting_approval';

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getScoreConfig = (score: number) => {
        if (score >= 90) return {
            color: "success",
            text: "Excellent Match",
            icon: <Star size={14} className="me-1" fill="currentColor" />
        };
        if (score >= 75) return {
            color: "primary",
            text: "Strong Match",
            icon: <TrendingUp size={14} className="me-1" />
        };
        return {
            color: "warning",
            text: "Good Match",
            icon: <Award size={14} className="me-1" />
        };
    };

    if (!scholarships || scholarships.length === 0) {
        return (
            <div className="container py-4">
                <div className="card border-0 shadow-sm bg-white rounded-4 overflow-hidden">
                    <div className="card-body text-center p-5">
                        <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                            <Star size={40} className="text-muted opacity-50" />
                        </div>
                        <h5 className="fw-bold text-secondary">No Recommendations Yet</h5>
                        <p className="text-muted small mb-0">
                            Update your profile details to unlock scholarship matches.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            {/* Section Header */}
            <div className="d-flex align-items-center justify-content-between mb-4 animate__animated animate__fadeIn">
                <div className="d-flex align-items-center">
                    <div className="bg-primary-subtle p-2 rounded-3 me-3 text-primary">
                        <Zap size={24} fill="currentColor" className="opacity-75" />
                    </div>
                    <div>
                        <h4 className="fw-bold mb-0 text-dark">Top Picks for You</h4>
                        <p className="text-muted small mb-0">
                            Curated based on your academic performance
                        </p>
                    </div>
                </div>
                <span className="badge bg-light text-secondary border rounded-pill px-3 py-2">
                    {scholarships.length} Available
                </span>
            </div>

            <div className="row g-4">
                {scholarships.map((item, index) => {
                    const scoreConfig = getScoreConfig(item.score);
                    // Check if this specific card is the selected one
                    const isSelected = selectedId === item.id;
                    // Check if other cards should be disabled (not selected but UI is locked)
                    const isDisabled = isLocked && !isSelected;

                    return (
                        <div
                            key={item.id}
                            className="col-lg-6 col-xl-4 animate__animated animate__fadeInUp"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className={`card h-100 border-0 shadow-sm rounded-4 overflow-hidden transition-all group 
                                ${isSelected ? 'ring-2 ring-primary bg-primary-subtle' : ''}
                                ${isDisabled ? 'opacity-50 grayscale' : 'hover-lift'}
                            `}>
                                {/* Color accent bar at top */}
                                <div className={`h-1 w-100 bg-${scoreConfig.color}`} style={{ height: '4px' }}></div>

                                <div className="card-body p-4 d-flex flex-column">
                                    {/* Top Row: Classification Badge & Score Label */}
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className={`badge bg-${scoreConfig.color}-subtle text-${scoreConfig.color}-emphasis border border-${scoreConfig.color}-subtle rounded-pill px-3 py-1 d-flex align-items-center small`}>
                                            {scoreConfig.icon}
                                            {scoreConfig.text}
                                        </span>
                                        {isSelected && (
                                            <span className="badge bg-primary text-white rounded-pill animate__animated animate__pulse">
                                                Selected
                                            </span>
                                        )}
                                    </div>

                                    {/* Scholarship Name */}
                                    <h5 className="card-title fw-bold text-dark mb-3 pe-2">
                                        {item.scholarship_name}
                                    </h5>

                                    {/* Financial Highlight Box */}
                                    <div className="bg-white rounded-3 p-3 mb-4 border border-light-subtle d-flex align-items-center justify-content-between">
                                        <div>
                                            <span className="d-block text-muted small text-uppercase fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                                                Grant Amount
                                            </span>
                                            {item.grant_amount ? (
                                                <div className="d-flex align-items-center text-dark fw-bolder h5 mb-0">
                                                    {formatCurrency(item.grant_amount)}
                                                </div>
                                            ) : (
                                                <span className="text-dark fw-medium small">Variable / TBD</span>
                                            )}
                                        </div>
                                        <div className={`bg-${scoreConfig.color} text-white rounded-circle p-2 d-flex align-items-center justify-content-center`} style={{ width: '40px', height: '40px' }}>
                                            <DollarSign size={20} />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="card-text text-secondary small mb-4 flex-grow-1" style={{ lineHeight: '1.6' }}>
                                        {item.scholarship_description}
                                    </p>

                                    {/* Match Score Progress Bar */}
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between align-items-end mb-1">
                                            <span className="small fw-bold text-muted">Eligibility Score</span>
                                            <span className={`small fw-bold text-${scoreConfig.color}`}>
                                                {item.score.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="progress" style={{ height: '6px' }}>
                                            <div
                                                className={`progress-bar bg-${scoreConfig.color}`}
                                                role="progressbar"
                                                style={{ width: `${item.score}%`, borderRadius: '10px' }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Action Button Logic */}
                                    <div className="mt-auto">
                                        {isSelected ? (
                                            <button disabled className="btn btn-primary w-100 py-2 rounded-pill fw-bold d-flex align-items-center justify-content-center">
                                                {currentStatus === 'approved' ? (
                                                    <> <CheckCircle size={18} className="me-2" /> Approved </>
                                                ) : (
                                                    <> <Loader2 size={18} className="me-2 animate-spin" /> Pending Approval </>
                                                )}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => !isDisabled && onSelect(item.id)}
                                                disabled={isDisabled || isLocked}
                                                className={`btn w-100 py-2 fw-medium rounded-pill d-flex align-items-center justify-content-center 
                                                    ${isDisabled ? 'btn-light text-muted' : 'btn-outline-primary hover-bg-primary'}`}
                                            >
                                                {isDisabled ? (
                                                    <> <Lock size={16} className="me-2" /> Unavailable </>
                                                ) : (
                                                    <>
                                                        View Details & Apply
                                                        <ArrowRight size={16} className="ms-2" />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecommendedScholarshipList;