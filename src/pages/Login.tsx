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
    Clock,
    UserPlus,
    Shield,
    AlertCircle,
    HelpCircle,
    Search,
    Smartphone,
    GraduationCap
} from 'lucide-react';
import "notyf/notyf.min.css";

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f8fafc', // bg-light
        position: 'relative' as 'relative',
        overflow: 'hidden' as 'hidden',
    },
    backgroundCircle1: {
        position: 'absolute' as 'absolute',
        top: '-10%',
        left: '-10%',
        width: '300px',
        height: '300px',
        backgroundImage: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%)',
        borderRadius: '50%',
        zIndex: 1
    },
    backgroundCircle2: {
        position: 'absolute' as 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '400px',
        height: '400px',
        backgroundImage: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
        borderRadius: '50%',
        zIndex: 1,
    },
    containerInner: {
        position: 'relative' as 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap' as 'wrap',
        gap: '2rem',
        justifyContent: 'center',
        alignItems: 'stretch' as 'stretch',
    },
    cardBase: {
        borderRadius: '20px',
        boxShadow: '0 4px 24px rgba(0, 0, 40, 0.07)',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column' as 'column',
        justifyContent: 'space-between',
        transition: 'all 0.3s ease',
    },
    leftCard: {
        flex: '1 1 60%',
        padding: '2rem',
        minWidth: '320px',
        maxWidth: '720px',
    },
    rightCard: {
        flex: '1 1 35%',
        padding: '2rem',
        minWidth: '320px',
        maxWidth: '400px',
        boxShadow: '0 1.5rem 4rem rgba(0,0,0,0.15)',
        borderRadius: '20px',
    },
    loginButton: {
        backgroundImage: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
        padding: '0.875rem 2rem',
        border: 'none',
        borderRadius: '12px',
        color: 'white',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    // Updated Smart Eligibility feature card styles - removed blue background
    smartEligibilityCard: {
        borderRadius: '16px',
        padding: '1.5rem',
        color: 'white', // White text as requested
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        border: '1px solid rgba(59, 130, 246, 0.1)', // Subtle border for definition
    },
    smartEligibilityIcon: {
        width: '60px',
        height: '60px',
        background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', // Keep blue background for icon
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: 'white',
    },
};

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login, isAuthenticated, user } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            if (user?.role === 'admin') navigate('/admin');
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
            if (user.role === 'admin') navigate('/admin');
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

    return (
        <div style={styles.container}>
            <div style={styles.backgroundCircle1} />
            <div style={styles.backgroundCircle2} />
            <main style={styles.containerInner} aria-label="Login and Information">
                <section style={{ ...styles.cardBase, ...styles.leftCard }} aria-labelledby="welcome-title">
                    <header className="mb-3 d-flex align-items-center">
                        <img src="https://ispsctagudin.info/home/assets/img/ispsc_logo.png" alt="iScholar Logo" style={{ width: 60, height: 60, marginRight: 16, borderRadius: 12 }} />
                        <div>
                            <h2 
                                id="welcome-title" 
                                className="fw-bold mb-1" 
                                style={{ 
                                    fontSize: '2.75rem', 
                                    fontWeight: 700, 
                                    letterSpacing: '0.06em', 
                                    marginBottom: '0.75rem',
                                    background: 'linear-gradient(90deg, #3B82F6 0%, #1D4ED8 60%, #3B82F6 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                }}
                            >
                                Welcome to iScholar
                            </h2>

                            <p 
                                className="mb-1" 
                                style={{ 
                                    fontSize: '1.3rem',
                                    fontWeight: 600, 
                                    color: '#334155', 
                                    marginBottom: '1.75rem',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                }}
                            >
                                Intelligent Scholarship Prequalification System
                            </p>
                        </div>
                    </header>

                    {/* Smart Eligibility Feature Card - Updated */}
                    <div style={styles.smartEligibilityCard}>
                        <div style={styles.smartEligibilityIcon}>
                            <GraduationCap size={32} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'white' }}>
                                Smart Eligibility
                            </h3>
                            <p style={{ fontSize: '0.9rem', margin: 0, opacity: 0.9, color: 'white' }}>
                                AI-powered system analyzes your academic performance, family background, and financial need to instantly determine scholarship eligibility
                            </p>
                        </div>
                    </div>

                    <p style={{ 
                        fontSize: '1rem', 
                        color: '#475569', 
                        marginBottom: '1.75rem', 
                        maxWidth: '610px', 
                        lineHeight: 1.65,
                        filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.03))'
                    }}>
                        Streamline your scholarship application process with our AI-powered eligibility evaluation system.
                        Apply, track, and manage your educational funding opportunities all in one place.
                    </p>

                    <ul
                        className="list-unstyled mt-4 mb-4"
                        style={{ 
                            lineHeight: 1.7,
                            color: '#475569', 
                            maxWidth: '610px', 
                            marginBottom: '2rem', 
                            paddingLeft: '1.25rem',
                            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.02))'
                        }}
                    >
                        <li style={{ marginBottom: '0.85rem' }}>
                            <strong style={{ 
                                background: 'linear-gradient(90deg, #1E40AF, #3B82F6)', 
                                WebkitBackgroundClip: 'text', 
                                WebkitTextFillColor: 'transparent' 
                            }}>
                                Easy Application:
                            </strong> Simple multi-step application with document upload, tracking, and status updates.
                        </li>
                        <li style={{ marginBottom: '0.85rem' }}>
                            <strong style={{ 
                                background: 'linear-gradient(90deg, #1E40AF, #3B82F6)', 
                                WebkitBackgroundClip: 'text', 
                                WebkitTextFillColor: 'transparent' 
                            }}>
                                Real-time Analytics:
                            </strong> Track application progress, view analytics, and match with opportunities.
                        </li>
                        <li>
                            <strong style={{ 
                                background: 'linear-gradient(90deg, #1E40AF, #3B82F6)', 
                                WebkitBackgroundClip: 'text', 
                                WebkitTextFillColor: 'transparent' 
                            }}>
                                Secure Platform:
                            </strong> Enterprise-grade security for personal and academic information.
                        </li>
                    </ul>

                    <footer
                        className="d-flex justify-content-between align-items-center text-white p-4 mt-auto"
                        style={{
                            background: 'linear-gradient(108deg, #2563EB 6.32%, #3B82F6 94.32%)',
                            borderRadius: '12px',
                            maxWidth: '500px',
                            margin: '2rem auto 0',
                            boxShadow: '0 8px 32px rgba(59,130,246,0.18)',
                            fontWeight: 700,
                            gap: '1rem'
                        }}
                    >
                        <div className="text-center flex-fill">
                            <div style={{ fontSize: '2rem', fontWeight: 700 }}>500+</div>
                            <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.2rem' }}>Students Registered</div>
                        </div>
                        <div className="text-center flex-fill">
                            <div style={{ fontSize: '2rem', fontWeight: 700 }}>₱2M+</div>
                            <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.2rem' }}>Scholarships Awarded</div>
                        </div>
                        <div className="text-center flex-fill">
                            <div style={{ fontSize: '2rem', fontWeight: 700 }}>95%</div>
                            <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.2rem' }}>Success Rate</div>
                        </div>
                    </footer>
                </section>

                <section style={{ ...styles.cardBase, ...styles.rightCard }} aria-label="Student Login">
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

                    <form onSubmit={handleSubmit} noValidate autoComplete="off">
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label fw-semibold text-secondary d-flex align-items-center">
                                <User size={16} className="me-2" aria-hidden="true" />
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                className="form-control form-control-lg rounded-3"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username or student ID"
                                required
                                autoFocus
                                disabled={isLoading}
                                aria-required="true"
                                aria-describedby="usernameHelp"
                                style={{ paddingLeft: '3rem' }}
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
                                    className="form-control form-control-lg rounded-3"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    disabled={isLoading}
                                    aria-required="true"
                                    style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    disabled={isLoading}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        right: '0.5rem',
                                        transform: 'translateY(-50%)',
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        color: '#6b7280',
                                        padding: 0,
                                    }}
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
                            className="btn btn-lg fw-semibold rounded-3 text-white w-100"
                            style={styles.loginButton}
                            disabled={isLoading}
                            onMouseOver={e => {
                                if (!isLoading) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.6)';
                                }
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn size={18} className="me-2" aria-hidden="true" />
                                    LOGIN TO DASHBOARD
                                </>
                            )}
                        </button>

                        <div className="position-relative text-center my-3">
                            <hr />
                            <span
                                className="position-absolute top-50 start-50 translate-middle px-3 small text-muted"
                                style={{ transform: 'translate(-50%, -50%)', backgroundColor: 'white' }}
                            >
                                or continue with
                            </span>
                        </div>

                        <div className="row g-2 mb-3">
                                    <div className="col-6">
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
                                    <div className="col-6">
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center"
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
                    </form>

                    <footer className="text-center border-top py-4 mt-auto bg-light rounded-bottom-4">
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
                                <Link to="/terms" className="text-primary ms-1 me-1 text-decoration-none">Terms</Link> and
                                <Link to="/privacy" className="text-primary ms-1 text-decoration-none">Privacy Policy</Link>
                            </small>
                        </div>
                    </footer>

                    {/* Additional Info */}
                    <div className="text-center mt-5">
                        <div className="row g-2">
                            <div className="col-4 text-primary small">
                                <Clock size={16} className="d-block mx-auto mb-1" aria-hidden="true" />
                                24/7 Access
                            </div>
                            <div className="col-4 text-success small">
                                <Shield size={16} className="d-block mx-auto mb-1" aria-hidden="true" />
                                Secure Login
                            </div>
                            <div className="col-4 text-info small">
                                <Smartphone size={16} className="d-block mx-auto mb-1" aria-hidden="true" />
                                Mobile Ready
                            </div>
                        </div>
                    </div>
                </section>
            </main>

     
        </div>
    );
};

export default Login;
