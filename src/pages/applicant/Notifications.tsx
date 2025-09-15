import React from 'react';
import {NotificationHistory} from "../../components/NotificationHistory.tsx";


const Notifications: React.FC = () => {

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-xl-8 col-lg-10">

                    <NotificationHistory/>
                </div>
            </div>
        </div>
    );
};

export default Notifications;