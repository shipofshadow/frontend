import React from 'react';

const notifications = [
    {
        id: 1,
        text: 'Your scholarship application has been received.',
        timestamp: '2025-06-29 09:00 AM',
        unread: true,
    },
    {
        id: 2,
        text: 'Please upload your parent/guardian’s ITR.',
        timestamp: '2025-06-28 03:24 PM',
        unread: true,
    },
    {
        id: 3,
        text: 'Grades document successfully uploaded.',
        timestamp: '2025-06-27 11:02 AM',
        unread: false,
    },
];

const Notifications: React.FC = () => {
    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 rounded-4">
                        <div className="card-header bg-white border-bottom">
                            <h4 className="mb-0">
                                <i className="bi bi-bell-fill me-2 text-primary"></i>Notifications
                            </h4>
                        </div>
                        <div className="card-body">
                            {notifications.length === 0 ? (
                                <div className="text-muted text-center py-5">
                                    <i className="bi bi-inbox fs-1"></i>
                                    <p className="mt-3">No notifications yet.</p>
                                </div>
                            ) : (
                                <ul className="list-group list-group-flush">
                                    {notifications.map((notif) => (
                                        <li
                                            key={notif.id}
                                            className={`list-group-item d-flex justify-content-between align-items-start ${
                                                notif.unread ? 'bg-light' : ''
                                            }`}
                                        >
                                            <div className="ms-2 me-auto">
                                                <div className="fw-semibold">{notif.text}</div>
                                                <small className="text-muted">{notif.timestamp}</small>
                                            </div>
                                            {notif.unread && <span className="badge bg-primary rounded-pill">New</span>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
