import React, { useState } from 'react';

const SystemSetting = () => {
    const [settings, setSettings] = useState({
        academicYear: '2024-2025',
        semester: '1st Semester',
        activeAcademicYearId: 'AY2024',
        activeSemesterId: 'SEM1',

        uploadLimitMb: 10,
        allowedExtensions: 'pdf,jpg,jpeg,png',
        maxContentLength: 10485760, // 10MB

        tokenRefreshIntervalSec: 600,

        mailServer: 'smtp.mail.com',
        mailPort: 587,
        mailUsername: 'ischolar@mail.com',
        mailPassword: '',

        dashboardAnalytics: true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target;
        const parsedValue = type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value;
        setSettings(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitted Settings:', settings);
        alert('Settings saved (mock only)');
    };

    return (
        <>
            <header className="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
                <div className="container-fluid px-4">
                    <div className="page-header-content">
                        <div className="row align-items-center justify-content-between pt-3">
                            <div className="col-auto mb-3">
                                <h1 className="page-header-title">
                                    <div className="page-header-icon"><i data-feather="settings"></i></div>
                                    System Setting
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-fluid px-4">
                <form onSubmit={handleSubmit}>

                    {/* Academic Settings */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <i className="fas fa-university me-1"></i> Academic Settings
                        </div>
                        <div className="card-body">
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Academic Year</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="academicYear"
                                        value={settings.academicYear}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Semester</label>
                                    <select
                                        className="form-select"
                                        name="semester"
                                        value={settings.semester}
                                        onChange={handleChange}
                                    >
                                        <option>1st Semester</option>
                                        <option>2nd Semester</option>
                                        <option>Summer</option>
                                    </select>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <label className="form-label">Active Academic Year ID</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="activeAcademicYearId"
                                        value={settings.activeAcademicYearId}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Active Semester ID</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="activeSemesterId"
                                        value={settings.activeSemesterId}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upload Settings */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <i className="fas fa-upload me-1"></i> File Upload Settings
                        </div>
                        <div className="card-body">
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Upload Limit (MB)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="uploadLimitMb"
                                        value={settings.uploadLimitMb}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Allowed Extensions</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="allowedExtensions"
                                        value={settings.allowedExtensions}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Max Content Length (bytes)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="maxContentLength"
                                    value={settings.maxContentLength}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Session Settings */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <i className="fas fa-clock me-1"></i> Session Settings
                        </div>
                        <div className="card-body">
                            <label className="form-label">Token Refresh Interval (sec)</label>
                            <input
                                type="number"
                                className="form-control"
                                name="tokenRefreshIntervalSec"
                                value={settings.tokenRefreshIntervalSec}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Email Settings */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <i className="fas fa-envelope me-1"></i> Email Settings
                        </div>
                        <div className="card-body">
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Mail Server</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="mailServer"
                                        value={settings.mailServer}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Port</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="mailPort"
                                        value={settings.mailPort}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="mailUsername"
                                        value={settings.mailUsername}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                name="mailPassword"
                                value={settings.mailPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Dashboard Settings */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <i className="fas fa-chart-bar me-1"></i> Dashboard Settings
                        </div>
                        <div className="card-body">
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="dashboardAnalytics"
                                    checked={settings.dashboardAnalytics}
                                    onChange={handleChange}
                                />
                                <label className="form-check-label">Enable Dashboard Analytics</label>
                            </div>
                        </div>
                    </div>

                    <div className="text-end mb-5">
                        <button type="submit" className="btn btn-primary">
                            Save Settings
                        </button>
                    </div>

                </form>
            </div>
        </>
    );
};

export default SystemSetting;
