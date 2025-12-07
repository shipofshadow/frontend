import { Link } from 'react-router-dom';
import {useNotifications} from "../../../context/NotificationContext.tsx";

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, fetchMore } = useNotifications();

    const typeIcon = (t?: string) => {
        switch (t) {
            case 'success': return 'fas fa-check-circle';
            case 'error': return 'fas fa-times-circle';
            case 'warning': return 'fas fa-exclamation-triangle';
            default: return 'fas fa-chart-line';
        }
    };

    const priorityColor = (p?: string) => {
        switch (p) {
            case 'urgent': return 'bg-danger';
            case 'high': return 'bg-warning';
            case 'normal': return 'bg-primary';
            case 'low': return 'bg-secondary';
            default: return 'bg-info';
        }
    };

    return (
        <li className="nav-item dropdown d-none d-sm-block no-caret me-3 dropdown-notifications">
            <button
                className="btn btn-link position-relative p-0 border-0 bg-transparent"
                id="navbarDropdownAlerts"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
            >
                <i className="far fa-bell fa-lg text-dark" />

                {unreadCount > 0 && (
                    <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger text-white"
                        style={{
                            fontSize: "0.7rem",
                            minWidth: "18px",
                            height: "18px",
                            lineHeight: "14px",
                            padding: "2px 5px",
                        }}
                    >
      {unreadCount > 99 ? "99+" : unreadCount}
                        <span className="visually-hidden">unread notifications</span>
    </span>
                )}
            </button>

            <div
                className="dropdown-menu dropdown-menu-end border-0 shadow animated--fade-in-up"
                aria-labelledby="navbarDropdownAlerts"
            >
                <h6 className="dropdown-header dropdown-notifications-header d-flex justify-content-between align-items-center">
                    <span>
                        <i className="me-2 far fa-bell" />
                        Alerts Center
                    </span>
                    {unreadCount > 0 && (
                        <button
                            className="btn btn-close-white  btn-sm p-0 text-decoration-none"
                            onClick={() => markAsRead()}
                            title="Mark all as read"
                        >
                            Mark all read
                        </button>
                    )}
                </h6>

                {notifications.length === 0 ? (
                    <span className="dropdown-item dropdown-notifications-item">
                        <div className="dropdown-notifications-item-icon bg-secondary">
                            <i className="far fa-bell-slash" />
                        </div>
                        <div className="dropdown-notifications-item-content">
                            <div className="dropdown-notifications-item-content-text text-muted">
                                No new notifications
                            </div>
                        </div>
                    </span>
                ) : (
                    notifications.slice(0, 5).map((n) => (
                        <span
                            key={n.id}
                            className={`dropdown-item dropdown-notifications-item ${!n.read ? 'bg-light' : ''}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                markAsRead(n.id);
                                if (n.action_url) window.location.href = n.action_url;
                            }}
                        >
                            <div className={`dropdown-notifications-item-icon ${priorityColor(n.priority)}`}>
                                <i className={typeIcon(n.type)} />
                            </div>
                            <div className="dropdown-notifications-item-content">
                                <div className="dropdown-notifications-item-content-details d-flex justify-content-between">
                                    <small>{n.timestamp?.toLocaleString?.() || 'Just now'}</small>
                                    {!n.read && <span className="badge bg-primary">New</span>}
                                </div>
                                <div className="dropdown-notifications-item-content-text">
                                    <strong>{n.title || 'Notification'}</strong>
                                    <br />
                                    {n.message || (n as any).text || 'This is an alert message.'}
                                </div>
                            </div>
                        </span>
                    ))
                )}

                {notifications.length > 5 && (
                    <span
                        className="dropdown-item text-center"
                        style={{ cursor: 'pointer' }}
                        onClick={() => fetchMore()}
                    >
                        <small className="text-primary">Load more notifications</small>
                    </span>
                )}

                <Link
                    to="/admin/notifications"
                    className="dropdown-item dropdown-notifications-footer"
                >
                    View All Alerts
                </Link>
            </div>
        </li>
    );
}
