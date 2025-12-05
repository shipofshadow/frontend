import { useState, useEffect } from 'react';
import { 
    Settings, 
    Bell, 
    Mail, 
    Save,
    AlertCircle,
    CheckCircle,
    Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import alertService from '../../services/alertService';
import Swal from 'sweetalert2';
import type { AlertPreferences } from '../../interfaces/alert';

const AlertSettings = () => {
    const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [preferences, setPreferences] = useState<AlertPreferences>({
        email_alerts_enabled: true,
        min_match_score: 75,
        alert_frequency: 'immediate'
    });

    // Fetch current preferences
    useEffect(() => {
        const fetchPreferences = async () => {
            if (!token) return;
            
            setIsLoading(true);
            setError(null);
            
            try {
                const data = await alertService.getAlertPreferences(token);
                setPreferences(data);
            } catch (err) {
                console.error('Failed to fetch alert preferences:', err);
                setError('Failed to load your alert preferences. Using defaults.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPreferences();
    }, [token]);

    const handleSave = async () => {
        if (!token) return;

        setIsSaving(true);
        setError(null);

        try {
            await alertService.updateAlertPreferences(token, preferences);
            
            await Swal.fire({
                title: 'Settings Saved!',
                text: 'Your alert preferences have been updated.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error('Failed to save preferences:', err);
            setError('Failed to save preferences. Please try again.');
            
            await Swal.fire({
                title: 'Error',
                text: 'Failed to save your preferences. Please try again.',
                icon: 'error'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleEmailAlerts = () => {
        setPreferences(prev => ({
            ...prev,
            email_alerts_enabled: !prev.email_alerts_enabled
        }));
    };

    const handleMinScoreChange = (value: number) => {
        setPreferences(prev => ({
            ...prev,
            min_match_score: value
        }));
    };

    const handleFrequencyChange = (frequency: 'immediate' | 'daily' | 'weekly') => {
        setPreferences(prev => ({
            ...prev,
            alert_frequency: frequency
        }));
    };

    const getScoreLabel = (score: number): string => {
        if (score >= 90) return 'Excellent matches only';
        if (score >= 75) return 'Good to excellent matches';
        if (score >= 50) return 'Most potential matches';
        return 'All potential matches';
    };

    if (isLoading) {
        return (
            <main className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Loading your preferences...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-vh-100 bg-light">
            {/* Header */}
            <div className="bg-white shadow-sm border-bottom">
                <div className="container py-3">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <Link to="/applicant/home" className="text-decoration-none">Dashboard</Link>
                            </li>
                            <li className="breadcrumb-item">
                                <Link to="/applicant/settings" className="text-decoration-none">Settings</Link>
                            </li>
                            <li className="breadcrumb-item active">Alert Preferences</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="container py-4">
                {/* Page Header */}
                <div 
                    className="card border-0 shadow-sm mb-4"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                    <div className="card-body p-4 text-white">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-white bg-opacity-20 rounded-3 p-3">
                                <Settings size={32} />
                            </div>
                            <div>
                                <h2 className="mb-1 fw-bold">Alert Preferences</h2>
                                <p className="mb-0 opacity-90">
                                    Customize how and when you receive scholarship match notifications
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-warning d-flex align-items-center gap-2 mb-4" role="alert">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="row">
                    <div className="col-lg-8">
                        {/* Email Alerts Toggle */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-transparent border-0 py-3">
                                <div className="d-flex align-items-center gap-2">
                                    <Mail size={20} className="text-primary" />
                                    <h5 className="mb-0 fw-bold">Email Notifications</h5>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <h6 className="mb-1">Enable Email Alerts</h6>
                                        <p className="text-muted small mb-0">
                                            Receive email notifications when new scholarships match your profile
                                        </p>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            role="switch"
                                            id="emailAlertsToggle"
                                            checked={preferences.email_alerts_enabled}
                                            onChange={handleToggleEmailAlerts}
                                            style={{ 
                                                width: '3rem', 
                                                height: '1.5rem',
                                                cursor: 'pointer'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Minimum Match Score */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-transparent border-0 py-3">
                                <div className="d-flex align-items-center gap-2">
                                    <CheckCircle size={20} className="text-success" />
                                    <h5 className="mb-0 fw-bold">Match Threshold</h5>
                                </div>
                            </div>
                            <div className="card-body">
                                <p className="text-muted small mb-3">
                                    Only receive alerts for scholarships with a match score at or above this threshold
                                </p>
                                
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-medium">Minimum Match Score</span>
                                        <span 
                                            className="badge px-3 py-2"
                                            style={{ 
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            {preferences.min_match_score}%
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        className="form-range"
                                        min="0"
                                        max="100"
                                        step="5"
                                        value={preferences.min_match_score}
                                        onChange={(e) => handleMinScoreChange(Number(e.target.value))}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <div className="d-flex justify-content-between text-muted small">
                                        <span>0%</span>
                                        <span>50%</span>
                                        <span>100%</span>
                                    </div>
                                </div>

                                <div className="bg-light rounded-3 p-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <Info size={16} className="text-info" />
                                        <span className="small text-muted">
                                            {getScoreLabel(preferences.min_match_score)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Alert Frequency */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-transparent border-0 py-3">
                                <div className="d-flex align-items-center gap-2">
                                    <Bell size={20} className="text-warning" />
                                    <h5 className="mb-0 fw-bold">Alert Frequency</h5>
                                </div>
                            </div>
                            <div className="card-body">
                                <p className="text-muted small mb-3">
                                    Choose how often you want to receive scholarship match notifications
                                </p>
                                
                                <div className="d-flex flex-column gap-3">
                                    {[
                                        { 
                                            value: 'immediate', 
                                            label: 'Immediate', 
                                            description: 'Get notified as soon as a new match is found' 
                                        },
                                        { 
                                            value: 'daily', 
                                            label: 'Daily Digest', 
                                            description: 'Receive a summary of all matches once a day' 
                                        },
                                        { 
                                            value: 'weekly', 
                                            label: 'Weekly Digest', 
                                            description: 'Receive a summary of all matches once a week' 
                                        }
                                    ].map((option) => (
                                        <div 
                                            key={option.value}
                                            className={`form-check p-3 rounded-3 border ${preferences.alert_frequency === option.value ? 'border-primary bg-primary bg-opacity-10' : 'border-light'}`}
                                            style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                                            onClick={() => handleFrequencyChange(option.value as 'immediate' | 'daily' | 'weekly')}
                                        >
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="alertFrequency"
                                                id={`frequency-${option.value}`}
                                                checked={preferences.alert_frequency === option.value}
                                                onChange={() => handleFrequencyChange(option.value as 'immediate' | 'daily' | 'weekly')}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <label 
                                                className="form-check-label ms-2 w-100" 
                                                htmlFor={`frequency-${option.value}`}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <span className="fw-medium">{option.label}</span>
                                                <br />
                                                <small className="text-muted">{option.description}</small>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                            <Link 
                                to="/applicant/alerts"
                                className="btn btn-outline-secondary"
                            >
                                Cancel
                            </Link>
                            <button
                                className="btn btn-primary d-flex align-items-center gap-2"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Preferences
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <h6 className="fw-bold mb-3">
                                    <Info size={16} className="me-2 text-info" />
                                    About Scholarship Alerts
                                </h6>
                                <p className="text-muted small mb-3">
                                    Our smart matching system analyzes your profile and compares it with scholarship requirements to find the best matches for you.
                                </p>
                                <ul className="list-unstyled text-muted small mb-0">
                                    <li className="mb-2">
                                        <CheckCircle size={14} className="me-2 text-success" />
                                        Personalized recommendations
                                    </li>
                                    <li className="mb-2">
                                        <CheckCircle size={14} className="me-2 text-success" />
                                        Real-time match notifications
                                    </li>
                                    <li className="mb-2">
                                        <CheckCircle size={14} className="me-2 text-success" />
                                        Customizable alert preferences
                                    </li>
                                    <li>
                                        <CheckCircle size={14} className="me-2 text-success" />
                                        Never miss a deadline
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default AlertSettings;
