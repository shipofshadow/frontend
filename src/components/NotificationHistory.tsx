import { useNotifications } from "../context/NotificationContext.tsx";

export function NotificationHistory() {
    const { notifications, unreadCount, markAsRead, fetchMore, refresh } = useNotifications();

    const priorityBadge = (p?: string) => {
        switch (p) {
            case 'urgent': return 'border-danger text-danger bg-danger-subtle';
            case 'high': return 'border-warning text-warning bg-warning-subtle';
            case 'normal': return 'border-primary text-primary bg-primary-subtle';
            case 'low': return 'border-secondary text-secondary bg-secondary-subtle';
            default: return 'border-secondary text-secondary bg-secondary-subtle';
        }
    };

    const typeIcon = (t?: string) => {
        switch (t) {
            case 'success': return 'fas fa-check-circle text-white';
            case 'error': return 'fas fa-times-circle text-white';
            case 'warning': return 'fas fa-exclamation-triangle text-white';
            default: return 'fas fa-info-circle text-white';
        }
    };

    const typeBackground = (t?: string) => {
        switch (t) {
            case 'success': return 'bg-success';
            case 'error': return 'bg-danger';
            case 'warning': return 'bg-warning';
            default: return 'bg-info';
        }
    };

    const formatDate = (timestamp?: Date) => {
        if (!timestamp) return '—';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="container-fluid py-4 px-4">
            {/* Header Section */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                        <div>
                            <h2 className="mb-2 text-dark fw-bold">
                                <i className="fas fa-bell text-primary me-3"></i>
                                Notifications
                            </h2>
                            <p className="text-muted mb-0 fs-6">Stay updated with your latest activities and alerts</p>
                        </div>

                        <div className="d-flex gap-3 align-items-center flex-wrap">
                            <div className="badge bg-gradient bg-primary text-white fs-6 px-4 py-2 rounded-pill shadow-sm">
                                <i className="fas fa-envelope me-2"></i>
                                {unreadCount} unread
                            </div>
                            <div className="btn-group shadow-sm" role="group">
                                <button className="btn btn-outline-secondary" onClick={() => refresh()}>
                                    <i className="fas fa-sync-alt me-2"></i>Refresh
                                </button>
                                <button className="btn btn-primary" onClick={() => markAsRead()}>
                                    <i className="fas fa-check-double me-2"></i>Mark all read
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter/Stats Bar */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm bg-light">
                        <div className="card-body py-3">
                            <div className="row text-center">
                                <div className="col-md-3 col-6 mb-2 mb-md-0">
                                    <div className="d-flex align-items-center justify-content-center">
                                        <i className="fas fa-list-ul text-primary me-2"></i>
                                        <span className="fw-semibold">{notifications.length}</span>
                                        <span className="text-muted ms-1">Total</span>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6 mb-2 mb-md-0">
                                    <div className="d-flex align-items-center justify-content-center">
                                        <i className="fas fa-star text-warning me-2"></i>
                                        <span className="fw-semibold">{unreadCount}</span>
                                        <span className="text-muted ms-1">Unread</span>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6">
                                    <div className="d-flex align-items-center justify-content-center">
                                        <i className="fas fa-check text-success me-2"></i>
                                        <span className="fw-semibold">{notifications.length - unreadCount}</span>
                                        <span className="text-muted ms-1">Read</span>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6">
                                    <div className="d-flex align-items-center justify-content-center">
                                        <i className="fas fa-clock text-info me-2"></i>
                                        <span className="text-muted">Last updated</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications Grid */}
            <div className="row">
                <div className="col-12">
                    {notifications.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="mb-4">
                                <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                                    <i className="fas fa-bell-slash fa-3x text-muted"></i>
                                </div>
                                <h4 className="text-muted mb-2">No notifications found</h4>
                                <p className="text-muted mb-4">You're all caught up! New notifications will appear here.</p>
                                <button className="btn btn-primary" onClick={() => refresh()}>
                                    <i className="fas fa-sync-alt me-2"></i>Check for updates
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="notification-list">
                            {notifications.map(n => (
                                <div
                                    key={n.id}
                                    className={`notification-card card border-0 shadow-sm mb-3 ${!n.read ? 'unread-notification' : ''}`}
                                    style={{ cursor: n.action_url ? 'pointer' : 'default' }}
                                    onClick={() => {
                                        if (n.action_url) {
                                            markAsRead(n.id);
                                            window.location.href = n.action_url;
                                        }
                                    }}
                                >
                                    <div className="card-body p-4">
                                        <div className="row align-items-start">
                                            {/* Icon Section */}
                                            <div className="col-auto">
                                                <div className={`rounded-circle p-3 ${typeBackground(n.type)} bg-opacity-15 d-flex align-items-center justify-content-center`} style={{width: '60px', height: '60px'}}>
                                                    <i className={`${typeIcon(n.type)} fa-lg`} />
                                                </div>
                                            </div>

                                            {/* Content Section */}
                                            <div className="col">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div className="flex-grow-1">
                                                        <h5 className="mb-1 text-dark fw-semibold">
                                                            {n.title || 'Notification'}
                                                            {!n.read && (
                                                                <span className="badge bg-primary bg-gradient ms-2 pulse-animation">
                                                                    <i className="fas fa-star fa-xs me-1"></i>New
                                                                </span>
                                                            )}
                                                        </h5>
                                                        <p className="text-muted mb-2 lh-base">
                                                            {n.message || 'No message content available'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Meta Information */}
                                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                                    <div className="d-flex gap-3 align-items-center">
                                                        <span className={`badge rounded-pill border ${priorityBadge(n.priority)} px-3 py-2 fw-normal`}>
                                                            <i className="fas fa-flag fa-xs me-1"></i>
                                                            {(n.priority || 'normal').charAt(0).toUpperCase() + (n.priority || 'normal').slice(1)}
                                                        </span>

                                                        <div className="text-muted small d-flex align-items-center">
                                                            <i className="far fa-clock me-1"></i>
                                                            {formatDate(n.timestamp)}
                                                        </div>
                                                    </div>

                                                    <div className="d-flex align-items-center gap-2">
                                                        {n.read ? (
                                                            <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill">
                                                                <i className="fas fa-check-circle me-1"></i>Read
                                                            </span>
                                                        ) : (
                                                            <span className="badge bg-warning-subtle text-warning px-3 py-2 rounded-pill">
                                                                <i className="fas fa-envelope me-1"></i>Unread
                                                            </span>
                                                        )}

                                                        {n.action_url && (
                                                            <div className="text-muted">
                                                                <i className="fas fa-external-link-alt fa-sm"></i>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {!n.read && <div className="unread-indicator"></div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Load More Section */}
            {notifications.length > 0 && (
                <div className="row mt-4">
                    <div className="col-12 text-center">
                        <button className="btn btn-outline-primary btn-lg px-5 py-3 rounded-pill shadow-sm hover-lift" onClick={() => fetchMore()}>
                            <i className="fas fa-chevron-down me-2"></i>
                            Load more notifications
                        </button>
                    </div>
                </div>
            )}

            {/* Enhanced Custom CSS */}
            <style>{`
                .notification-card {
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .notification-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
                }
                
                .unread-notification {
                    border-left: 4px solid var(--bs-primary) !important;
                    background: linear-gradient(135deg, rgba(13, 110, 253, 0.02) 0%, rgba(13, 110, 253, 0.05) 100%);
                }
                
                .unread-indicator {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 0;
                    height: 0;
                    border-top: 20px solid var(--bs-primary);
                    border-left: 20px solid transparent;
                    opacity: 0.8;
                }
                
                .pulse-animation {
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
                
                .hover-lift:hover {
                    transform: translateY(-2px);
                    transition: all 0.2s ease;
                }
                
                .notification-list {
                    max-height: none;
                }
                
                .bg-gradient {
                    background: linear-gradient(135deg, var(--bs-primary) 0%, #0056b3 100%) !important;
                }
                
                @media (max-width: 768px) {
                    .notification-card .row {
                        --bs-gutter-x: 0.75rem;
                    }
                    
                    .container-fluid {
                        padding-left: 1rem !important;
                        padding-right: 1rem !important;
                    }
                }
                
                .card-body {
                    position: relative;
                }
                
                .badge {
                    font-weight: 500 !important;
                    letter-spacing: 0.025em;
                }
            `}</style>
        </div>
    );
}
