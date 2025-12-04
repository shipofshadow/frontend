import React, { useState, useEffect } from 'react';

// --- Types ---
interface SystemConfig {
    systemName: string;
    organizationName: string;
    supportEmail: string;
    supportPhone: string;
    isApplicationOpen: boolean;
    allowNewRegistrations: boolean;
    applicationStartDate: string;
    applicationEndDate: string;
    enableEmailAlerts: boolean;
    enableInAppNotifications: boolean;
    emailSenderName: string;
    maintenanceMode: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    enableNativeLogin: boolean;
    enableGoogleLogin: boolean;
    minPasswordLength: number;
    logRetentionDays: number;
    cleanupIntervalHours: number;
    storageProvider: 'local' | 's3';
}

const SystemSetting = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    const [config, setConfig] = useState<SystemConfig>({
        systemName: 'iScholarship Portal',
        organizationName: 'ISPSC - Scholarship Unit',
        supportEmail: 'scholarship@ispsc.edu.ph',
        supportPhone: '(077) 123-4567',
        isApplicationOpen: true,
        allowNewRegistrations: true,
        applicationStartDate: '2024-08-01',
        applicationEndDate: '2024-09-30',
        enableEmailAlerts: true,
        enableInAppNotifications: true,
        emailSenderName: 'ISPSC Scholarship Admin',
        maintenanceMode: false,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        enableNativeLogin: true,
        enableGoogleLogin: false,
        minPasswordLength: 8,
        logRetentionDays: 90,
        cleanupIntervalHours: 24,
        storageProvider: 'local'
    });

    useEffect(() => {
        setTimeout(() => setLoading(false), 800);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setConfig(prev => ({ ...prev, [name]: checked }));
        } else {
            setConfig(prev => ({ ...prev, [name]: value }));
        }
    };

    const updateConfig = (key: keyof SystemConfig, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const confirmSave = (e: React.FormEvent) => {
        e.preventDefault();
        setShowModal(true);
    };

    const handleFinalSave = () => {
        setShowModal(false);
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 3000);
        }, 1500);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="sr-only">Loading settings...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                /* Modern Card Shadows */
                .card-modern {
                    border-radius: 12px;
                    border: 1px solid #e8eaed;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }

                .card-modern:hover {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    transform: translateY(-2px);
                }

                /* Status Card Special */
                .status-card {
                    border-radius: 12px;
                    border: 2px solid;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                }

                /* Input Focus States */
                .form-control:focus {
                    border-color: #4a90e2;
                    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
                }

                /* Custom Switch Improvements */
                .custom-switch .custom-control-label::before {
                    height: 24px;
                    width: 44px;
                    border-radius: 12px;
                    background-color: #dee2e6;
                    transition: all 0.3s ease;
                }

                .custom-switch .custom-control-label::after {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                }

                .custom-switch .custom-control-input:checked ~ .custom-control-label::before {
                    background-color: #28a745;
                }

                /* Storage Option Cards */
                .storage-option {
                    border-radius: 10px;
                    border: 2px solid #e8eaed;
                    transition: all 0.25s ease;
                    cursor: pointer;
                }

                .storage-option:hover {
                    border-color: #c4c8cc;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                }

                .storage-option.active {
                    border-color: #4a90e2;
                    background-color: #f0f7ff !important;
                    box-shadow: 0 4px 16px rgba(74, 144, 226, 0.15);
                }

                .storage-option.active-s3 {
                    border-color: #ff9900;
                    background-color: #fff8f0 !important;
                    box-shadow: 0 4px 16px rgba(255, 153, 0, 0.15);
                }

                /* Badge Improvements */
                .badge-modern {
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.75rem;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }

                .badge-success-modern {
                    background-color: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }

                .badge-danger-modern {
                    background-color: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }

                /* Button Hover Effects */
                .btn {
                    transition: all 0.2s ease;
                    font-weight: 600;
                }

                .btn-primary {
                    border-radius: 8px;
                }

                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
                }

                /* Section Headers */
                .section-header {
                    padding: 20px 24px;
                    border-bottom: 2px solid #f8f9fa;
                }

                .section-header h6 {
                    margin: 0;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #2c3e50;
                }

                /* Form Labels */
                .form-label-modern {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #6c757d;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 8px;
                }

                /* Alert Boxes */
                .alert-modern {
                    border-radius: 8px;
                    border-left: 4px solid;
                    padding: 12px 16px;
                }

                /* Toast Notification */
                .toast-success {
                    position: fixed;
                    top: 24px;
                    right: 24px;
                    z-index: 9999;
                    min-width: 300px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                    border-left: 4px solid #28a745;
                    animation: slideIn 0.3s ease-out;
                }

                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                /* Modal Improvements */
                .modal-content {
                    border-radius: 12px;
                    border: none;
                }

                .modal-header {
                    padding: 24px;
                    border-bottom: 1px solid #e8eaed;
                }

                .modal-body {
                    padding: 24px;
                }

                .modal-footer {
                    padding: 16px 24px;
                    border-top: 1px solid #e8eaed;
                }

                /* Input Group Styling */
                .input-group-text {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #6c757d;
                }

                /* Card Body Padding */
                .card-body-modern {
                    padding: 24px;
                }
            `}</style>

            <div id="content-wrapper" className="d-flex flex-column" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                <div id="content">
                    <div className="container-fluid pb-5">

                        {/* Header Section */}
                        <div className="d-flex justify-content-between align-items-start mt-4 mb-4">
                            <div>

                                <h1 className="h2 text-dark font-weight-bold mt-3 mb-2">System Configuration</h1>
                                <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                                    Manage system parameters, security protocols, and operational preferences
                                </p>
                            </div>
                            <div>
                                <button
                                    onClick={confirmSave}
                                    className="btn btn-primary px-4 py-2"
                                    style={{ minWidth: '160px', borderRadius: '8px' }}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save mr-2"></i>
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <form onSubmit={confirmSave}>
                            {/* Top Row: Organization Info + Status */}
                            <div className="row mb-4">
                                {/* Organization Information */}
                                <div className="col-lg-8 mb-4 mb-lg-0">
                                    <div className="card card-modern h-100">
                                        <div className="section-header">
                                            <h6>
                                                <i className="fas fa-building mr-2" style={{ color: '#4a90e2' }}></i>
                                                Organization & Support Information
                                            </h6>
                                        </div>
                                        <div className="card-body-modern">
                                            <div className="row">
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label-modern">System Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="systemName"
                                                        value={config.systemName}
                                                        onChange={handleChange}
                                                        style={{ borderRadius: '8px' }}
                                                    />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label-modern">Organization Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="organizationName"
                                                        value={config.organizationName}
                                                        onChange={handleChange}
                                                        style={{ borderRadius: '8px' }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-6 mb-3 mb-md-0">
                                                    <label className="form-label-modern">Support Email</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        name="supportEmail"
                                                        value={config.supportEmail}
                                                        onChange={handleChange}
                                                        style={{ borderRadius: '8px' }}
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label-modern">Support Phone</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="supportPhone"
                                                        value={config.supportPhone}
                                                        onChange={handleChange}
                                                        style={{ borderRadius: '8px' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* System Status Card */}
                                <div className="col-lg-4">
                                    <div
                                        className={`card status-card h-100`}
                                        style={{
                                            borderColor: config.maintenanceMode ? '#dc3545' : '#28a745',
                                            backgroundColor: config.maintenanceMode ? '#fff5f5' : '#f0fff4'
                                        }}
                                    >
                                        <div className="card-body-modern">
                                            <div className="d-flex align-items-center justify-content-between mb-3">
                                                <h6 className="font-weight-bold text-dark mb-0">
                                                    <i className={`fas fa-circle mr-2`} style={{
                                                        fontSize: '0.6rem',
                                                        color: config.maintenanceMode ? '#dc3545' : '#28a745'
                                                    }}></i>
                                                    System Status
                                                </h6>
                                                <span className={`badge badge-modern ${config.maintenanceMode ? 'badge-danger-modern' : 'badge-success-modern'}`}>
                                                    {config.maintenanceMode ? 'OFFLINE' : 'ONLINE'}
                                                </span>
                                            </div>

                                            <div
                                                className="d-flex align-items-center justify-content-between p-3 mb-3"
                                                style={{
                                                    backgroundColor: 'white',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e8eaed'
                                                }}
                                            >
                                                <div>
                                                    <div className="font-weight-bold text-dark">Maintenance Mode</div>
                                                    <small className="text-muted">Restrict user access</small>
                                                </div>
                                                <div className="custom-control custom-switch" style={{ marginRight: '0' }}>
                                                    <input
                                                        type="checkbox"
                                                        className="custom-control-input"
                                                        id="maintenanceMode"
                                                        name="maintenanceMode"
                                                        checked={config.maintenanceMode}
                                                        onChange={handleChange}
                                                    />
                                                    <label className="custom-control-label" htmlFor="maintenanceMode"></label>
                                                </div>
                                            </div>

                                            <div
                                                className="p-3"
                                                style={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(0, 0, 0, 0.05)'
                                                }}
                                            >
                                                <small className="text-secondary d-block" style={{ lineHeight: '1.6' }}>
                                                    <i className={`fas ${config.maintenanceMode ? 'fa-lock' : 'fa-check-circle'} mr-1`}></i>
                                                    {config.maintenanceMode
                                                        ? "System is currently offline. Only administrators can access the platform."
                                                        : "System is operational. All users can access the platform normally."}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Grid */}
                            <div className="row">
                                {/* LEFT COLUMN */}
                                <div className="col-lg-6">

                                    {/* Application Period */}
                                    <div className="card card-modern mb-4">
                                        <div className="section-header d-flex justify-content-between align-items-center">
                                            <h6>
                                                <i className="fas fa-calendar-check mr-2" style={{ color: '#17a2b8' }}></i>
                                                Application Window
                                            </h6>
                                            <span className={`badge badge-modern ${config.isApplicationOpen ? 'badge-success-modern' : 'badge-danger-modern'}`}>
                                                {config.isApplicationOpen ? 'ACCEPTING' : 'CLOSED'}
                                            </span>
                                        </div>
                                        <div className="card-body-modern">
                                            <div className="row mb-3">
                                                <div className="col-md-6">
                                                    <div
                                                        className="p-3 text-center"
                                                        style={{
                                                            backgroundColor: '#f8f9fa',
                                                            borderRadius: '10px',
                                                            border: config.isApplicationOpen ? '2px solid #28a745' : '2px solid #dee2e6'
                                                        }}
                                                    >
                                                        <div className="custom-control custom-switch d-inline-block">
                                                            <input
                                                                type="checkbox"
                                                                className="custom-control-input"
                                                                id="isApplicationOpen"
                                                                name="isApplicationOpen"
                                                                checked={config.isApplicationOpen}
                                                                onChange={handleChange}
                                                            />
                                                            <label className="custom-control-label font-weight-bold" htmlFor="isApplicationOpen">
                                                                Accept Applications
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div
                                                        className="p-3 text-center"
                                                        style={{
                                                            backgroundColor: '#f8f9fa',
                                                            borderRadius: '10px',
                                                            border: config.allowNewRegistrations ? '2px solid #28a745' : '2px solid #dee2e6'
                                                        }}
                                                    >
                                                        <div className="custom-control custom-switch d-inline-block">
                                                            <input
                                                                type="checkbox"
                                                                className="custom-control-input"
                                                                id="allowNewRegistrations"
                                                                name="allowNewRegistrations"
                                                                checked={config.allowNewRegistrations}
                                                                onChange={handleChange}
                                                            />
                                                            <label className="custom-control-label font-weight-bold" htmlFor="allowNewRegistrations">
                                                                Allow Signups
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-6 mb-3 mb-md-0">
                                                    <label className="form-label-modern">Start Date</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        name="applicationStartDate"
                                                        value={config.applicationStartDate}
                                                        onChange={handleChange}
                                                        style={{ borderRadius: '8px' }}
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label-modern">End Date</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        name="applicationEndDate"
                                                        value={config.applicationEndDate}
                                                        onChange={handleChange}
                                                        style={{ borderRadius: '8px' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Storage Provider */}
                                    <div className="card card-modern mb-4">
                                        <div className="section-header">
                                            <h6>
                                                <i className="fas fa-database mr-2" style={{ color: '#6c757d' }}></i>
                                                File Storage Provider
                                            </h6>
                                        </div>
                                        <div className="card-body-modern">
                                            <div className="row">
                                                {/* Local Storage */}
                                                <div className="col-md-6 mb-3 mb-md-0">
                                                    <div
                                                        className={`storage-option p-4 text-center ${config.storageProvider === 'local' ? 'active' : ''}`}
                                                        onClick={() => updateConfig('storageProvider', 'local')}
                                                    >
                                                        <i
                                                            className="fas fa-server fa-3x mb-3"
                                                            style={{ color: config.storageProvider === 'local' ? '#4a90e2' : '#adb5bd' }}
                                                        ></i>
                                                        <h6 className={`font-weight-bold mb-1 ${config.storageProvider === 'local' ? 'text-primary' : 'text-secondary'}`}>
                                                            Local Server
                                                        </h6>
                                                        <small className="text-muted d-block">public/uploads</small>
                                                        {config.storageProvider === 'local' && (
                                                            <div className="mt-2">
                                                                <i className="fas fa-check-circle text-primary"></i>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* AWS S3 */}
                                                <div className="col-md-6">
                                                    <div
                                                        className={`storage-option p-4 text-center ${config.storageProvider === 's3' ? 'active-s3' : ''}`}
                                                        onClick={() => updateConfig('storageProvider', 's3')}
                                                    >
                                                        <i
                                                            className="fab fa-aws fa-3x mb-3"
                                                            style={{ color: config.storageProvider === 's3' ? '#ff9900' : '#adb5bd' }}
                                                        ></i>
                                                        <h6 className={`font-weight-bold mb-1`} style={{ color: config.storageProvider === 's3' ? '#ff9900' : '#6c757d' }}>
                                                            AWS S3 Cloud
                                                        </h6>
                                                        <small className="text-muted d-block">Cloud Bucket</small>
                                                        {config.storageProvider === 's3' && (
                                                            <div className="mt-2">
                                                                <i className="fas fa-check-circle" style={{ color: '#ff9900' }}></i>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Data Retention */}
                                    <div className="card card-modern mb-4">
                                        <div className="section-header">
                                            <h6>
                                                <i className="fas fa-clock mr-2" style={{ color: '#6f42c1' }}></i>
                                                Data Retention Policy
                                            </h6>
                                        </div>
                                        <div className="card-body-modern">
                                            <div className="row">
                                                <div className="col-md-6 mb-3 mb-md-0">
                                                    <label className="form-label-modern">Log Retention (Days)</label>
                                                    <div className="input-group">
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            name="logRetentionDays"
                                                            value={config.logRetentionDays}
                                                            onChange={handleChange}
                                                            style={{ borderRadius: '8px 0 0 8px' }}
                                                        />
                                                        <div className="input-group-append">
                                                            <span className="input-group-text" style={{ borderRadius: '0 8px 8px 0' }}>days</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label-modern">Cleanup Interval (Hours)</label>
                                                    <div className="input-group">
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            name="cleanupIntervalHours"
                                                            value={config.cleanupIntervalHours}
                                                            onChange={handleChange}
                                                            style={{ borderRadius: '8px 0 0 8px' }}
                                                        />
                                                        <div className="input-group-append">
                                                            <span className="input-group-text" style={{ borderRadius: '0 8px 8px 0' }}>hrs</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* RIGHT COLUMN */}
                                <div className="col-lg-6">

                                    {/* Security & Authentication */}
                                    <div className="card card-modern mb-4">
                                        <div className="section-header">
                                            <h6>
                                                <i className="fas fa-shield-alt mr-2" style={{ color: '#dc3545' }}></i>
                                                Security & Authentication
                                            </h6>
                                        </div>
                                        <div className="card-body-modern">
                                            {/* Auth Methods */}
                                            <div
                                                className="p-3 mb-4"
                                                style={{
                                                    backgroundColor: '#f8f9fa',
                                                    borderRadius: '10px'
                                                }}
                                            >
                                                <label className="form-label-modern mb-3">Authentication Methods</label>
                                                <div className="row">
                                                    <div className="col-md-6 mb-3 mb-md-0">
                                                        <div className="custom-control custom-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                className="custom-control-input"
                                                                id="enableNativeLogin"
                                                                name="enableNativeLogin"
                                                                checked={config.enableNativeLogin}
                                                                onChange={handleChange}
                                                            />
                                                            <label className="custom-control-label font-weight-bold" htmlFor="enableNativeLogin">
                                                                <i className="fas fa-envelope mr-2 text-primary"></i>
                                                                Email/Password
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="custom-control custom-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                className="custom-control-input"
                                                                id="enableGoogleLogin"
                                                                name="enableGoogleLogin"
                                                                checked={config.enableGoogleLogin}
                                                                onChange={handleChange}
                                                            />
                                                            <label className="custom-control-label font-weight-bold" htmlFor="enableGoogleLogin">
                                                                <i className="fab fa-google mr-2" style={{ color: '#ea4335' }}></i>
                                                                Google OAuth
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Security Parameters */}
                                            <div className="row">
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label-modern">Min Password</label>
                                                    <div className="input-group">
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            name="minPasswordLength"
                                                            value={config.minPasswordLength}
                                                            onChange={handleChange}
                                                            min="6"
                                                            max="32"
                                                            style={{ borderRadius: '8px 0 0 8px' }}
                                                        />
                                                        <div className="input-group-append">
                                                            <span className="input-group-text" style={{ borderRadius: '0 8px 8px 0' }}>chars</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label-modern">Max Attempts</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="maxLoginAttempts"
                                                        value={config.maxLoginAttempts}
                                                        onChange={handleChange}
                                                        style={{ borderRadius: '8px' }}
                                                    />
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label-modern">Session Timeout</label>
                                                    <div className="input-group">
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            name="sessionTimeout"
                                                            value={config.sessionTimeout}
                                                            onChange={handleChange}
                                                            style={{ borderRadius: '8px 0 0 8px' }}
                                                        />
                                                        <div className="input-group-append">
                                                            <span className="input-group-text" style={{ borderRadius: '0 8px 8px 0' }}>min</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notifications */}
                                    <div className="card card-modern mb-4">
                                        <div className="section-header">
                                            <h6>
                                                <i className="fas fa-bell mr-2" style={{ color: '#ffc107' }}></i>
                                                Notification Settings
                                            </h6>
                                        </div>
                                        <div className="card-body-modern">
                                            <div className="form-group">
                                                <label className="form-label-modern">Email Sender Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="emailSenderName"
                                                    value={config.emailSenderName}
                                                    onChange={handleChange}
                                                    style={{ borderRadius: '8px' }}
                                                />
                                            </div>

                                            <div
                                                className="p-3 mt-3"
                                                style={{
                                                    backgroundColor: '#f8f9fa',
                                                    borderRadius: '10px'
                                                }}
                                            >
                                                <label className="form-label-modern mb-3">Notification Channels</label>
                                                <div className="row">
                                                    <div className="col-md-6 mb-2">
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <span className="font-weight-bold">
                                                                <i className="fas fa-envelope mr-2 text-info"></i>
                                                                Email Alerts
                                                            </span>
                                                            <div className="custom-control custom-switch">
                                                                <input
                                                                    type="checkbox"
                                                                    className="custom-control-input"
                                                                    id="enableEmailAlerts"
                                                                    name="enableEmailAlerts"
                                                                    checked={config.enableEmailAlerts}
                                                                    onChange={handleChange}
                                                                />
                                                                <label className="custom-control-label" htmlFor="enableEmailAlerts"></label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-2">
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <span className="font-weight-bold">
                                                                <i className="fas fa-bell mr-2 text-warning"></i>
                                                                In-App Alerts
                                                            </span>
                                                            <div className="custom-control custom-switch">
                                                                <input
                                                                    type="checkbox"
                                                                    className="custom-control-input"
                                                                    id="enableInAppNotifications"
                                                                    name="enableInAppNotifications"
                                                                    checked={config.enableInAppNotifications}
                                                                    onChange={handleChange}
                                                                />
                                                                <label className="custom-control-label" htmlFor="enableInAppNotifications"></label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Success Toast */}
                {showSuccessToast && (
                    <div className="toast-success">
                        <div className="d-flex align-items-center p-3">
                            <div className="mr-3">
                                <i className="fas fa-check-circle fa-2x text-success"></i>
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="font-weight-bold mb-1">Changes Saved Successfully</h6>
                                <p className="text-muted mb-0 small">System configuration has been updated.</p>
                            </div>
                            <button
                                type="button"
                                className="close ml-3"
                                onClick={() => setShowSuccessToast(false)}
                                style={{ fontSize: '1.5rem' }}
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Enhanced Confirmation Modal */}
                {showModal && (
                    <>
                        <div className="modal-backdrop fade show"></div>
                        <div className="modal fade show d-block" tabIndex={-1} role="dialog">
                            <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxWidth: '500px' }}>
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <div className="d-flex align-items-center">
                                            <div
                                                className="mr-3 d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    backgroundColor: '#e3f2fd',
                                                    borderRadius: '12px'
                                                }}
                                            >
                                                <i className="fas fa-exclamation-circle fa-lg" style={{ color: '#4a90e2' }}></i>
                                            </div>
                                            <div>
                                                <h5 className="modal-title font-weight-bold mb-0">Confirm Configuration Changes</h5>
                                                <small className="text-muted">Review your changes before saving</small>
                                            </div>
                                        </div>
                                        <button type="button" className="close ml-2" onClick={() => setShowModal(false)} style={{ fontSize: '1.5rem' }}>
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <p className="text-secondary mb-3">
                                            You are about to update the system configuration. This will affect all users and operations.
                                        </p>

                                        {/* Conditional Warnings */}
                                        {config.maintenanceMode && (
                                            <div className="alert alert-modern alert-warning mb-3" style={{ borderLeftColor: '#ffc107' }}>
                                                <div className="d-flex">
                                                    <i className="fas fa-exclamation-triangle mt-1 mr-2" style={{ color: '#ffc107' }}></i>
                                                    <div>
                                                        <strong>Maintenance Mode Enabled</strong>
                                                        <p className="mb-0 small mt-1">All users except administrators will be locked out of the system.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {config.storageProvider === 's3' && (
                                            <div className="alert alert-modern alert-info mb-3" style={{ borderLeftColor: '#17a2b8' }}>
                                                <div className="d-flex">
                                                    <i className="fas fa-info-circle mt-1 mr-2" style={{ color: '#17a2b8' }}></i>
                                                    <div>
                                                        <strong>AWS S3 Storage Selected</strong>
                                                        <p className="mb-0 small mt-1">Ensure your AWS credentials are properly configured in environment variables.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {!config.enableNativeLogin && !config.enableGoogleLogin && (
                                            <div className="alert alert-modern alert-danger mb-3" style={{ borderLeftColor: '#dc3545' }}>
                                                <div className="d-flex">
                                                    <i className="fas fa-times-circle mt-1 mr-2" style={{ color: '#dc3545' }}></i>
                                                    <div>
                                                        <strong>No Authentication Method Enabled</strong>
                                                        <p className="mb-0 small mt-1">Users will not be able to log in. Enable at least one authentication method.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {(!config.maintenanceMode && !config.storageProvider) && (
                                            <p className="text-muted small mb-0">
                                                <i className="fas fa-check-circle text-success mr-1"></i>
                                                No critical warnings detected.
                                            </p>
                                        )}
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-light px-4"
                                            onClick={() => setShowModal(false)}
                                            style={{ borderRadius: '8px' }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary px-4"
                                            onClick={handleFinalSave}
                                            style={{ borderRadius: '8px' }}
                                        >
                                            <i className="fas fa-check mr-2"></i>
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default SystemSetting;
