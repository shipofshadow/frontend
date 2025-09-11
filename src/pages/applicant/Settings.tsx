import React, { useState } from 'react';

interface FormData {
    email: string;
    phone: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'account' | 'password' | 'notifications'>('account');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [formData, setFormData] = useState<FormData>({
        email: 'john.doe@example.com',
        phone: '+63 912 345 6789',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [notifications, setNotifications] = useState({
        emailUpdates: true,
        smsAlerts: false,
        pushNotifications: true,
        academicReminders: true
    });

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNotificationChange = (field: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        // Show success message (you'd handle this with your notification system)
        console.log('Form submitted successfully');
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-xl-8 col-lg-10">
                    {/* Header */}
                    <div className="mb-4">
                        <h2 className="fw-bold mb-1">Settings</h2>
                        <p className="text-muted mb-0">Manage your account preferences and security settings</p>
                    </div>

                    <div className="card shadow-sm border-0 rounded-4">
                        {/* Navigation Tabs */}
                        <div className="card-header border-0 bg-light bg-opacity-50 rounded-top-4">
                            <ul className="nav nav-pills nav-fill" role="tablist">
                                <li className="nav-item" role="presentation">
                                    <button
                                        className={`nav-link rounded-3 fw-medium ${activeTab === 'account' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('account')}
                                        type="button"
                                    >
                                        <i className="bi bi-person-gear me-2"></i>
                                        Account Info
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button
                                        className={`nav-link rounded-3 fw-medium ${activeTab === 'password' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('password')}
                                        type="button"
                                    >
                                        <i className="bi bi-shield-lock me-2"></i>
                                        Security
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button
                                        className={`nav-link rounded-3 fw-medium ${activeTab === 'notifications' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('notifications')}
                                        type="button"
                                    >
                                        <i className="bi bi-bell me-2"></i>
                                        Notifications
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div className="card-body p-4 p-md-5">
                            {/* Account Information Tab */}
                            {activeTab === 'account' && (
                                <div className="tab-content">
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                                            <i className="bi bi-person-gear fs-4 text-primary"></i>
                                        </div>
                                        <div>
                                            <h4 className="mb-1 fw-bold">Account Information</h4>
                                            <p className="text-muted mb-0">Update your personal details and contact information</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit}>
                                        <div className="row g-4">
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">
                                                    <i className="bi bi-envelope me-1 text-primary"></i>
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    className="form-control form-control-lg"
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    placeholder="your@email.com"
                                                />
                                                <div className="form-text">
                                                    <i className="bi bi-info-circle me-1"></i>
                                                    We'll send verification to your new email
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">
                                                    <i className="bi bi-telephone me-1 text-primary"></i>
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    className="form-control form-control-lg"
                                                    value={formData.phone}
                                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                                    placeholder="+63 9xx xxx xxxx"
                                                />
                                                <div className="form-text">
                                                    <i className="bi bi-shield-check me-1"></i>
                                                    Used for security notifications
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="my-4" />

                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted">
                                                    <i className="bi bi-clock-history me-1"></i>
                                                    Last updated: March 15, 2024
                                                </small>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button type="button" className="btn btn-outline-secondary">
                                                    <i className="bi bi-arrow-clockwise me-1"></i>
                                                    Reset
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-check-lg me-1"></i>
                                                            Save Changes
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Password Tab */}
                            {activeTab === 'password' && (
                                <div className="tab-content">
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="bg-danger bg-opacity-10 rounded-circle p-3 me-3">
                                            <i className="bi bi-shield-lock fs-4 text-danger"></i>
                                        </div>
                                        <div>
                                            <h4 className="mb-1 fw-bold">Security Settings</h4>
                                            <p className="text-muted mb-0">Update your password and security preferences</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit}>
                                        <div className="row g-4">
                                            <div className="col-12">
                                                <label className="form-label fw-medium">
                                                    <i className="bi bi-key me-1 text-danger"></i>
                                                    Current Password
                                                </label>
                                                <div className="input-group">
                                                    <input
                                                        type={showPassword.current ? 'text' : 'password'}
                                                        className="form-control form-control-lg"
                                                        value={formData.currentPassword}
                                                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                                                        placeholder="Enter your current password"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => togglePasswordVisibility('current')}
                                                    >
                                                        <i className={`bi bi-eye${showPassword.current ? '-slash' : ''}`}></i>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">
                                                    <i className="bi bi-shield-plus me-1 text-success"></i>
                                                    New Password
                                                </label>
                                                <div className="input-group">
                                                    <input
                                                        type={showPassword.new ? 'text' : 'password'}
                                                        className="form-control form-control-lg"
                                                        value={formData.newPassword}
                                                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                                        placeholder="Enter new password"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => togglePasswordVisibility('new')}
                                                    >
                                                        <i className={`bi bi-eye${showPassword.new ? '-slash' : ''}`}></i>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">
                                                    <i className="bi bi-shield-check me-1 text-success"></i>
                                                    Confirm New Password
                                                </label>
                                                <div className="input-group">
                                                    <input
                                                        type={showPassword.confirm ? 'text' : 'password'}
                                                        className="form-control form-control-lg"
                                                        value={formData.confirmPassword}
                                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                                        placeholder="Confirm new password"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => togglePasswordVisibility('confirm')}
                                                    >
                                                        <i className={`bi bi-eye${showPassword.confirm ? '-slash' : ''}`}></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Password Requirements */}
                                        <div className="mt-3">
                                            <div className="card bg-light border-0">
                                                <div className="card-body p-3">
                                                    <h6 className="card-title mb-2">
                                                        <i className="bi bi-info-circle me-1"></i>
                                                        Password Requirements:
                                                    </h6>
                                                    <div className="row g-2">
                                                        <div className="col-md-6">
                                                            <small className="text-muted d-flex align-items-center">
                                                                <i className="bi bi-check-circle-fill text-success me-1"></i>
                                                                At least 8 characters
                                                            </small>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <small className="text-muted d-flex align-items-center">
                                                                <i className="bi bi-x-circle-fill text-danger me-1"></i>
                                                                One uppercase letter
                                                            </small>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <small className="text-muted d-flex align-items-center">
                                                                <i className="bi bi-check-circle-fill text-success me-1"></i>
                                                                One number
                                                            </small>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <small className="text-muted d-flex align-items-center">
                                                                <i className="bi bi-x-circle-fill text-danger me-1"></i>
                                                                One special character
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="my-4" />

                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted">
                                                    <i className="bi bi-shield-check me-1"></i>
                                                    Last password change: January 20, 2024
                                                </small>
                                            </div>
                                            <button
                                                type="submit"
                                                className="btn btn-danger"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-shield-lock me-1"></i>
                                                        Update Password
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div className="tab-content">
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                                            <i className="bi bi-bell fs-4 text-info"></i>
                                        </div>
                                        <div>
                                            <h4 className="mb-1 fw-bold">Notification Preferences</h4>
                                            <p className="text-muted mb-0">Choose how you'd like to receive updates and alerts</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit}>
                                        <div className="row g-4">
                                            <div className="col-12">
                                                <div className="card border-0 bg-light">
                                                    <div className="card-body p-4">
                                                        <div className="row g-3">
                                                            <div className="col-md-6">
                                                                <div className="form-check form-switch d-flex align-items-center">
                                                                    <input
                                                                        className="form-check-input me-3"
                                                                        type="checkbox"
                                                                        checked={notifications.emailUpdates}
                                                                        onChange={() => handleNotificationChange('emailUpdates')}
                                                                        id="emailUpdates"
                                                                    />
                                                                    <div className="flex-grow-1">
                                                                        <label className="form-check-label fw-medium" htmlFor="emailUpdates">
                                                                            <i className="bi bi-envelope me-1 text-primary"></i>
                                                                            Email Updates
                                                                        </label>
                                                                        <div className="form-text mb-0">Receive general updates via email</div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="col-md-6">
                                                                <div className="form-check form-switch d-flex align-items-center">
                                                                    <input
                                                                        className="form-check-input me-3"
                                                                        type="checkbox"
                                                                        checked={notifications.smsAlerts}
                                                                        onChange={() => handleNotificationChange('smsAlerts')}
                                                                        id="smsAlerts"
                                                                    />
                                                                    <div className="flex-grow-1">
                                                                        <label className="form-check-label fw-medium" htmlFor="smsAlerts">
                                                                            <i className="bi bi-chat-dots me-1 text-success"></i>
                                                                            SMS Alerts
                                                                        </label>
                                                                        <div className="form-text mb-0">Critical alerts via text message</div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="col-md-6">
                                                                <div className="form-check form-switch d-flex align-items-center">
                                                                    <input
                                                                        className="form-check-input me-3"
                                                                        type="checkbox"
                                                                        checked={notifications.pushNotifications}
                                                                        onChange={() => handleNotificationChange('pushNotifications')}
                                                                        id="pushNotifications"
                                                                    />
                                                                    <div className="flex-grow-1">
                                                                        <label className="form-check-label fw-medium" htmlFor="pushNotifications">
                                                                            <i className="bi bi-app-indicator me-1 text-warning"></i>
                                                                            Push Notifications
                                                                        </label>
                                                                        <div className="form-text mb-0">Browser push notifications</div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="col-md-6">
                                                                <div className="form-check form-switch d-flex align-items-center">
                                                                    <input
                                                                        className="form-check-input me-3"
                                                                        type="checkbox"
                                                                        checked={notifications.academicReminders}
                                                                        onChange={() => handleNotificationChange('academicReminders')}
                                                                        id="academicReminders"
                                                                    />
                                                                    <div className="flex-grow-1">
                                                                        <label className="form-check-label fw-medium" htmlFor="academicReminders">
                                                                            <i className="bi bi-calendar-check me-1 text-info"></i>
                                                                            Academic Reminders
                                                                        </label>
                                                                        <div className="form-text mb-0">Assignment and exam reminders</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="my-4" />

                                        <div className="d-flex justify-content-end">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-check-lg me-1"></i>
                                                        Save Preferences
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;