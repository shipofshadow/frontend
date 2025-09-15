import {useNotifications} from "../context/NotificationContext.tsx";

export function NotificationHistory() {
    const { notifications, unreadCount, markAsRead, fetchMore, refresh } = useNotifications();

    return (
        <div className="container py-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Notifications</h5>
                <div>
                    <span className="badge bg-primary me-2">{unreadCount} unread</span>
                    <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => refresh()}>Refresh</button>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => markAsRead()}>Mark all read</button>
                </div>
            </div>

            <ul className="list-group">
                {notifications.map(n => (
                    <li key={n.id} className={`list-group-item ${n.read ? '' : 'list-group-item-light'}`}>
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <div className="fw-semibold">{n.title || 'Notification'}</div>
                                <div className="small text-muted">{n.message}</div>
                                <div className="small text-secondary">{n.timestamp?.toLocaleString?.()}</div>
                            </div>
                            {!n.read && (
                                <button className="btn btn-sm btn-link" onClick={() => markAsRead(n.id)}>Mark read</button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            <div className="d-grid gap-2 mt-3">
                <button className="btn btn-outline-secondary" onClick={() => fetchMore()}>
                    Load more
                </button>
            </div>
        </div>
    );
}
