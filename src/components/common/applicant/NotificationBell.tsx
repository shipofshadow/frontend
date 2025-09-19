import { Link } from 'react-router-dom';
import {useNotifications} from "../../../context/NotificationContext.tsx";

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead} = useNotifications();

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

    return (
        <li className="nav-item dropdown d-none d-lg-block">
            <a
                className="nav-link dropdown-toggle position-relative"
                href="#"
                id="notifDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                <i className="far fa-bell"></i>
                {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
                )}
            </a>

            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-lg" aria-labelledby="notifDropdown" style={{ minWidth: 360, maxWidth: 420 }}>
                <li className="px-3 py-2 d-flex justify-content-between align-items-center">
                    <span className="fw-semibold">Notifications</span>
                    {unreadCount > 0 && (
                        <button
                            className="btn btn-link btn-sm p-0"
                            onClick={() => markAsRead()}
                            title="Mark all as read"
                        >
                            Mark all read
                        </button>
                    )}
                </li>
                <li><hr className="dropdown-divider" /></li>

                {notifications.filter(n => !n.read).length === 0 ? (
                    <li className="dropdown-item text-muted small">No new notifications</li>
                ) : (
                    notifications
                        .filter(n => !n.read) // ✅ only unread
                        .slice(0, 5)          // ✅ show only first 5
                        .map((n) => (
                            <li key={n.id}>
                                <button
                                    className="dropdown-item small text-wrap d-flex gap-2 bg-light"
                                    onClick={() => {
                                        markAsRead(n.id);
                                        if (n.action_url) window.location.href = n.action_url;
                                    }}
                                >
                                    <i className={`${typeIcon(n.type)} mt-1`} aria-hidden="true"></i>
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="fw-semibold">{n.title || 'Notification'}</span>
                                            <span className={`badge rounded-pill ${priorityBadge(n.priority)} ms-auto`}>
                {n.priority || 'normal'}
              </span>
                                        </div>
                                        <div className="text-muted">{n.message || (n as any).text || '—'}</div>
                                        <div className="text-secondary" style={{ fontSize: 11 }}>
                                            {n.timestamp?.toLocaleString?.() || ''}
                                        </div>
                                    </div>
                                    <span className="badge bg-primary align-self-start">New</span>
                                </button>
                            </li>
                        ))
                )}


                <li><hr className="dropdown-divider" /></li>
                <li>
                    <Link to="/applicant/notifications" className="dropdown-item text-center">
                        View all
                    </Link>
                </li>
            </ul>
        </li>
    );
}
