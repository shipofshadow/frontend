import { useNotifications } from "../context/NotificationContext.tsx";

export function NotificationHistory() {
    const { notifications, unreadCount, markAsRead, fetchMore, refresh } = useNotifications();

    const priorityBadge = (p?: string) => {
        switch (p) {
            case 'urgent': return 'bg-danger';
            case 'high': return 'bg-warning text-dark';
            case 'normal': return 'bg-primary';
            case 'low': return 'bg-secondary';
            default: return 'bg-secondary';
        }
    };

    const typeIcon = (t?: string) => {
        switch (t) {
            case 'success': return 'fas fa-check-circle text-success';
            case 'error': return 'fas fa-times-circle text-danger';
            case 'warning': return 'fas fa-exclamation-triangle text-warning';
            default: return 'fas fa-info-circle text-info';
        }
    };

    const typeBackground = (t?: string) => {
        switch (t) {
            case 'success': return 'bg-success bg-opacity-10';
            case 'error': return 'bg-danger bg-opacity-10';
            case 'warning': return 'bg-warning bg-opacity-10';
            default: return 'bg-info bg-opacity-10';
        }
    };

    return (
        <div className="container py-4">
            {/* Header Card */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="mb-1 text-primary">
                                <i className="fas fa-bell me-2"></i>Notifications
                            </h4>
                            <p className="text-muted mb-0">Manage your notification history</p>
                        </div>
                        <div className="d-flex gap-2">
                            <div className="badge bg-primary fs-6 px-3 py-2">
                                <i className="fas fa-envelope me-1"></i>
                                {unreadCount} unread
                            </div>
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => refresh()}>
                                <i className="fas fa-sync-alt me-1"></i>Refresh
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={() => markAsRead()}>
                                <i className="fas fa-check-double me-1"></i>Mark all read
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications Table Card */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="bg-light">
                            <tr>
                                <th className="border-0 px-4 py-3" style={{ width: '60px' }}>
                                    <i className="fas fa-tag text-muted"></i>
                                </th>
                                <th className="border-0 py-3">
                                    <i className="fas fa-heading text-muted me-2"></i>Title
                                </th>
                                <th className="border-0 py-3">
                                    <i className="fas fa-comment text-muted me-2"></i>Message
                                </th>
                                <th className="border-0 py-3" style={{ width: '120px' }}>
                                    <i className="fas fa-flag text-muted me-2"></i>Priority
                                </th>
                                <th className="border-0 py-3" style={{ width: '160px' }}>
                                    <i className="fas fa-clock text-muted me-2"></i>Date
                                </th>
                                <th className="border-0 py-3" style={{ width: '100px' }}>
                                    <i className="fas fa-eye text-muted me-2"></i>Status
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {notifications.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-5">
                                        <div className="text-muted">
                                            <i className="fas fa-bell-slash fa-3x mb-3 text-secondary"></i>
                                            <h5 className="text-muted">No notifications found</h5>
                                            <p className="mb-0">You're all caught up!</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                notifications.map(n => (
                                    <tr
                                        key={n.id}
                                        className={`${!n.read ? 'bg-primary bg-opacity-5 border-start border-primary border-3' : ''} notification-row`}
                                        style={{ cursor: n.action_url ? 'pointer' : 'default' }}
                                        onClick={() => {
                                            if (n.action_url) {
                                                markAsRead(n.id);
                                                window.location.href = n.action_url;
                                            }
                                        }}
                                    >
                                        <td className="px-4 py-3">
                                            <div className={`rounded-circle p-2 d-inline-flex ${typeBackground(n.type)}`}>
                                                <i className={`${typeIcon(n.type)} fa-lg`} />
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div className="fw-bold text-dark mb-1">
                                                {n.title || 'Notification'}
                                            </div>
                                            {!n.read && (
                                                <span className="badge bg-primary badge-sm">
                                                        <i className="fas fa-star fa-xs me-1"></i>New
                                                    </span>
                                            )}
                                        </td>
                                        <td className="py-3">
                                            <div
                                                className="text-muted"
                                                style={{
                                                    maxWidth: '300px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                                title={n.message  || ''}
                                            >
                                                {n.message || '—'}
                                            </div>
                                        </td>
                                        <td className="py-3">
                                                <span className={`badge rounded-pill ${priorityBadge(n.priority)} px-3 py-2`}>
                                                    <i className="fas fa-circle fa-xs me-1"></i>
                                                    {n.priority || 'normal'}
                                                </span>
                                        </td>
                                        <td className="py-3">
                                            <div className="text-muted small">
                                                <i className="far fa-calendar-alt me-1"></i>
                                                {n.timestamp?.toLocaleDateString?.() || '—'}
                                            </div>
                                            <div className="text-muted small">
                                                <i className="far fa-clock me-1"></i>
                                                {n.timestamp?.toLocaleTimeString?.() || '—'}
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            {n.read ? (
                                                <span className="badge bg-success-subtle text-success px-3 py-2">
                                                        <i className="fas fa-check me-1"></i>Read
                                                    </span>
                                            ) : (
                                                <span className="badge bg-warning-subtle text-warning px-3 py-2">
                                                        <i className="fas fa-envelope me-1"></i>Unread
                                                    </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Load More Button */}
            {notifications.length > 0 && (
                <div className="text-center mt-4">
                    <button className="btn btn-outline-primary btn-lg px-4" onClick={() => fetchMore()}>
                        <i className="fas fa-chevron-down me-2"></i>Load more notifications
                    </button>
                </div>
            )}

            {/* Custom CSS for hover effects */}
            <style>{`
                .notification-row:hover {
                    background-color: rgba(13, 110, 253, 0.05) !important;
                    transform: translateY(-1px);
                    transition: all 0.2s ease;
                }
                .badge-sm {
                    font-size: 0.7em;
                }
            `}</style>
        </div>
    );
}
