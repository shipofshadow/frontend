import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPublicSettings, type SystemConfig } from '../services/settingsService';

// Default fallback values in case API fails
const defaultSettings: Partial<SystemConfig> = {
    systemName: 'iScholar',
    enableGoogleLogin: true,
    enableNativeLogin: true,
    maintenanceMode: false,
    allowNewRegistrations: true,
    isApplicationOpen: true,
};

interface SettingsContextType {
    settings: Partial<SystemConfig>;
    isLoading: boolean;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Partial<SystemConfig>>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const data = await getPublicSettings();
            setSettings(prev => ({ ...prev, ...data }));
        } catch (error) {
            console.error("Failed to load system settings", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, isLoading, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
};