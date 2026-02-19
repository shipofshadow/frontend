import  { useState } from 'react';
import { Star, Target, ArrowRight, Eye, Award, TrendingUp, Filter, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Swal from 'sweetalert2';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';
import { useAuth } from '../../../context/AuthContext';

interface RecommendedScholarship {
    id: number;
    scholarship_id: number;
    scholarship_name: string;
    scholarship_description: string;
    grant_amount: number | null;
    score: number; // match %
}

interface SelectedScholarship {
    id: number;
    scholarship_id: number;
    scholarship_name: string;
    status: 'student_selected' | 'selected' | 'awarded' | 'cancelled' | 'rejected';
    selection_reason: string | null;
    awarded_amount: number | null;
}

interface Props {
    recommendedScholarships: RecommendedScholarship[];
    applicationId: number;
    selectedScholarship?: SelectedScholarship | null;
    onSelectionChange?: () => void;
}

export default function ScholarshipRecommendations({ 
    recommendedScholarships, 
    applicationId, 
    selectedScholarship,
    onSelectionChange 
}: Props) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [isSelecting, setIsSelecting] = useState(false);
    const { token } = useAuth();

    const highMatch = recommendedScholarships.filter(s => s.score >= 90);
    const goodMatch = recommendedScholarships.filter(s => s.score >= 70 && s.score < 90);
    const others = recommendedScholarships.filter(s => s.score < 70);

    const getMatchLevel = (score: number) => {
        if (score >= 90) return { level: 'high', color: 'success', label: 'Excellent Match' };
        if (score >= 70) return { level: 'good', color: 'warning', label: 'Good Match' };
        return { level: 'other', color: 'info', label: 'Potential Match' };
    };

    const handleSelectScholarship = async (scholarship: RecommendedScholarship) => {
        const result = await Swal.fire({
            title: 'Confirm Scholarship Selection',
            html: `
                <p class="mb-3">You are about to select <strong>${scholarship.scholarship_name}</strong></p>
                <p class="text-muted small">You can optionally provide a reason for your selection below:</p>
            `,
            input: 'textarea',
            inputPlaceholder: 'Enter your reason for selecting this scholarship (optional)',
            showCancelButton: true,
            confirmButtonText: 'Confirm Selection',
            confirmButtonColor: '#28a745',
            cancelButtonText: 'Cancel',
            inputValidator: () => {
                // No validation needed, reason is optional
                return null;
            }
        });

        if (result.isConfirmed) {
            try {
                setIsSelecting(true);
                await axios.post(
                    `${API_BASE_URL}/api/evaluations/${applicationId}/student-select-scholarship`,
                    {
                        scholarship_id: scholarship.scholarship_id,
                        selection_reason: result.value || null
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                await Swal.fire({
                    icon: 'success',
                    title: 'Selection Submitted!',
                    text: 'Your scholarship selection has been submitted and is pending admin confirmation.',
                    confirmButtonColor: '#28a745'
                });

                // Trigger refresh
                if (onSelectionChange) {
                    onSelectionChange();
                }
            } catch (error) {
                console.error('Error selecting scholarship:', error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Selection Failed',
                    text: 'Failed to submit your selection. Please try again.',
                    confirmButtonColor: '#dc3545'
                });
            } finally {
                setIsSelecting(false);
            }
        }
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
                        {selectedScholarship?.scholarship_id === scholarship.scholarship_id ? (
                            <div className={`alert ${
                                selectedScholarship.status === 'student_selected' ? 'alert-warning' :
                                selectedScholarship.status === 'selected' || selectedScholarship.status === 'awarded' ? 'alert-success' :
                                selectedScholarship.status === 'rejected' ? 'alert-danger' :
                                'alert-secondary'
                            } mb-0 py-2 d-flex align-items-center justify-content-center gap-2`}>
                                {selectedScholarship.status === 'student_selected' && (
                                    <>
                                        <Clock size={16} />
                                        <small className="mb-0 fw-semibold">Pending Admin Confirmation</small>
                                    </>
                                )}
                                {(selectedScholarship.status === 'selected' || selectedScholarship.status === 'awarded') && (
                                    <>
                                        <CheckCircle size={16} />
                                        <small className="mb-0 fw-semibold">Selected</small>
                                    </>
                                )}
                                {selectedScholarship.status === 'rejected' && (
                                    <>
                                        <AlertCircle size={16} />
                                        <small className="mb-0 fw-semibold">Selection Rejected</small>
                                    </>
                                )}
                            </div>
                        ) : (
                            <button
                                className={`btn ${isHighMatch ? 'btn-success' : 'btn-primary'} w-100 d-flex align-items-center justify-content-center gap-2`}
                                style={{ borderRadius: '8px' }}
                                onClick={() => handleSelectScholarship(scholarship)}
                                disabled={isSelecting || (selectedScholarship && selectedScholarship.status !== 'rejected')}
                            >
                                <CheckCircle size={16} />
                                Select This Scholarship
                            </button>
                        )}
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

            {/* Selection Status Section */}
            {selectedScholarship && (
                <div className="row mb-4">
                    <div className="col-12">
                        {selectedScholarship.status === 'student_selected' && (
                            <div className="alert alert-warning border-warning border-2 shadow-sm" role="alert">
                                <div className="d-flex align-items-start">
                                    <Clock size={24} className="me-3 flex-shrink-0" />
                                    <div className="flex-grow-1">
                                        <h5 className="alert-heading mb-2">
                                            <strong>Selection Pending Admin Review</strong>
                                        </h5>
                                        <p className="mb-2">
                                            You have selected <strong>{selectedScholarship.scholarship_name}</strong>. 
                                            Your selection is currently pending admin confirmation.
                                        </p>
                                        {selectedScholarship.selection_reason && (
                                            <div className="mt-2 p-2 bg-white rounded">
                                                <small className="text-muted d-block mb-1">Your reason:</small>
                                                <small className="d-block">{selectedScholarship.selection_reason}</small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {(selectedScholarship.status === 'selected' || selectedScholarship.status === 'awarded') && (
                            <div className="alert alert-success border-success border-2 shadow-sm" role="alert">
                                <div className="d-flex align-items-start">
                                    <CheckCircle size={24} className="me-3 flex-shrink-0" />
                                    <div className="flex-grow-1">
                                        <h5 className="alert-heading mb-2">
                                            <strong>Scholarship Confirmed!</strong>
                                        </h5>
                                        <p className="mb-2">
                                            Congratulations! Your selection of <strong>{selectedScholarship.scholarship_name}</strong> has been confirmed by the admin.
                                        </p>
                                        {selectedScholarship.awarded_amount && (
                                            <div className="mt-2 p-2 bg-white rounded">
                                                <small className="text-muted d-block mb-1">Awarded Amount:</small>
                                                <strong className="text-success">₱{selectedScholarship.awarded_amount.toLocaleString()}</strong>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {selectedScholarship.status === 'rejected' && (
                            <div className="alert alert-danger border-danger border-2 shadow-sm" role="alert">
                                <div className="d-flex align-items-start">
                                    <AlertCircle size={24} className="me-3 flex-shrink-0" />
                                    <div className="flex-grow-1">
                                        <h5 className="alert-heading mb-2">
                                            <strong>Selection Not Approved</strong>
                                        </h5>
                                        <p className="mb-2">
                                            Unfortunately, your selection of <strong>{selectedScholarship.scholarship_name}</strong> was not approved. 
                                            Please select another scholarship from the recommendations below.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

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