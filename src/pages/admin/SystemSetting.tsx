import React, { useState, useEffect } from 'react';
import {Settings, Shield} from "lucide-react";
import Swal from 'sweetalert2';
import { useAuth } from "../../context/AuthContext.tsx";
import { 
    getSystemSettings, 
    updateSystemSettings,
    type SystemConfig 
} from "../../services/settingsService.ts";

const SystemSetting = () => {
    const { token, isAdmin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingConfig, setPendingConfig] = useState<SystemConfig | null>(null);

    // Initial config state (will be replaced by API data)
    const [config, setConfig] = useState<SystemConfig>({
        systemName: '',
        organizationName: '',
        supportEmail: '',
        supportPhone: '',
        isApplicationOpen: false,
        allowNewRegistrations: false,
        applicationStartDate: '',
        applicationEndDate: '',
        enableEmailAlerts: false,
        enableInAppNotifications: false,
        emailSenderName: '',
        emailActivationEnabled: false,
        maintenanceMode: false,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        enableNativeLogin: true,
        enableGoogleLogin: true,
        minPasswordLength: 8,
        logRetentionDays: 90,
        cleanupIntervalHours: 24,
        storageProvider: 'local'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            
            setLoading(true);
            try {
                const data = await getSystemSettings(token);
                setConfig(data);
            } catch (error) {
                console.error('Failed to fetch settings:', error);

            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setConfig(prev => ({ ...prev, [name]: checked }));
        } else {
            setConfig(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleStorageChange = (provider: 'local' | 's3') => {
        setConfig(prev => ({ ...prev, storageProvider: provider }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setPendingConfig(config);
        setShowConfirmModal(true);
    };

    const confirmSave = async () => {
        setShowConfirmModal(false);
        setSaving(true);
        
        if (!token) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Authentication required. Please log in again.'
            });
            setSaving(false);
            return;
        }
        
        try {
            await updateSystemSettings(config, token);
            setSuccessMsg("System configuration saved successfully.");
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to save system settings. Please try again.'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="spinner-border text-primary" role="status">
            </div>
        </div>
    );

    if (!isAdmin) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="text-center">
                    <Shield size={64} className="text-danger mb-3" />
                    <h3 className="text-danger">Access Denied</h3>
                    <p className="text-muted">`This feature is only accessible to Bitress administrators.`</p>
                </div>
            </div>
        );
    }


    return (
        <div className="min-vh-100 bg-gray-50 text-dark">
            {/* Header */}
            <header className="bg-white border-bottom sticky-top shadow-sm" style={{ zIndex: 20 }}>
                <div className="container-fluid px-4">
                    <div className="d-flex justify-content-between align-items-center py-3">
                        <div className="d-flex align-items-center" style={{ gap: '1rem' }}>
                            <div className="bg-primary text-white p-2 rounded shadow-sm d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                                <Settings size={24} />
                            </div>
                            <div>
                                <h1 className="h5 font-weight-bold text-dark mb-0">System Configuration</h1>
                                <p className="text-muted small mb-0">Manage global settings, security policies, and storage preferences</p>
                            </div>
                        </div>
                        <div className={`px-3 py-2 rounded border ${config.maintenanceMode ? 'border-danger bg-danger text-white' : 'border-success bg-success text-white'}`} style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                            <i className={`fas fa-${config.maintenanceMode ? 'exclamation-triangle' : 'check-circle'} mr-2`}></i>
                            {config.maintenanceMode ? 'MAINTENANCE' : 'OPERATIONAL'}
                        </div>
                    </div>
                </div>
            </header>

            {successMsg && (
                <div className="container-fluid px-4 pt-3">
                    <div className="alert alert-success alert-dismissible fade show border-0 shadow-sm" role="alert">
                        <div className="d-flex align-items-center">
                            <i className="fas fa-check-circle fa-lg mr-3"></i>
                            <span>{successMsg}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="container-fluid px-4 py-4">
                <form onSubmit={handleSave}>
                    <div className="row">
                        {/* Column 1 */}
                        <div className="col-lg-6 mb-4">
                            {/* Storage Configuration */}
                            <div className="card shadow-sm mb-4 border-0 rounded">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h6 className="m-0 font-weight-bold text-primary d-flex align-items-center">
                                        <i className="fas fa-hdd mr-2"></i> Storage Provider
                                    </h6>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row">
                                        <div className="col-md-6 mb-3 mb-md-0">
                                            <div
                                                className={`p-4 border rounded-lg text-center position-relative ${config.storageProvider === 'local' ? 'border-primary shadow-sm' : 'border-light'}`}
                                                onClick={() => handleStorageChange('local')}
                                                style={{
                                                    cursor: 'pointer',
                                                    borderWidth: '2px',
                                                    backgroundColor: config.storageProvider === 'local' ? '#f0f4ff' : 'white',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {config.storageProvider === 'local' && (
                                                    <div className="position-absolute" style={{ top: '12px', right: '12px' }}>
                                                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                                                            <i className="fas fa-check" style={{ fontSize: '12px' }}></i>
                                                        </div>
                                                    </div>
                                                )}
                                                <i className="fas fa-server fa-3x text-primary mb-3"></i>
                                                <h6 className="font-weight-bold text-dark mb-2">Local Server</h6>
                                                <small className="text-muted">Fast access, uses disk space</small>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div
                                                className={`p-4 border rounded-lg text-center position-relative ${config.storageProvider === 's3' ? 'border-warning shadow-sm' : 'border-light'}`}
                                                onClick={() => handleStorageChange('s3')}
                                                style={{
                                                    cursor: 'pointer',
                                                    borderWidth: '2px',
                                                    backgroundColor: config.storageProvider === 's3' ? '#fffbf0' : 'white',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {config.storageProvider === 's3' && (
                                                    <div className="position-absolute" style={{ top: '12px', right: '12px' }}>
                                                        <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                                                            <i className="fas fa-check" style={{ fontSize: '12px' }}></i>
                                                        </div>
                                                    </div>
                                                )}
                                                <i className="fab fa-aws fa-3x text-warning mb-3"></i>
                                                <h6 className="font-weight-bold text-dark mb-2">AWS S3 Bucket</h6>
                                                <small className="text-muted">Scalable cloud storage</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Authentication & Security */}
                            <div className="card shadow-sm mb-4 border-0 rounded">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h6 className="m-0 font-weight-bold text-dark d-flex align-items-center">
                                        <i className="fas fa-shield-alt mr-2"></i> Authentication & Security
                                    </h6>
                                </div>
                                <div className="card-body p-4">
                                    {/* Standard Login */}
                                    <div className="mb-4 pb-4 border-bottom">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div className="flex-grow-1 pr-3">
                                                <label className="font-weight-bold mb-1 d-block text-dark">Standard Login</label>
                                                <small className="text-muted">Allow users to login with Email & Password</small>
                                            </div>
                                            <label className="switch mb-0">
                                                <input type="checkbox" name="enableNativeLogin" checked={config.enableNativeLogin} onChange={handleChange} />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Google OAuth */}
                                    <div className="mb-4 pb-4 border-bottom">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div className="flex-grow-1 pr-3">
                                                <label className="font-weight-bold mb-1 d-block text-dark">
                                                    <i className="fab fa-google text-danger mr-2"></i>Google OAuth
                                                </label>
                                                <small className="text-muted">Enable single sign-on via Google accounts</small>
                                            </div>
                                            <label className="switch mb-0">
                                                <input type="checkbox" name="enableGoogleLogin" checked={config.enableGoogleLogin} onChange={handleChange} />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                    </div>
                                     <div className="mb-4 pb-4 border-bottom">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div className="flex-grow-1 pr-3">
                                                <label className="font-weight-bold mb-1 d-block text-dark">
                                                    <i className="fal fa-envelope  mr-2"></i>Send Activation Email
                                                </label>
                                                <small className="text-muted">Automatically send an email verification link to new users upon registration.</small>
                                            </div>
                                            <label className="switch mb-0">
                                                <input type="checkbox" name="emailActivationEnabled" checked={config.emailActivationEnabled} onChange={handleChange} />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Security Policies */}
                                    <div className="bg-light p-4 rounded">
                                        <h6 className="font-weight-bold text-dark mb-3">Security Policies</h6>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="small font-weight-bold text-dark mb-2 d-block">Minimum Password Length</label>
                                                <div className="input-group input-group-modern">
                                                    <div className="input-group-prepend">
                                                        <span className="input-group-text border-0 bg-white">
                                                            <i className="fas fa-key text-primary"></i>
                                                        </span>
                                                    </div>
                                                    <input type="number" className="form-control form-control-modern border-0" name="minPasswordLength" value={config.minPasswordLength} onChange={handleChange} min="6" />
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="small font-weight-bold text-dark mb-2 d-block">Session Timeout (min)</label>
                                                <div className="input-group input-group-modern">
                                                    <div className="input-group-prepend">
                                                        <span className="input-group-text border-0 bg-white">
                                                            <i className="fas fa-clock text-primary"></i>
                                                        </span>
                                                    </div>
                                                    <input type="number" className="form-control form-control-modern border-0" name="sessionTimeout" value={config.sessionTimeout} onChange={handleChange} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="card shadow-sm mb-4 border-0 rounded">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h6 className="m-0 font-weight-bold text-dark d-flex align-items-center">
                                        <i className="fas fa-info-circle mr-2"></i> Contact Information
                                    </h6>
                                </div>
                                <div className="card-body p-4">
                                    <div className="form-group mb-3">
                                        <label className="font-weight-bold text-dark mb-2">Support Email</label>
                                        <div className="input-group input-group-modern">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text border-0 bg-white">
                                                    <i className="fas fa-envelope text-primary"></i>
                                                </span>
                                            </div>
                                            <input type="email" className="form-control form-control-modern border-0" name="supportEmail" value={config.supportEmail} onChange={handleChange} placeholder="email@domain.com" />
                                        </div>
                                    </div>
                                    <div className="form-group mb-0">
                                        <label className="font-weight-bold text-dark mb-2">Support Phone</label>
                                        <div className="input-group input-group-modern">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text border-0 bg-white">
                                                    <i className="fas fa-phone text-primary"></i>
                                                </span>
                                            </div>
                                            <input type="text" className="form-control form-control-modern border-0" name="supportPhone" value={config.supportPhone} onChange={handleChange} placeholder="(000) 000-0000" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="col-lg-6 mb-4">
                            {/* Application Period */}
                            <div className="card shadow-sm mb-4 border-0 rounded border-left border-info" style={{ borderLeftWidth: '4px !important' }}>
                                <div className="card-header bg-white border-bottom py-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h6 className="m-0 font-weight-bold text-info d-flex align-items-center">
                                            <i className="fas fa-calendar-alt mr-2"></i> Application Period
                                        </h6>
                                        <span className={`badge px-3 py-2 ${config.isApplicationOpen ? 'badge-success' : 'badge-secondary'}`} style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                                            {config.isApplicationOpen ? 'ACCEPTING' : 'CLOSED'}
                                        </span>
                                    </div>
                                </div>
                                <div className="card-body p-4">
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div className="flex-grow-1 pr-3">
                                                <label className="font-weight-bold mb-1 d-block text-dark">Open Application Portal</label>
                                                <small className="text-muted">Students can create and submit applications</small>
                                            </div>
                                            <label className="switch mb-0">
                                                <input type="checkbox" name="isApplicationOpen" checked={config.isApplicationOpen} onChange={handleChange} />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="bg-light p-4 rounded">
                                        <h6 className="font-weight-bold text-dark mb-3">Application Window</h6>
                                        <div className="row">
                                            <div className="col-md-6 mb-3 mb-md-0">
                                                <label className="small font-weight-bold text-dark mb-2">Start Date</label>
                                                <input type="date" className="form-control form-control-modern" name="applicationStartDate" value={config.applicationStartDate} onChange={handleChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="small font-weight-bold text-dark mb-2">End Date</label>
                                                <input type="date" className="form-control form-control-modern" name="applicationEndDate" value={config.applicationEndDate} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notifications */}
                            <div className="card shadow-sm mb-4 border-0 rounded">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h6 className="m-0 font-weight-bold text-dark d-flex align-items-center">
                                        <i className="fas fa-bell mr-2"></i> Notifications
                                    </h6>
                                </div>
                                <div className="card-body p-4">
                                    <div className="form-group mb-4">
                                        <label className="font-weight-bold text-dark mb-2">Email Sender Name</label>
                                        <input type="text" className="form-control form-control-modern" name="emailSenderName" value={config.emailSenderName} onChange={handleChange} placeholder="Organization Name" />
                                    </div>

                                    <div className="border-top pt-4">
                                        <h6 className="font-weight-bold text-dark mb-3">Notification Channels</h6>
                                        <div className="custom-checkbox-wrapper mb-3">
                                            <label className="custom-checkbox-container">
                                                <input type="checkbox" name="enableEmailAlerts" checked={config.enableEmailAlerts} onChange={handleChange} />
                                                <span className="checkmark"></span>
                                                <div className="checkbox-content">
                                                    <span className="font-weight-bold text-dark d-block">Email Alerts</span>
                                                    <small className="text-muted">Send notifications via SMTP</small>
                                                </div>
                                            </label>
                                        </div>
                                        <div className="custom-checkbox-wrapper">
                                            <label className="custom-checkbox-container">
                                                <input type="checkbox" name="enableInAppNotifications" checked={config.enableInAppNotifications} onChange={handleChange} />
                                                <span className="checkmark"></span>
                                                <div className="checkbox-content">
                                                    <span className="font-weight-bold text-dark d-block">In-App Notifications</span>
                                                    <small className="text-muted">Display popup messages</small>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Data Management */}
                            <div className="card shadow-sm mb-4 border-0 rounded">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h6 className="m-0 font-weight-bold text-dark d-flex align-items-center">
                                        <i className="fas fa-database mr-2"></i> Data Management
                                    </h6>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="font-weight-bold text-dark mb-2">Log Retention (Days)</label>
                                            <input type="number" className="form-control form-control-modern" name="logRetentionDays" value={config.logRetentionDays} onChange={handleChange} />
                                            <small className="text-muted">How long to keep system logs</small>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="font-weight-bold text-dark mb-2">Cleanup Interval (Hours)</label>
                                            <input type="number" className="form-control form-control-modern" name="cleanupIntervalHours" value={config.cleanupIntervalHours} onChange={handleChange} />
                                            <small className="text-muted">Automatic cleanup frequency</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="card shadow-sm border-danger rounded" style={{ borderWidth: '2px' }}>
                                <div className="card-header bg-danger text-white py-3">
                                    <h6 className="m-0 font-weight-bold d-flex align-items-center">
                                        <i className="fas fa-exclamation-triangle mr-2"></i> Danger Zone
                                    </h6>
                                </div>
                                <div className="card-body p-4 bg-light">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1 pr-3">
                                            <h6 className="font-weight-bold text-danger mb-2">Maintenance Mode</h6>
                                            <p className="small text-muted mb-0">
                                                <i className="fas fa-info-circle mr-1"></i>
                                                Blocks all non-admin access during updates
                                            </p>
                                        </div>
                                        <label className="switch mb-0">
                                            <input type="checkbox" name="maintenanceMode" checked={config.maintenanceMode} onChange={handleChange} />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sticky Bottom Bar */}
                    <div className="card shadow-lg position-sticky border-0 rounded" style={{ bottom: '20px', zIndex: 100 }}>
                        <div className="card-body py-3 px-4">
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-info-circle text-primary mr-2"></i>
                                    <span className="text-dark">Changes take effect immediately upon saving</span>
                                </div>
                                <button type="submit" className="btn btn-primary px-4 py-2 shadow-sm" disabled={saving} style={{ fontWeight: 600 }}>
                                    <i className={`fas ${saving ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
                                    {saving ? 'Saving Changes...' : 'Save Configuration'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="modal fade show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content border-0 shadow-lg rounded">
                            <div className="modal-header bg-primary text-white border-0">
                                <h5 className="modal-title font-weight-bold">
                                    <i className="fas fa-check-circle mr-2"></i>Confirm Configuration Changes
                                </h5>
                                <button type="button" className="close text-white" onClick={() => setShowConfirmModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body p-4">
                                <p className="mb-3">You are about to save changes to the system configuration. Please review:</p>
                                <div className="bg-light p-3 rounded mb-3">
                                    <div className="row">
                                        <div className="col-6 mb-2">
                                            <small className="text-muted d-block">Storage Provider</small>
                                            <strong className="text-uppercase">{pendingConfig?.storageProvider}</strong>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <small className="text-muted d-block">Application Status</small>
                                            <strong className={pendingConfig?.isApplicationOpen ? 'text-success' : 'text-secondary'}>
                                                {pendingConfig?.isApplicationOpen ? 'OPEN' : 'CLOSED'}
                                            </strong>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <small className="text-muted d-block">Maintenance Mode</small>
                                            <strong className={pendingConfig?.maintenanceMode ? 'text-danger' : 'text-success'}>
                                                {pendingConfig?.maintenanceMode ? 'ENABLED' : 'DISABLED'}
                                            </strong>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <small className="text-muted d-block">Google OAuth</small>
                                            <strong className={pendingConfig?.enableGoogleLogin ? 'text-success' : 'text-secondary'}>
                                                {pendingConfig?.enableGoogleLogin ? 'ENABLED' : 'DISABLED'}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                                <div className="alert alert-info mb-0 border-0" role="alert">
                                    <i className="fas fa-exclamation-circle mr-2"></i>
                                    <small>These changes will take effect immediately and may impact active users.</small>
                                </div>
                            </div>
                            <div className="modal-footer border-0 bg-light">
                                <button type="button" className="btn btn-secondary px-4" onClick={() => setShowConfirmModal(false)}>
                                    <i className="fas fa-times mr-2"></i>Cancel
                                </button>
                                <button type="button" className="btn btn-primary px-4" onClick={confirmSave}>
                                    <i className="fas fa-check mr-2"></i>Confirm & Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                /* Modern Toggle Switch */
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 48px;
                    height: 26px;
                    flex-shrink: 0;
                }

                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #e0e0e0;
                    transition: .3s;
                }

                .slider:before {
                    position: absolute;
                    content: "";
                    height: 20px;
                    width: 20px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .3s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                input:checked + .slider {
                    background-color: #4e73df;
                }

                input:checked + .slider:before {
                    transform: translateX(22px);
                }

                .slider.round {
                    border-radius: 26px;
                }

                .slider.round:before {
                    border-radius: 50%;
                }

                /* Modern Checkbox */
                .custom-checkbox-container {
                    display: flex;
                    align-items: flex-start;
                    position: relative;
                    padding-left: 35px;
                    cursor: pointer;
                    user-select: none;
                    width: 100%;
                }

                .custom-checkbox-container input {
                    position: absolute;
                    opacity: 0;
                    cursor: pointer;
                    height: 0;
                    width: 0;
                }

                .checkmark {
                    position: absolute;
                    top: 2px;
                    left: 0;
                    height: 22px;
                    width: 22px;
                    background-color: #fff;
                    border: 2px solid #e0e0e0;
                    border-radius: 5px;
                    transition: all 0.2s ease;
                }

                .custom-checkbox-container:hover input ~ .checkmark {
                    border-color: #4e73df;
                }

                .custom-checkbox-container input:checked ~ .checkmark {
                    background-color: #4e73df;
                    border-color: #4e73df;
                }

                .checkmark:after {
                    content: "";
                    position: absolute;
                    display: none;
                }

                .custom-checkbox-container input:checked ~ .checkmark:after {
                    display: block;
                }

                .custom-checkbox-container .checkmark:after {
                    left: 6px;
                    top: 2px;
                    width: 5px;
                    height: 10px;
                    border: solid white;
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg);
                }

                .checkbox-content {
                    flex: 1;
                }

                /* Modern Input */
                .input-group-modern {
                    background: #f8f9fa;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }

                .form-control-modern {
                    background: transparent;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 0.625rem 0.875rem;
                    transition: all 0.2s ease;
                }

                .form-control-modern:focus {
                    background: #fff;
                    border-color: #4e73df;
                    box-shadow: 0 0 0 3px rgba(78, 115, 223, 0.1);
                }

                .input-group-modern .form-control-modern {
                    border: none;
                }

                .input-group-modern:focus-within {
                    box-shadow: 0 0 0 3px rgba(78, 115, 223, 0.1);
                }

                /* Card Improvements */
                .card {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .rounded-lg {
                    border-radius: 12px !important;
                }
            `}</style>
        </div>
    );
};

export default SystemSetting;
