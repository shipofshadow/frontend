import React, { useState } from 'react';

interface Notification {
    id: number;
    text: string;
    timestamp: string;
    unread: boolean;
    type: 'success' | 'warning' | 'info' | 'danger';
    category: 'scholarship' | 'documents' | 'academic' | 'system';
}

const initialNotifications: Notification[] = [
    {
        id: 1,
        text: 'Your scholarship application has been received and is under review.',
        timestamp: '2025-06-29 09:00 AM',
        unread: true,
        type: 'success',
        category: 'scholarship'
    },
    {
        id: 2,
        text: 'Action required: Please upload your parent/guardian\'s ITR to complete your application.',
        timestamp: '2025-06-28 03:24 PM',
        unread: true,
        type: 'warning',
        category: 'documents'
    },
    {
        id: 3,
        text: 'Grades document successfully uploaded and verified.',
        timestamp: '2025-06-27 11:02 AM',
        unread: false,
        type: 'success',
        category: 'documents'
    },
    {
        id: 4,
        text: 'Reminder: Scholarship application deadline is approaching (July 15, 2025).',
        timestamp: '2025-06-26 02:15 PM',
        unread: false,
        type: 'info',
        category: 'scholarship'
    },
    {
        id: 5,
        text: 'System maintenance scheduled for July 1, 2025 from 2:00 AM - 4:00 AM.',
        timestamp: '2025-06-25 08:30 AM',
        unread: false,
        type: 'info',
        category: 'system'
    }
];

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [filter, setFilter] = useState<'all' | 'unread' | Notification['category']>('all');
    const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);

    const unreadCount = notifications.filter(n => n.unread).length;

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'all') return true;
        if (filter === 'unread') return notif.unread;
        return notif.category === filter;
    });

    const getNotificationIcon = (_type: Notification['type'], category: Notification['category']) => {
        const icons = {
            scholarship: 'bi-award',
            documents: 'bi-file-earmark-text',
            academic: 'bi-mortarboard',
            system: 'bi-gear'
        };
        return icons[category] || 'bi-bell';
    };

    const getNotificationColor = (type: Notification['type']) => {
        const colors = {
            success: 'success',
            warning: 'warning',
            info: 'info',
            danger: 'danger'
        };
        return colors[type];
    };

    const markAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, unread: false } : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, unread: false }))
        );
    };

    const deleteNotification = (id: number) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
        setSelectedNotifications(prev => prev.filter(selectedId => selectedId !== id));
    };

    const toggleSelectNotification = (id: number) => {
        setSelectedNotifications(prev =>
            prev.includes(id)
                ? prev.filter(selectedId => selectedId !== id)
                : [...prev, id]
        );
    };

    const deleteSelected = () => {
        setNotifications(prev =>
            prev.filter(notif => !selectedNotifications.includes(notif.id))
        );
        setSelectedNotifications([]);
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-xl-8 col-lg-10">
                    {/* Header */}
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <h2 className="fw-bold mb-1">
                                <i className="bi bi-bell-fill me-2 text-primary"></i>
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="badge bg-danger ms-2">{unreadCount}</span>
                                )}
                            </h2>
                            <p className="text-muted mb-0">Stay updated with your latest activities</p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={markAllAsRead}
                            >
                                <i className="bi bi-check-all me-1"></i>
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="card shadow-sm border-0 rounded-4">
                        {/* Filter Bar */}
                        <div className="card-header bg-light bg-opacity-50 border-0 rounded-top-4">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                                <div className="btn-group" role="group">
                                    <input
                                        type="radio"
                                        className="btn-check"
                                        name="filter"
                                        id="all"
                                        checked={filter === 'all'}
                                        onChange={() => setFilter('all')}
                                    />
                                    <label className="btn btn-outline-primary btn-sm" htmlFor="all">
                                        All ({notifications.length})
                                    </label>

                                    <input
                                        type="radio"
                                        className="btn-check"
                                        name="filter"
                                        id="unread"
                                        checked={filter === 'unread'}
                                        onChange={() => setFilter('unread')}
                                    />
                                    <label className="btn btn-outline-primary btn-sm" htmlFor="unread">
                                        Unread ({unreadCount})
                                    </label>

                                    <input
                                        type="radio"
                                        className="btn-check"
                                        name="filter"
                                        id="scholarship"
                                        checked={filter === 'scholarship'}
                                        onChange={() => setFilter('scholarship')}
                                    />
                                    <label className="btn btn-outline-primary btn-sm" htmlFor="scholarship">
                                        <i className="bi bi-award me-1"></i>
                                        Scholarship
                                    </label>

                                    <input
                                        type="radio"
                                        className="btn-check"
                                        name="filter"
                                        id="documents"
                                        checked={filter === 'documents'}
                                        onChange={() => setFilter('documents')}
                                    />
                                    <label className="btn btn-outline-primary btn-sm" htmlFor="documents">
                                        <i className="bi bi-file-earmark-text me-1"></i>
                                        Documents
                                    </label>
                                </div>

                                {selectedNotifications.length > 0 && (
                                    <div className="d-flex align-items-center gap-2">
                                        <small className="text-muted">
                                            {selectedNotifications.length} selected
                                        </small>
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={deleteSelected}
                                        >
                                            <i className="bi bi-trash me-1"></i>
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card-body p-0">
                            {filteredNotifications.length === 0 ? (
                                <div className="text-center py-5">
                                    <div className="mb-3">
                                        <i className="bi bi-inbox display-1 text-muted opacity-50"></i>
                                    </div>
                                    <h5 className="text-muted mb-2">No notifications found</h5>
                                    <p className="text-muted mb-0">
                                        {filter === 'unread'
                                            ? "You're all caught up! No unread notifications."
                                            : `No ${filter === 'all' ? '' : filter + ' '}notifications to display.`
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {filteredNotifications.map((notif, index) => (
                                        <div
                                            key={notif.id}
                                            className={`list-group-item list-group-item-action border-0 ${
                                                notif.unread ? 'border-start border-primary border-3' : ''
                                            } ${index === filteredNotifications.length - 1 ? 'rounded-bottom-4' : ''}`}
                                            style={notif.unread ? {
                                                backgroundColor: 'rgba(13, 110, 253, 0.02)',
                                                borderLeftColor: '#0d6efd'
                                            } : {}}
                                        >
                                            <div className="d-flex align-items-start gap-3">
                                                {/* Selection Checkbox */}
                                                <div className="form-check align-self-center">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={selectedNotifications.includes(notif.id)}
                                                        onChange={() => toggleSelectNotification(notif.id)}
                                                    />
                                                </div>

                                                {/* Notification Icon */}
                                                <div className={`bg-${getNotificationColor(notif.type)} bg-opacity-10 rounded-circle p-2 flex-shrink-0`}>
                                                    <i className={`bi ${getNotificationIcon(notif.type, notif.category)} text-${getNotificationColor(notif.type)}`}></i>
                                                </div>

                                                {/* Notification Content */}
                                                <div className="flex-grow-1 min-width-0">
                                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                                        <p className={`mb-1 ${notif.unread ? 'fw-medium text-dark' : 'fw-normal text-body'}`}>
                                                            {notif.text}
                                                        </p>
                                                        {notif.unread && (
                                                            <div className="bg-primary rounded-circle flex-shrink-0 ms-2"
                                                                 style={{ width: '8px', height: '8px' }}
                                                                 title="Unread">
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <small className="text-muted">
                                                                <i className="bi bi-clock me-1"></i>
                                                                {formatTimestamp(notif.timestamp)}
                                                            </small>
                                                            <span className={`badge bg-${getNotificationColor(notif.type)} bg-opacity-10 text-${getNotificationColor(notif.type)} text-capitalize`}>
                                                                {notif.category}
                                                            </span>
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="d-flex gap-1">
                                                            {notif.unread && (
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => markAsRead(notif.id)}
                                                                    title="Mark as read"
                                                                >
                                                                    <i className="bi bi-check"></i>
                                                                </button>
                                                            )}
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => deleteNotification(notif.id)}
                                                                title="Delete notification"
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {filteredNotifications.length > 0 && (
                            <div className="card-footer bg-light bg-opacity-50 border-0 rounded-bottom-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-muted">
                                        Showing {filteredNotifications.length} of {notifications.length} notifications
                                    </small>
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-sm btn-outline-secondary">
                                            <i className="bi bi-arrow-clockwise me-1"></i>
                                            Refresh
                                        </button>
                                        <button className="btn btn-sm btn-outline-secondary">
                                            <i className="bi bi-gear me-1"></i>
                                            Settings
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notifications;