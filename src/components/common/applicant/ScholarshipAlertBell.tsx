import { Link } from 'react-router-dom';
import { Bell, Award, TrendingUp, ArrowRight } from 'lucide-react';
import useScholarshipAlerts from '../../../hooks/useScholarshipAlerts';
import { getMatchScoreGradient } from './MatchExplanation';

export function ScholarshipAlertBell() {
    const { alerts, unreadAlertCount, markAsRead } = useScholarshipAlerts();

    // Get recent unread alerts (up to 5)
    const recentAlerts = alerts.filter(a => !a.is_read).slice(0, 5);

    const getMatchBadgeColor = (score: number) => {
        if (score >= 90) return 'success';
        if (score >= 75) return 'warning';
        return 'info';
    };

    return (
        <li className="nav-item dropdown d-none d-lg-block">
            <a
                className="nav-link dropdown-toggle position-relative"
                href="#"
                id="scholarshipAlertDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-label="Scholarship alerts"
            >
                <Award size={18} />
                {unreadAlertCount > 0 && (
                    <span 
                        className="position-absolute translate-middle badge rounded-pill bg-success"
                        style={{ 
                            top: '8px', 
                            right: '-2px',
                            fontSize: '0.65rem',
                            animation: 'pulse 2s infinite'
                        }}
                    >
                        {unreadAlertCount > 99 ? '99+' : unreadAlertCount}
                        <span className="visually-hidden">unread scholarship alerts</span>
                    </span>
                )}
            </a>

            <ul 
                className="dropdown-menu dropdown-menu-end shadow" 
                aria-labelledby="scholarshipAlertDropdown" 
                style={{ minWidth: 380, maxWidth: 420 }}
            >
                <li className="px-3 py-2 d-flex justify-content-between align-items-center border-bottom">
                    <div className="d-flex align-items-center gap-2">
                        <Award size={16} className="text-primary" />
                        <span className="fw-semibold">Scholarship Matches</span>
                    </div>
                    {unreadAlertCount > 0 && (
                        <span className="badge bg-success rounded-pill">{unreadAlertCount} New</span>
                    )}
                </li>

                {recentAlerts.length === 0 ? (
                    <li className="px-3 py-4 text-center text-muted">
                        <Bell size={32} className="opacity-50 mb-2" />
                        <p className="small mb-0">No new scholarship matches</p>
                    </li>
                ) : (
                    <>
                        {recentAlerts.map((alert) => (
                            <li key={alert.id}>
                                <button
                                    className="dropdown-item py-3 d-flex gap-3 border-bottom"
                                    onClick={() => {
                                        markAsRead(alert.id);
                                    }}
                                    style={{ 
                                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                                        whiteSpace: 'normal'
                                    }}
                                >
                                    <div 
                                        className="rounded-2 p-2 d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{ 
                                            background: `linear-gradient(135deg, ${getMatchScoreGradient(alert.match_score)})`,
                                            width: '40px',
                                            height: '40px'
                                        }}
                                    >
                                        <Award size={18} className="text-white" />
                                    </div>
                                    <div className="flex-grow-1 text-start">
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <span className="fw-semibold small text-truncate" style={{ maxWidth: '200px' }}>
                                                {alert.scholarship_name}
                                            </span>
                                            <span className={`badge bg-${getMatchBadgeColor(alert.match_score)} ${getMatchBadgeColor(alert.match_score) === 'warning' ? 'text-dark' : ''} rounded-pill ms-auto`}>
                                                <TrendingUp size={10} className="me-1" />
                                                {alert.match_score}%
                                            </span>
                                        </div>
                                        <p className="text-muted small mb-0 text-truncate" style={{ maxWidth: '280px' }}>
                                            {alert.match_summary || 'New scholarship match for you!'}
                                        </p>
                                        {alert.top_factors && alert.top_factors.length > 0 && (
                                            <div className="mt-1">
                                                <span className="badge bg-light text-dark me-1 small">
                                                    {alert.top_factors[0]}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            </li>
                        ))}
                    </>
                )}

                <li>
                    <Link 
                        to="/applicant/alerts" 
                        className="dropdown-item text-center py-3 d-flex align-items-center justify-content-center gap-2 text-primary fw-medium"
                    >
                        View All Scholarship Alerts
                        <ArrowRight size={14} />
                    </Link>
                </li>
            </ul>

            <style>{`
                @keyframes pulse {
                    0%, 100% { 
                        transform: translateX(-50%) scale(1); 
                    }
                    50% { 
                        transform: translateX(-50%) scale(1.1); 
                    }
                }
            `}</style>
        </li>
    );
}

export default ScholarshipAlertBell;
