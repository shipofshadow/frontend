import  { useState } from 'react';
import { Star, Target, ArrowRight, Eye, Award, TrendingUp, Filter, Clock } from "lucide-react";

interface RecommendedScholarship {
    scholarship_name: string;
    scholarship_description: string;
    grant_amount: number | null;
    score: number; // match %
    total_slots?: number | null;
    filled_slots?: number;
    slots_remaining?: number | null;
}

interface Props {
    recommendedScholarships: RecommendedScholarship[];
}

export default function ScholarshipRecommendations({ recommendedScholarships }: Props) {
    const [activeFilter, setActiveFilter] = useState('all');

    const highMatch = recommendedScholarships.filter(s => s.score >= 90);
    const goodMatch = recommendedScholarships.filter(s => s.score >= 70 && s.score < 90);
    const others = recommendedScholarships.filter(s => s.score < 70);

    const getMatchLevel = (score: number) => {
        if (score >= 90) return { level: 'high', color: 'success', label: 'Excellent Match' };
        if (score >= 70) return { level: 'good', color: 'warning', label: 'Good Match' };
        return { level: 'other', color: 'info', label: 'Potential Match' };
    };

    const renderScholarshipCard = (scholarship: RecommendedScholarship, index: number) => {
        const match = getMatchLevel(scholarship.score);
        const isHighMatch = scholarship.score >= 90;

        return (
            <div
                key={index}
                className="col-lg-6 col-xl-4 mb-4"
                style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: 'fadeInUp 0.6s ease-out forwards',
                    opacity: 0
                }}
            >
                <div className={`card h-100 border-0 shadow-sm position-relative overflow-hidden ${isHighMatch ? 'border-success' : ''}`}
                     style={{
                         transition: 'all 0.3s ease',
                         cursor: 'pointer',
                         background: isHighMatch ? 'linear-gradient(135deg, #e8f5e8 0%, #f8fffe 100%)' : '#fff'
                     }}
                     onMouseEnter={(e) => {
                         e.currentTarget.style.transform = 'translateY(-4px)';
                         e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                     }}
                     onMouseLeave={(e) => {
                         e.currentTarget.style.transform = 'translateY(0)';
                         e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
                     }}>

                    {/* Match Badge */}
                    <div className={`position-absolute top-0 end-0 mt-3 me-3`}>
                        <div className={`badge bg-${match.color} ${match.color === 'warning' ? 'text-dark' : 'text-white'} 
                                      px-3 py-2 rounded-pill d-flex align-items-center gap-1`}
                             style={{ fontSize: '0.75rem', fontWeight: '600' }}>
                            <TrendingUp size={12} />
                            {scholarship.score.toFixed(0)}%
                        </div>
                    </div>

                    {/* Recommended Badge for High Matches */}
                    {isHighMatch && (
                        <div className="position-absolute top-0 start-0 mt-3 ms-3">
                            <div className="badge bg-success text-white px-2 py-1 rounded-pill d-flex align-items-center gap-1"
                                 style={{ fontSize: '0.7rem' }}>
                                <Star size={10} fill="currentColor" />
                                Recommended
                            </div>
                        </div>
                    )}

                    <div className="card-body p-4">
                        {/* Header */}
                        <div className="mb-3">
                            <h6 className="card-title fw-bold mb-2 pe-5" style={{ lineHeight: '1.3' }}>
                                {scholarship.scholarship_name}
                            </h6>

                            {scholarship.grant_amount && (
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <Award size={16} className="text-primary" />
                                    <span className="text-primary fw-semibold">
                                        ₱{scholarship.grant_amount.toLocaleString()}
                                    </span>
                                    <small className="text-muted">per semester</small>
                                </div>
                            )}

                            {/* Slots badge */}
                            {scholarship.total_slots != null && (
                                <div className="mb-1">
                                    {scholarship.slots_remaining === 0 ? (
                                        <span className="slot-badge-full">⚠ Full — No slots available</span>
                                    ) : scholarship.slots_remaining != null && scholarship.slots_remaining <= 3 ? (
                                        <span className="slot-badge-low">🔥 Only {scholarship.slots_remaining} slot{scholarship.slots_remaining !== 1 ? 's' : ''} left</span>
                                    ) : (
                                        <span className="slot-badge-ok">✓ {scholarship.slots_remaining} slots remaining</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <p className="card-text text-muted small mb-4" style={{ lineHeight: '1.5' }}>
                            {scholarship.scholarship_description.length > 100
                                ? `${scholarship.scholarship_description.substring(0, 100)}...`
                                : scholarship.scholarship_description
                            }
                        </p>

                        {/* Match Level Indicator */}
                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <small className="text-muted">Match Score</small>
                                <small className={`fw-semibold text-${match.color}`}>
                                    {match.label}
                                </small>
                            </div>
                            <div className="progress" style={{ height: '6px' }}>
                                <div
                                    className={`progress-bar bg-${match.color}`}
                                    style={{ width: `${scholarship.score}%`, transition: 'width 1s ease-out' }}
                                />
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            className={`btn ${isHighMatch ? 'btn-success' : 'btn-outline-primary'} w-100 d-flex align-items-center justify-content-center gap-2`}
                            style={{ borderRadius: '8px' }}
                        >
                            {isHighMatch ? (
                                <>
                                    <ArrowRight size={16} />
                                    Apply Now
                                </>
                            ) : (
                                <>
                                    <Eye size={16} />
                                    View Details
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const filteredScholarships = () => {
        switch(activeFilter) {
            case 'high': return highMatch;
            case 'good': return goodMatch;
            case 'other': return others;
            default: return recommendedScholarships;
        }
    };

    return (
        <div className="scholarship-recommendations">
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .filter-button {
                    transition: all 0.2s ease;
                    border: 1px solid transparent;
                }
                
                .filter-button:hover {
                    transform: translateY(-1px);
                }
                
                .filter-button.active {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-color: #667eea;
                    color: white;
                }
            `}</style>

            {/* Header Section */}
            <div className="card border-0 shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="card-body p-4 text-white">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <div className="d-flex align-items-center mb-2">
                                <div className="bg-white bg-opacity-20 rounded-3 p-2 me-3">
                                    <Target className="text-dark" size={24} />
                                </div>
                                <div>
                                    <h4 className="mb-1 fw-bold">Scholarship Recommendations</h4>
                                    <p className="mb-0 opacity-90">Discover scholarships perfectly matched to your profile</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 text-md-end">
                            <div className="bg-dark-subtle bg-opacity-20 rounded-3 px-4 py-2 d-inline-block">
                                <div className="d-flex align-items-center gap-2">
                                    <Award size={18} />
                                    <span className="fw-bold">{recommendedScholarships.length}</span>
                                    <span className="small opacity-90">Available</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
                        <div className="card-body text-white text-center">
                            <Star size={32} className="mb-2" fill="currentColor" />
                            <h3 className="fw-bold mb-1">{highMatch.length}</h3>
                            <small className="opacity-90">Excellent Matches</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        <div className="card-body text-white text-center">
                            <Target size={32} className="mb-2" />
                            <h3 className="fw-bold mb-1">{goodMatch.length}</h3>
                            <small className="opacity-90">Good Matches</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        <div className="card-body text-white text-center">
                            <Eye size={32} className="mb-2" />
                            <h3 className="fw-bold mb-1">{others.length}</h3>
                            <small className="opacity-90">Other Options</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-3">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div className="d-flex align-items-center gap-2">
                            <Filter size={18} className="text-muted" />
                            <span className="fw-semibold">Filter by Match Level:</span>
                        </div>
                        <div className="btn-group" role="group">
                            {[
                                { key: 'all', label: 'All', count: recommendedScholarships.length },
                                { key: 'high', label: 'Excellent', count: highMatch.length },
                                { key: 'good', label: 'Good', count: goodMatch.length },
                                { key: 'other', label: 'Others', count: others.length }
                            ].map((filter) => (
                                <button
                                    key={filter.key}
                                    type="button"
                                    className={`btn filter-button ${activeFilter === filter.key ? 'active' : 'btn-outline-secondary'}`}
                                    onClick={() => setActiveFilter(filter.key)}
                                >
                                    {filter.label} ({filter.count})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scholarships Grid */}
            <div className="row">
                {filteredScholarships().length > 0 ? (
                    filteredScholarships().map((scholarship, index) =>
                        renderScholarshipCard(scholarship, index)
                    )
                ) : (
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <Clock size={48} className="text-muted mb-3" />
                                <h5 className="text-muted mb-2">No scholarships found</h5>
                                <p className="text-muted">Try adjusting your filter criteria</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Footer */}
            {recommendedScholarships.length > 0 && (
                <div className="text-center mt-5">
                    <button className="btn btn-primary btn-lg px-5 py-3" style={{ borderRadius: '12px' }}>
                        <Eye size={20} className="me-2" />
                        Explore All {recommendedScholarships.length} Scholarships
                    </button>
                </div>
            )}
        </div>
    );
}