import React from 'react';
import {NotificationHistory} from "../../components/NotificationHistory.tsx";


interface NotificationsProps {
    adminView?: boolean;
}

const Notifications: React.FC<NotificationsProps> = ({ adminView = false }) => {

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-xl-12 col-lg-12">
                    <NotificationHistory adminView={adminView} />
                </div>
            </div>
        </div>
    );
};

export default Notifications;