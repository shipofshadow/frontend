import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config.ts';

interface ApiStatusGuardProps {
    children: React.ReactNode;
}

const ApiStatusGuard: React.FC<ApiStatusGuardProps> = ({ children }) => {
    const [isOnline, setIsOnline] = useState<boolean | null>(null);

    const checkApi = async (): Promise<boolean> => {
        try {
            await axios.get(`${API_BASE_URL}/api/ping`);
            setIsOnline(true);
            return true;
        } catch (error) {
            console.error("API is down:", error);
            setIsOnline(false);
            return false;
        }
    };

    useEffect(() => {
        checkApi().then(r => {
            if (r) {
                console.log('API is online');
            } else {
                console.log('API is offline');
            }
        });
    });

    if (isOnline === null) {
        // Do not show anything while checking
        return null;
    }

    if (!isOnline) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-danger bg-light">
                <h1>🚫 Server Unavailable</h1>
                <p>The server is currently unreachable. Please try again later.</p>
            </div>
        );
    }

    return <>{children}</>;
};

export default ApiStatusGuard;