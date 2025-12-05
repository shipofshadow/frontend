import { useState, useEffect, useCallback } from 'react';
import { 
    Bell, 
    Filter, 
    CheckCircle, 
    Trash2, 
    Eye, 
    ArrowRight, 
    Award,
    Clock,
    TrendingUp,
    AlertCircle,
    RefreshCw,
    Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useScholarshipAlerts from '../../hooks/useScholarshipAlerts';
import Swal from 'sweetalert2';
import type { ScholarshipAlert } from '../../interfaces/alert';
import { getMatchScoreGradient } from '../../components/common/applicant/MatchExplanation';

type FilterType = 'all' | 'unread' | 'high_match' | 'good_match';

const ScholarshipAlerts = () => {
    const { 
        alerts, 
        unreadAlertCount, 
        isLoading, 
        error,
        markAsRead, 
        dismissAlert,
        refreshAlerts 
    } = useScholarshipAlerts();

    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter alerts based on active filter
    const getFilteredAlerts = useCallback((): ScholarshipAlert[] => {
        switch (activeFilter) {
            case 'unread':
                return alerts.filter(a => !a.is_read);
            case 'high_match':
                return alerts.filter(a => a.match_score >= 90);
            case 'good_match':
                return alerts.filter(a => a.match_score >= 75 && a.match_score < 90);
            default:
                return alerts;
        }
    }, [alerts, activeFilter]);

    const filteredAlerts = getFilteredAlerts();
    const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);
    const paginatedAlerts = filteredAlerts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Calculate deadline countdown
    const getDeadlineText = (deadline?: string): string => {
        if (!deadline) return '';
        const deadlineDate = new Date(deadline);
        const now = new Date();
        const diffTime = deadlineDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'Deadline passed';
        if (diffDays === 0) return 'Due today!';
        if (diffDays === 1) return 'Due tomorrow';
        if (diffDays <= 7) return `${diffDays} days left`;
        if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`;
        return `${Math.ceil(diffDays / 30)} months left`;
    };

    const getMatchScoreBadge = (score: number) => {
        if (score >= 90) return { color: 'success', label: 'Excellent Match' };
        if (score >= 75) return { color: 'warning', label: 'Good Match' };
        return { color: 'info', label: 'Potential Match' };
    };

    const handleDismiss = async (alertId: number) => {
        const result = await Swal.fire({
            title: 'Dismiss Alert?',
            text: 'This alert will be removed from your list.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, dismiss it'
        });

        if (result.isConfirmed) {
            try {
                await dismissAlert(alertId);
                Swal.fire({
                    title: 'Dismissed!',
                    text: 'The alert has been removed.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to dismiss alert';
                Swal.fire({
                    title: 'Cannot Dismiss',
                    text: errorMessage,
                    icon: 'warning',
                    confirmButtonColor: '#667eea'
                });
            }
        }
    };

    const handleViewDetails = async (alert: ScholarshipAlert) => {
        if (!alert.is_read) {
            await markAsRead(alert.id);
        }
        // Navigate to scholarship details - this would be implemented based on routing
    };

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter]);

    const renderAlertCard = (alert: ScholarshipAlert) => {
        const matchBadge = getMatchScoreBadge(alert.match_score);
        const deadlineText = getDeadlineText(alert.deadline);

        return (
            <div 
                key={alert.id}
                className={`card mb-3 border-0 shadow-sm ${!alert.is_read ? 'border-start border-4 border-primary' : ''}`}
                style={{
                    transition: 'all 0.2s ease',
                    backgroundColor: !alert.is_read ? 'rgba(102, 126, 234, 0.03)' : '#fff'
                }}
            >
                <div className="card-body p-4">
                    <div className="row align-items-center">
                        <div className="col-lg-8">
                            {/* Header */}
                            <div className="d-flex align-items-start gap-3 mb-3">
                                <div 
                                    className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                                    style={{ 
                                        background: `linear-gradient(135deg, ${getMatchScoreGradient(alert.match_score)})`,
                                        minWidth: '48px',
                                        minHeight: '48px'
                                    }}
                                >
                                    <Award size={24} className="text-white" />
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                        <h5 className="mb-0 fw-bold">{alert.scholarship_name}</h5>
                                        {!alert.is_read && (
                                            <span className="badge bg-primary rounded-pill">New</span>
                                        )}
                                    </div>
                                    <div className="d-flex align-items-center gap-3 flex-wrap">
                                        <span className={`badge bg-${matchBadge.color} ${matchBadge.color === 'warning' ? 'text-dark' : ''} px-3 py-2 rounded-pill`}>
                                            <TrendingUp size={12} className="me-1" />
                                            {alert.match_score}% Match
                                        </span>
                                        {alert.grant_amount && (
                                            <span className="text-muted small">
                                                <Award size={14} className="me-1" />
                                                ₱{alert.grant_amount.toLocaleString()}
                                            </span>
                                        )}
                                        {deadlineText && (
                                            <span className={`small ${deadlineText.includes('passed') ? 'text-danger' : deadlineText.includes('today') || deadlineText.includes('tomorrow') ? 'text-warning' : 'text-muted'}`}>
                                                <Clock size={14} className="me-1" />
                                                {deadlineText}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <p className="text-muted small mb-3">{alert.match_summary}</p>

                            {/* Top Matching Factors */}
                            {alert.top_factors && alert.top_factors.length > 0 && (
                                <div className="d-flex flex-wrap gap-2">
                                    {alert.top_factors.slice(0, 3).map((factor, idx) => (
                                        <span 
                                            key={idx}
                                            className="badge rounded-pill px-3 py-2"
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: 'white',
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            <CheckCircle size={12} className="me-1" />
                                            {factor}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="col-lg-4 mt-3 mt-lg-0">
                            <div className="d-flex flex-column gap-2">
                                <button
                                    className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                                    onClick={() => handleViewDetails(alert)}
                                >
                                    <Eye size={16} />
                                    View Details
                                </button>
                                <button
                                    className="btn btn-success d-flex align-items-center justify-content-center gap-2"
                                >
                                    <ArrowRight size={16} />
                                    Apply Now
                                </button>
                                <button
                                    className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center gap-2"
                                    onClick={() => handleDismiss(alert.id)}
                                >
                                    <Trash2 size={14} />
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderSkeleton = () => (
        <div className="card mb-3 border-0 shadow-sm">
            <div className="card-body p-4">
                <div className="row align-items-center">
                    <div className="col-lg-8">
                        <div className="d-flex gap-3 mb-3">
                            <div className="skeleton-box rounded-3" style={{ width: '48px', height: '48px', background: '#e9ecef' }} />
                            <div className="flex-grow-1">
                                <div className="skeleton-line mb-2" style={{ height: '24px', width: '60%', background: '#e9ecef', borderRadius: '4px' }} />
                                <div className="skeleton-line" style={{ height: '20px', width: '40%', background: '#e9ecef', borderRadius: '4px' }} />
                            </div>
                        </div>
                        <div className="skeleton-line mb-2" style={{ height: '16px', width: '100%', background: '#e9ecef', borderRadius: '4px' }} />
                        <div className="skeleton-line" style={{ height: '16px', width: '80%', background: '#e9ecef', borderRadius: '4px' }} />
                    </div>
                    <div className="col-lg-4 mt-3 mt-lg-0">
                        <div className="skeleton-line mb-2" style={{ height: '38px', width: '100%', background: '#e9ecef', borderRadius: '8px' }} />
                        <div className="skeleton-line" style={{ height: '38px', width: '100%', background: '#e9ecef', borderRadius: '8px' }} />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <main className="min-vh-100 bg-light">
            {/* Header */}
            <div className="bg-white shadow-sm border-bottom">
                <div className="container py-3">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <Link to="/applicant/home" className="text-decoration-none">Dashboard</Link>
                            </li>
                            <li className="breadcrumb-item active">Scholarship Alerts</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="container py-4">
                {/* Page Header */}
                <div 
                    className="card border-0 shadow-sm mb-4"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                    <div className="card-body p-4 text-white">
                        <div className="row align-items-center">
                            <div className="col-md-8">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-white bg-opacity-20 rounded-3 p-3">
                                        <Bell size={32} className="text-dark" />
                                    </div>
                                    <div>
                                        <h2 className="mb-1 fw-bold">Scholarship Alerts</h2>
                                        <p className="mb-0 opacity-90">
                                            Stay updated with scholarships matched to your profile
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 text-md-end mt-3 mt-md-0">
                                <div className="d-flex gap-2 justify-content-md-end">
                                    <div className="bg-white bg-opacity-15 rounded-3 px-4 py-2">
                                        <div className="d-flex align-items-center gap-2 text-dark">
                                            <AlertCircle size={18} className="" />
                                            <span className="fw-bold">{unreadAlertCount}</span>
                                            <span className="small opacity-90">Unread</span>
                                        </div>
                                    </div>
                                    <Link 
                                        to="/applicant/settings/alerts"
                                        className="btn btn-outline-light d-flex align-items-center gap-2"
                                    >
                                        <Settings size={18} />
                                        <span className="d-none d-sm-inline">Settings</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-3">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                            <div className="d-flex align-items-center gap-2">
                                <Filter size={18} className="text-muted" />
                                <span className="fw-semibold">Filter:</span>
                            </div>
                            <div className="btn-group flex-wrap" role="group">
                                {[
                                    { key: 'all', label: 'All', count: alerts.length },
                                    { key: 'unread', label: 'Unread', count: alerts.filter(a => !a.is_read).length },
                                    { key: 'high_match', label: 'High Match (≥90%)', count: alerts.filter(a => a.match_score >= 90).length },
                                    { key: 'good_match', label: 'Good Match (75-89%)', count: alerts.filter(a => a.match_score >= 75 && a.match_score < 90).length }
                                ].map((filter) => (
                                    <button
                                        key={filter.key}
                                        type="button"
                                        className={`btn ${activeFilter === filter.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setActiveFilter(filter.key as FilterType)}
                                    >
                                        {filter.label} ({filter.count})
                                    </button>
                                ))}
                            </div>
                            <button
                                className="btn btn-outline-primary d-flex align-items-center gap-2"
                                onClick={refreshAlerts}
                                disabled={isLoading}
                            >
                                <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                        <button 
                            className="btn btn-sm btn-outline-danger ms-auto"
                            onClick={refreshAlerts}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && !alerts.length && (
                    <>
                        {renderSkeleton()}
                        {renderSkeleton()}
                        {renderSkeleton()}
                    </>
                )}

                {/* Alerts List */}
                {!isLoading && paginatedAlerts.length > 0 && (
                    <div className="alerts-list">
                        {paginatedAlerts.map(renderAlertCard)}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && filteredAlerts.length === 0 && (
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center py-5">
                            <Bell size={64} className="text-muted mb-3 opacity-50" />
                            <h4 className="text-muted mb-2">No Alerts Found</h4>
                            <p className="text-muted mb-4">
                                {activeFilter === 'all' 
                                    ? "You don't have any scholarship alerts yet. Check back later for new matches!"
                                    : "No alerts match your current filter. Try adjusting the filter criteria."
                                }
                            </p>
                            {activeFilter !== 'all' && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setActiveFilter('all')}
                                >
                                    View All Alerts
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <nav aria-label="Alerts pagination" className="mt-4">
                        <ul className="pagination justify-content-center">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                )}
            </div>

            {/* Custom Styles */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .spin {
                    animation: spin 1s linear infinite;
                }
                
                .skeleton-box, .skeleton-line {
                    animation: pulse 1.5s ease-in-out infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </main>
    );
};

export default ScholarshipAlerts;
