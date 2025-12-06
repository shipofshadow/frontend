import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../../context/SettingsContext';

const ApplicationClosed: React.FC = () => {
    const navigate = useNavigate();
    const { settings } = useSettings();

    // Helper to format dates
    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const startDate = formatDate(settings.applicationStartDate);

    return (
        <div className="container py-5 min-vh-100 d-flex flex-column justify-content-center align-items-center">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '600px', width: '100%' }}>
                <div className="card-body p-5 text-center">

                    {/* Visual Icon */}
                    <div className="mb-4">
                        <div className="bg-warning bg-opacity-10 text-warning d-inline-flex align-items-center justify-content-center rounded-circle" style={{ width: '80px', height: '80px' }}>
                            <i className="fal fa-calendar-times fa-3x"></i>
                        </div>
                    </div>

                    <h2 className="fw-bold mb-3 text-dark">Applications Are Currently Closed</h2>

                    <p className="text-muted mb-4 fs-5">
                        The scholarship application portal is not accepting new submissions at this time.
                    </p>

                    {/* Contextual Information based on Dates */}
                    <div className="bg-light rounded-3 p-4 mb-4 text-start">
                        <div className="d-flex align-items-start gap-3 mb-3">
                            <i className="fal fa-info-circle text-primary mt-1"></i>
                            <div>
                                <h6 className="fw-bold mb-1">Why am I seeing this?</h6>
                                <p className="small text-muted mb-0">
                                    The administration may have closed the portal for maintenance, or the application period for the current semester may have ended.
                                </p>
                            </div>
                        </div>

                        {/* Show Start Date if defined */}
                        {settings.applicationStartDate && (
                            <div className="d-flex align-items-center gap-3 border-top pt-3">
                                <i className="fal fa-calendar-check text-success"></i>
                                <div>
                                    <span className="small text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>Next Opening</span>
                                    <span className="fw-semibold text-dark">{startDate}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="d-grid gap-2 col-md-8 mx-auto">
                        <button
                            className="btn btn-primary rounded-pill py-2 fw-semibold"
                            onClick={() => navigate('/applicant/dashboard')}
                        >
                            <i className="fal fa-arrow-left me-2"></i>
                            Return to Dashboard
                        </button>

                        <button
                            className="btn btn-link text-muted text-decoration-none small"
                            onClick={() => window.location.reload()}
                        >
                            Check Again
                        </button>
                    </div>

                </div>
                <div className="card-footer bg-light border-0 py-3 text-center">
                    <small className="text-muted">
                        Need help? Contact us at <a href={`mailto:${settings.supportEmail}`} className="text-primary text-decoration-none">{settings.supportEmail || 'support@example.com'}</a>
                    </small>
                </div>
            </div>
        </div>
    );
};

export default ApplicationClosed;