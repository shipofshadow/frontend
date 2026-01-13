import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { notyf } from '../utils/utils';
import {
    User,
    Lock,
    Eye,
    EyeOff,
    LogIn,
    UserPlus,
    AlertCircle,
    GraduationCap,
    FileText,
    BarChart3,
    ShieldCheck
} from 'lucide-react';
import "notyf/notyf.min.css";
import { API_BASE_URL } from "../config.ts";
import '../assets/css/Login.css'
import {useSettings} from "../context/SettingsContext.tsx";
const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login, isAuthenticated, user } = useAuth();
    const { settings } = useSettings();
    useEffect(() => {
        if (isAuthenticated) {
            if (user?.role === 'admin' || user?.role === 'bitress' || user?.role === 'faculty') navigate('/admin');
            else if (user?.role === 'student') navigate('/applicant/home');
            else navigate('/');
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        const savedUsername = localStorage.getItem('rememberedUsername');
        if (savedUsername) {
            setUsername(savedUsername);
            setRemember(true);
        }
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!username || !password) {
            setErrors('Username and password are required.');
            return;
        }
        setIsLoading(true);
        setErrors(null);
        try {
            const response = await loginUser(username, password);
            const { user, token, refresh_token } = response;
            if (remember) localStorage.setItem('rememberedUsername', username);
            else localStorage.removeItem('rememberedUsername');
            login(user, token, refresh_token);
            notyf.success('Login successful!');
            if (user.role === 'admin' || user.role === 'bitress' || user.role === 'faculty') navigate('/admin');
            else if (user.role === 'student') navigate('/applicant/home');
            else navigate('/');
        } catch (err) {
            setErrors(err instanceof Error ? err.message : 'Login failed. Please check your credentials and try again.');
        } finally {
            setIsLoading(false);
        }
    }, [username, password, remember, login, navigate]);

    const handleRememberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setRemember(checked);
        if (!checked) localStorage.removeItem('rememberedUsername');
    }, []);

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(show => !show);
    }, []);

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);
            window.location.href = `${API_BASE_URL}/auth/google`;
        } catch (error) {
            console.error('Google login failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFacebookLogin = async () => {
        try {
            setIsLoading(true);
            window.location.href = `${API_BASE_URL}/auth/facebook`;

        } catch (error) {
            console.error('Facebook login failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-background-circle-1" />
            <div className="login-background-circle-2" />
            <main className="login-container-inner" aria-label="Login and Information">
                <section className="info-card-base login-left-card bg-transparent" aria-labelledby="welcome-title">
                    <header className="mb-3 d-flex align-items-center">
                        <img src="https://ispsc.edu.ph/file-manager/images/ispsc_logo_2.png" alt="iScholar Logo" style={{ width: 60, height: 60, marginRight: 16, borderRadius: 12 }} />
                        <div>
                            <h2
                                id="welcome-title"
                                className="fw-bold mb-1 login-title"
                            >
                                Welcome to iScholar
                            </h2>

                            <p className="mb-1 login-subtitle">
                                Intelligent Scholarship Prequalification System
                            </p>
                        </div>
                    </header>

                    <p className="login-description">
                        Streamline your scholarship application process with our powered eligibility evaluation system.
                        Apply, track, and manage your educational funding opportunities all in one place.
                    </p>

                    {/* Smart Eligibility */}
                    <div className="login-smart-eligibility-card">
                        <div className="login-smart-eligibility-icon">
                            <GraduationCap size={32} />
                        </div>
                        <div>
                            <h3 className="login-feature-title">
                                Smart Eligibility
                            </h3>
                            <p className="login-feature-description">
                                Powered system analyzes your academic performance, family background, and financial need to instantly determine scholarship eligibility
                            </p>
                        </div>
                    </div>

                    {/* Easy Application */}
                    <div className="login-easy-application-card">
                        <div className="login-easy-application-icon">
                            <FileText size={32} />
                        </div>
                        <div>
                            <h3 className="login-feature-title">
                                Easy Application
                            </h3>
                            <p className="login-feature-description">
                                Simple multi-step application with document upload, tracking, and status updates.
                            </p>
                        </div>
                    </div>

                    {/* Real-time Analytics */}
                    <div className="login-real-time-card">
                        <div className="login-real-time-icon">
                            <BarChart3 size={32} />
                        </div>
                        <div>
                            <h3 className="login-feature-title">
                                Real-time Analytics
                            </h3>
                            <p className="login-feature-description">
                                Track application progress, view analytics, and match with opportunities.
                            </p>
                        </div>
                    </div>

                    {/* Secure Platform */}
                    <div className="login-secure-platform-card">
                        <div className="login-secure-platform-icon">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h3 className="login-feature-title">
                                Secure Platform
                            </h3>
                            <p className="login-feature-description">
                                Enterprise-grade security for personal and academic information.
                            </p>
                        </div>
                    </div>

                    <footer
                        className="d-flex justify-content-between align-items-center text-white p-3 mt-auto login-stats-footer"
                    >
                        <div className="text-center flex-fill">
                            <div className="login-stats-number">500+</div>
                            <div className="login-stats-label">Students Registered</div>
                        </div>
                        <div className="text-center flex-fill">
                            <div className="login-stats-number">₱2M+</div>
                            <div className="login-stats-label">Scholarships Awarded</div>
                        </div>
                        <div className="text-center flex-fill">
                            <div className="login-stats-number">95%</div>
                            <div className="login-stats-label">Success Rate</div>
                        </div>
                    </footer>
                </section>

                <section className="login-card-base login-right-card" aria-label="Student Login">
                    <header className="text-center mb-4" role="banner">
                        <div className="d-flex align-items-center justify-content-center mb-3">
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: 16, width: 50, height: 50,
                                backgroundImage: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                                color: 'white'
                            }}>
                                <LogIn size={24} aria-hidden="true" />
                            </div>
                            <div className="text-start ms-3">
                                <h2 className="h4 fw-bold mb-0">Student Login</h2>
                                <small className="text-muted">Access your dashboard</small>
                            </div>
                        </div>
                    </header>

                    {errors && (
                        <div className="alert alert-danger rounded mb-4" role="alert">
                            <div className="d-flex align-items-center">
                                <AlertCircle size={18} className="me-2" aria-hidden="true" />
                                <span>{errors}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate autoComplete="off" className="mb-2">
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label fw-semibold text-secondary d-flex align-items-center">
                                <User size={16} className="me-2" aria-hidden="true" />
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                className="form-control form-control-lg rounded-3 login-username-input"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username or student ID"
                                required
                                autoFocus
                                disabled={isLoading}
                                aria-required="true"
                                aria-describedby="usernameHelp"
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password" className="form-label fw-semibold text-secondary d-flex align-items-center">
                                <Lock size={16} className="me-2" aria-hidden="true" />
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-control form-control-lg rounded-3 login-password-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    disabled={isLoading}
                                    aria-required="true"
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    disabled={isLoading}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="login-password-toggle"
                                >
                                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                                </button>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="remember"
                                    checked={remember}
                                    onChange={handleRememberChange}
                                    disabled={isLoading}
                                    aria-checked={remember}
                                />
                                <label htmlFor="remember" className="form-check-label text-muted small">
                                    Remember me
                                </label>
                            </div>
                            <Link to="/forgot-password" className="text-primary small fw-medium">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-lg fw-semibold rounded-3 text-white w-100 login-button"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn size={18} className="me-2" aria-hidden="true" />
                                    Login to Dashboard
                                </>
                            )}
                        </button>

                        {settings.enableGoogleLogin && (
                            <>
                                <div className="d-flex align-items-center ">
                                    <hr className="flex-grow-1" />
                                    <span className="mx-2 small text-muted">or continue with</span>
                                    <hr className="flex-grow-1" />
                                </div>


                                <div className="row g-2 mb-3">
                                    <div className="col-12">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center"
                                            disabled={isLoading}
                                            onClick={() => handleGoogleLogin()}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" className="me-2">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                            </svg>
                                            Google
                                        </button>
                                    </div>
                                    <div className="col-12">
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center d-none"
                                            disabled={isLoading}
                                            onClick={() => handleFacebookLogin()}
                                            style={{ backgroundColor: '#1877F2', borderColor: '#1877F2' }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" className="me-2" fill="white">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                            </svg>
                                            Facebook
                                        </button>
                                    </div>
                                </div>
                    </>
                    )}


                    </form>

                    <footer className="text-center border-top py-4 mt-auto bg-light rounded-bottom-4 mt-3">
                        <div className="mb-2">
                            <span className="text-muted small">New to iScholar?</span>
                        </div>
                        <Link to="/register" className="btn btn-outline-primary btn-sm rounded-3 px-4 text-decoration-none">
                            <UserPlus size={16} className="me-2" aria-hidden="true" />
                            Create Student Account
                        </Link>
                        <div className="mt-3">
                            <small className="text-muted">
                                By logging in, you agree to our
                                <Link to="/terms-of-service" className="text-primary ms-1 me-1 text-decoration-none">Terms</Link> and
                                <Link to="/privacy-policy" className="text-primary ms-1 text-decoration-none">Privacy Policy</Link>
                            </small>
                        </div>
                    </footer>


                </section>
            </main>


        </div>
    );
};

export default Login;