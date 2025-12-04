import { API_BASE_URL } from "../config";

// Interface for system configuration
export interface SystemConfig {
    // General & Support
    systemName: string;
    organizationName: string;
    supportEmail: string;
    supportPhone: string;

    // Application Control
    isApplicationOpen: boolean;
    allowNewRegistrations: boolean;
    applicationStartDate: string;
    applicationEndDate: string;

    // Notifications
    enableEmailAlerts: boolean;
    enableInAppNotifications: boolean;
    emailSenderName: string;

    email_activation_enabled: boolean;

    // Authentication & Security
    maintenanceMode: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    enableNativeLogin: boolean;
    enableGoogleLogin: boolean;
    minPasswordLength: number;

    // Data Management
    logRetentionDays: number;
    cleanupIntervalHours: number;

    // Storage
    storageProvider: 'local' | 's3';
}

// Map API response to frontend config
export const mapApiResponseToConfig = (apiData: Record<string, string>): SystemConfig => {
    return {
        systemName: apiData.systemName || '',
        organizationName: apiData.organizationName || '',
        supportEmail: apiData.supportEmail || '',
        supportPhone: apiData.supportPhone || '',
        isApplicationOpen: apiData.isApplicationOpen === '1' || apiData.isApplicationOpen === 'true',
        allowNewRegistrations: apiData.allowNewRegistrations === '1' || apiData.allowNewRegistrations === 'true',
        applicationStartDate: apiData.applicationStartDate || '',
        applicationEndDate: apiData.applicationEndDate || '',
        enableEmailAlerts: apiData.enableEmailAlerts === '1' || apiData.enableEmailAlerts === 'true',
        enableInAppNotifications: apiData.enableInAppNotifications === '1' || apiData.enableInAppNotifications === 'true',
        emailSenderName: apiData.emailSenderName || '',
        email_activation_enabled: apiData.emailActivationEnabled === '1' || apiData.emailActivationEnabled === 'true',
        maintenanceMode: apiData.maintenanceMode === '1' || apiData.maintenanceMode === 'true',
        sessionTimeout: parseInt(apiData.sessionTimeout) || 30,
        maxLoginAttempts: parseInt(apiData.maxLoginAttempts) || 5,
        enableNativeLogin: apiData.enableNativeLogin === '1' || apiData.enableNativeLogin === 'true',
        enableGoogleLogin: apiData.enableGoogleLogin === '1' || apiData.enableGoogleLogin === 'true',
        minPasswordLength: parseInt(apiData.minPasswordLength) || 8,
        logRetentionDays: parseInt(apiData.logRetentionDays) || 90,
        cleanupIntervalHours: parseInt(apiData.cleanupIntervalHours) || 24,
        storageProvider: (apiData.storageProvider as 'local' | 's3') || 'local'
    };
};

// Map frontend config to API payload
export const mapConfigToApiPayload = (config: SystemConfig): Record<string, string> => {
    return {
        systemName: config.systemName,
        organizationName: config.organizationName,
        supportEmail: config.supportEmail,
        supportPhone: config.supportPhone,
        isApplicationOpen: config.isApplicationOpen ? '1' : '0',
        allowNewRegistrations: config.allowNewRegistrations ? '1' : '0',
        applicationStartDate: config.applicationStartDate,
        applicationEndDate: config.applicationEndDate,
        enableEmailAlerts: config.enableEmailAlerts ? '1' : '0',
        enableInAppNotifications: config.enableInAppNotifications ? '1' : '0',
        emailSenderName: config.emailSenderName,
        emailActivationEnabled: config.email_activation_enabled ? '1' : '0',
        maintenanceMode: config.maintenanceMode ? '1' : '0',
        sessionTimeout: config.sessionTimeout.toString(),
        maxLoginAttempts: config.maxLoginAttempts.toString(),
        enableNativeLogin: config.enableNativeLogin ? '1' : '0',
        enableGoogleLogin: config.enableGoogleLogin ? '1' : '0',
        minPasswordLength: config.minPasswordLength.toString(),
        logRetentionDays: config.logRetentionDays.toString(),
        cleanupIntervalHours: config.cleanupIntervalHours.toString(),
        storageProvider: config.storageProvider
    };
};

// Fetch all system settings
export const getSystemSettings = async (token: string): Promise<SystemConfig> => {
    const response = await fetch(`${API_BASE_URL}/api/settings/`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.status}`);
    }

    const data = await response.json();
    return mapApiResponseToConfig(data);
};

// Update all system settings (bulk)
export const updateSystemSettings = async (settings: SystemConfig, token: string): Promise<void> => {
    const payload = mapConfigToApiPayload(settings);
    
    const response = await fetch(`${API_BASE_URL}/api/settings/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.status}`);
    }
};

// Upload avatar (for testing storage provider)
export const uploadAvatar = async (file: File, token: string): Promise<{ path: string; storage: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/settings/upload-avatar`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Failed to upload avatar: ${response.status}`);
    }

    return response.json();
};
