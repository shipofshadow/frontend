import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { API_BASE_URL } from "../config";
import type User from "../types/user.ts";

// Types
interface PrefillProfile {
    email?: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
}

interface LinkData {
    existing_id: string;
    existing_email: string;
    existing_first_name: string;
    existing_last_name: string;
    provider: 'google' | 'facebook';
    provider_id: string;
    oauth_email: string;
    first_name: string;
    last_name: string;
    avatar: string;
}

interface AuthResponse {
    success: boolean;
    token?: string;
    refresh_token?: string;
    user?: User;
    needs_profile?: boolean;
    error?: string;
    message?: string;
}

const AuthCallback: React.FC = () => {
    const navigate = useNavigate();
    const { search } = useLocation();
    const { login } = useAuth();

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [showLinkDialog, setShowLinkDialog] = useState<boolean>(false);
    const [linkData, setLinkData] = useState<LinkData | null>(null);

    useEffect(() => {
        const handleAuthCallback = async (): Promise<void> => {
            try {
                const params = new URLSearchParams(search);

                // Check for standard OAuth success parameters
                const token = params.get("token");
                const refresh_token = params.get("refresh_token");
                const userStr = params.get("user");
                const userObj = userStr ? JSON.parse(userStr) : null;
                const needsProfile = params.get("needs_profile") === "true";

                if (token && refresh_token && userObj) {
                    // Standard successful OAuth login
                    localStorage.setItem("access_token", token);
                    localStorage.setItem("refresh_token", refresh_token);
                    localStorage.setItem("user", JSON.stringify(userObj));

                    if (needsProfile) {
                        // Store pre-fill data
                        const prefillData: PrefillProfile = {
                            email: params.get("email") || undefined,
                            first_name: params.get("first_name") || undefined,
                            last_name: params.get("last_name") || undefined,
                            avatar: params.get("avatar") || undefined,
                        };
                        localStorage.setItem("prefill_profile", JSON.stringify(prefillData));
                        navigate("/complete-profile");
                    } else {
                        login(userObj, token, refresh_token);
                        navigate("/applicant/dashboard");
                    }
                    return;
                }

                // Check if there's a possible account link scenario
                const possibleLink = params.get("possible_link");
                if (possibleLink === "true") {
                    const linkInfo: LinkData = {
                        existing_id: params.get("existing_id") || '',
                        existing_email: params.get("existing_email") || '',
                        existing_first_name: params.get("existing_first_name") || '',
                        existing_last_name: params.get("existing_last_name") || '',
                        provider: (params.get("provider") as 'google' | 'facebook') || 'google',
                        provider_id: params.get("provider_id") || '',
                        oauth_email: params.get("oauth_email") || '',
                        first_name: params.get("first_name") || '',
                        last_name: params.get("last_name") || '',
                        avatar: params.get("avatar") || ''
                    };

                    setLinkData(linkInfo);
                    setShowLinkDialog(true);
                    setLoading(false);
                    return;
                }

                // Check for OAuth errors
                const oauthError = params.get("error");
                if (oauthError) {
                    setError(params.get("message") || 'Authentication failed');
                    setLoading(false);
                    return;
                }

                // If no valid params, redirect to login
                navigate("/login");

            } catch (err) {
                console.error('Auth callback error:', err);
                setError('Failed to process authentication');
                setLoading(false);
            }
        };

        handleAuthCallback();
    }, [navigate, search, login]);

    const handleLinkAccount = async (): Promise<void> => {
        if (!linkData) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/auth/link-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: linkData.existing_id,
                    provider: linkData.provider,
                    provider_id: linkData.provider_id,
                    oauth_email: linkData.oauth_email,
                    first_name: linkData.first_name,
                    last_name: linkData.last_name,
                    avatar: linkData.avatar
                })
            });

            const data: AuthResponse = await response.json();

            if (data.success && data.user && data.token && data.refresh_token) {
                // Use the same login flow as your existing callback
                login(data.user, data.token, data.refresh_token);
                navigate("/applicant/dashboard");
            } else {
                setError(data.error || 'Failed to link account');
                setLoading(false);
            }
        } catch (err) {
            console.error('Link account error:', err);
            setError('Failed to link account');
            setLoading(false);
        }
    };

    const handleCreateNewAccount = async (): Promise<void> => {
        if (!linkData) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/auth/create-new-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    provider: linkData.provider,
                    provider_id: linkData.provider_id,
                    oauth_email: linkData.oauth_email,
                    first_name: linkData.first_name,
                    last_name: linkData.last_name,
                    avatar: linkData.avatar
                })
            });

            const data: AuthResponse = await response.json();

            if (data.success && data.user && data.token && data.refresh_token) {
                // Store pre-fill data for new account
                const prefillData: PrefillProfile = {
                    email: linkData.oauth_email,
                    first_name: linkData.first_name,
                    last_name: linkData.last_name,
                    avatar: linkData.avatar,
                };
                localStorage.setItem("prefill_profile", JSON.stringify(prefillData));

                // Login and redirect to profile completion
                login(data.user, data.token, data.refresh_token);
                navigate("/complete-profile");
            } else {
                setError(data.error || 'Failed to create account');
                setLoading(false);
            }
        } catch (err) {
            console.error('Create account error:', err);
            setError('Failed to create account');
            setLoading(false);
        }
    };

    const getProviderIcon = (provider: string): string => {
        switch (provider) {
            case 'google':
                return 'fab fa-google';
            case 'facebook':
                return 'fab fa-facebook-f';
            default:
                return 'fas fa-user';
        }
    };

    const getProviderColor = (provider: string): string => {
        switch (provider) {
            case 'google':
                return 'text-danger';
            case 'facebook':
                return 'text-primary';
            default:
                return 'text-primary';
        }
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-4" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h5 className="text-muted mb-0">Processing authentication...</h5>
                    <div className="mt-3">
                        <div className="progress" style={{ height: '4px', width: '200px', margin: '0 auto' }}>
                            <div className="progress-bar progress-bar-striped progress-bar-animated"
                                 role="progressbar"
                                 style={{ width: '100%' }}>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (showLinkDialog && linkData) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center p-4"
                 style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="card shadow-lg border-0" style={{ maxWidth: '700px', width: '100%', borderRadius: '20px' }}>
                    <div className="card-header bg-transparent border-0 pt-4 pb-0">
                        <div className="text-center">
                            <div className="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                 style={{ width: '80px', height: '80px' }}>
                                <i className="fas fa-user-friends text-white" style={{ fontSize: '2rem' }}></i>
                            </div>
                            <h4 className="card-title fw-bold text-dark mb-2">Account Match Found</h4>
                            <p className="text-muted mb-0">We found an existing account that might belong to you</p>
                        </div>
                    </div>
                    <div className="card-body p-4">
                        <div className="alert alert-info border-0 mb-4"
                             style={{ backgroundColor: '#e3f2fd', borderRadius: '15px' }}>
                            <div className="d-flex align-items-center">
                                <i className="fas fa-info-circle text-info me-3" style={{ fontSize: '1.2rem' }}></i>
                                <div>
                                    <strong>Smart Detection:</strong> We matched your name with an existing iScholar account.
                                </div>
                            </div>
                        </div>

                        <div className="row g-4 mb-4">
                            <div className="col-md-6">
                                <div className="card h-100 border-0" style={{ backgroundColor: '#f8f9ff', borderRadius: '15px' }}>
                                    <div className="card-header bg-transparent border-0 pb-2">
                                        <h6 className={`mb-0 d-flex align-items-center ${getProviderColor(linkData.provider)}`}>
                                            <i className={`${getProviderIcon(linkData.provider)} me-2`} style={{ fontSize: '1.1rem' }}></i>
                                            Your {linkData.provider.charAt(0).toUpperCase() + linkData.provider.slice(1)} Account
                                        </h6>
                                    </div>
                                    <div className="card-body pt-2">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3"
                                                 style={{ width: '40px', height: '40px' }}>
                                                <i className="fas fa-user text-muted"></i>
                                            </div>
                                            <div>
                                                <small className="text-muted d-block">Full Name</small>
                                                <strong className="text-dark">{linkData.first_name} {linkData.last_name}</strong>
                                            </div>
                                        </div>
                                        {linkData.oauth_email && (
                                            <div className="d-flex align-items-center">
                                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3"
                                                     style={{ width: '40px', height: '40px' }}>
                                                    <i className="fas fa-envelope text-muted"></i>
                                                </div>
                                                <div>
                                                    <small className="text-muted d-block">Email Address</small>
                                                    <strong className="text-dark text-truncate" style={{ maxWidth: '200px' }}>
                                                        {linkData.oauth_email}
                                                    </strong>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="card h-100 border-0" style={{ backgroundColor: '#f0fff4', borderRadius: '15px' }}>
                                    <div className="card-header bg-transparent border-0 pb-2">
                                        <h6 className="mb-0 d-flex align-items-center text-success">
                                            <i className="fas fa-graduation-cap me-2" style={{ fontSize: '1.1rem' }}></i>
                                            Existing iScholar Account
                                        </h6>
                                    </div>
                                    <div className="card-body pt-2">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3"
                                                 style={{ width: '40px', height: '40px' }}>
                                                <i className="fas fa-user text-muted"></i>
                                            </div>
                                            <div>
                                                <small className="text-muted d-block">Full Name</small>
                                                <strong className="text-dark">{linkData.existing_first_name} {linkData.existing_last_name}</strong>
                                            </div>
                                        </div>
                                        {linkData.existing_email && (
                                            <div className="d-flex align-items-center">
                                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3"
                                                     style={{ width: '40px', height: '40px' }}>
                                                    <i className="fas fa-envelope text-muted"></i>
                                                </div>
                                                <div>
                                                    <small className="text-muted d-block">Email Address</small>
                                                    <strong className="text-dark text-truncate" style={{ maxWidth: '200px' }}>
                                                        {linkData.existing_email}
                                                    </strong>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="alert alert-warning border-0 mb-4"
                             style={{ backgroundColor: '#fff8e1', borderRadius: '15px' }}>
                            <div className="d-flex align-items-start">
                                <i className="fas fa-exclamation-triangle text-warning me-3 mt-1"></i>
                                <div>
                                    <strong>Important Decision:</strong> Linking accounts will allow you to use {linkData.provider.charAt(0).toUpperCase() + linkData.provider.slice(1)} to access your existing scholarship applications, grades, and profile data.
                                </div>
                            </div>
                        </div>

                        <div className="d-grid gap-3">
                            <button
                                onClick={handleLinkAccount}
                                className="btn btn-primary btn-lg d-flex align-items-center justify-content-center"
                                style={{ borderRadius: '12px', padding: '15px 20px' }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="spinner-border spinner-border-sm me-2" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                ) : (
                                    <i className="fas fa-link me-2"></i>
                                )}
                                Yes, Link to My Existing Account
                            </button>

                            <button
                                onClick={handleCreateNewAccount}
                                className="btn btn-outline-secondary btn-lg d-flex align-items-center justify-content-center"
                                style={{ borderRadius: '12px', padding: '15px 20px' }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="spinner-border spinner-border-sm me-2" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                ) : (
                                    <i className="fas fa-user-plus me-2"></i>
                                )}
                                No, Create a Separate Account
                            </button>

                            <button
                                onClick={() => navigate('/login')}
                                className="btn btn-link text-muted"
                                disabled={loading}
                            >
                                <i className="fas fa-arrow-left me-2"></i>
                                Cancel and Return to Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center p-4"
                 style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)' }}>
                <div className="card shadow-lg border-0" style={{ maxWidth: '500px', width: '100%', borderRadius: '20px' }}>
                    <div className="card-body text-center p-5">
                        <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                             style={{ width: '100px', height: '100px' }}>
                            <i className="fas fa-times-circle text-danger" style={{ fontSize: '3rem' }}></i>
                        </div>
                        <h4 className="fw-bold text-dark mb-3">Authentication Failed</h4>
                        <p className="text-muted mb-4 lead">{error}</p>
                        <div className="d-grid gap-3">
                            <button
                                onClick={() => navigate('/login')}
                                className="btn btn-danger btn-lg"
                                style={{ borderRadius: '12px', padding: '15px 20px' }}
                            >
                                <i className="fas fa-arrow-left me-2"></i>
                                Back to Login
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-outline-dark"
                                style={{ borderRadius: '12px', padding: '12px 20px' }}
                            >
                                <i className="fas fa-redo me-2"></i>
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
            <p className="text-muted">Redirecting...</p>
        </div>
    );
};

export default AuthCallback;