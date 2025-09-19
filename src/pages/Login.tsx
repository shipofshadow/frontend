import React, {useState, useEffect} from 'react';
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
    GraduationCap,
    FileText,
    BarChart3,
    ShieldCheck
} from 'lucide-react';
import {useNavigate, type To} from "react-router-dom";
import {useAuth} from "../context/AuthContext.tsx";
import {loginUser} from "../services/authService.tsx";
import {notyf} from "../utils/utils.ts";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login, isAuthenticated, user } = useAuth();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            if (user?.role === 'admin') {
                navigate('/admin');
            } else if (user?.role === 'student') {
                navigate('/applicant/home');
            } else {
                navigate('/');
            }
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        const rememberedUsername = localStorage.getItem('rememberedUsername');
        if (rememberedUsername) {
            setUsername(rememberedUsername);
            setRemember(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!username || !password) {
            setErrors('Username and password are required.');
            return;
        }

        try {
            setIsLoading(true);
            setErrors(null);

            const response = await loginUser(username, password);
            const { user, token, refresh_token } = response;

            if (remember) {
                localStorage.setItem('rememberedUsername', username);
            } else {
                localStorage.removeItem('rememberedUsername');
            }

            login(user, token, refresh_token);

            notyf.success('Login successful!');

            if (user.role === 'admin') {
                navigate('/admin');
            } else if (user.role === 'student') {
                navigate('/applicant/home');
            } else {
                navigate('/');
            }

        } catch (err) {
            setErrors(err instanceof Error ? err.message : 'Login failed. Please check your credentials and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRememberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setRemember(isChecked);

        if (!isChecked) {
            localStorage.removeItem('rememberedUsername');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };


    const handleLinkClick = (path: To) => {
        navigate(path)
    };
    return (
        <div className="min-vh-100 bg-light position-relative overflow-hidden">
            {/* Background decorations */}
            <div
                className="position-absolute rounded-circle opacity-25"
                style={{
                    top: '-5%',
                    left: '-5%',
                    width: '200px',
                    height: '200px',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                    zIndex: 1
                }}
            />
            <div
                className="position-absolute rounded-circle opacity-25"
                style={{
                    bottom: '-5%',
                    right: '-5%',
                    width: '250px',
                    height: '250px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    zIndex: 1
                }}
            />

            <div className="container-fluid h-100 position-relative" style={{ zIndex: 2 }}>
                <div className="row h-100 align-items-center justify-content-center">
                    {/* Left Panel - Information */}
                    <div className="col-lg-7 col-xl-6 d-none d-lg-block p-4">
                        <div className="p-5 h-100 d-flex flex-column">
                            {/* Header */}
                            <div className="d-flex align-items-center mb-4">
                                <img
                                    src="https://ispsctagudin.info/home/assets/img/ispsc_logo.png"
                                    alt="iScholar Logo"
                                    className="rounded-3 me-3"
                                    style={{ width: '60px', height: '60px' }}
                                />
                                <div>
                                    <h1
                                        className="h2 fw-bold mb-1"
                                        style={{
                                            background: 'linear-gradient(90deg, #3B82F6 0%, #1D4ED8 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        Welcome to iScholar
                                    </h1>
                                    <p className="text-muted mb-0 fs-6">
                                        Intelligent Scholarship Prequalification System
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-secondary mb-4 fs-6 lh-base">
                                Streamline your scholarship application process with our AI-powered eligibility evaluation system.
                                Apply, track, and manage your educational funding opportunities all in one place.
                            </p>

                            {/* Features */}
                            <div className="flex-grow-1 mb-4">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="bg-primary bg-opacity-10 rounded-3 p-3 h-100">
                                            <div className="d-flex align-items-center mb-2">
                                                <div className="bg-primary rounded-2 p-2 me-3">
                                                    <GraduationCap size={20} className="text-white" />
                                                </div>
                                                <h6 className="fw-bold mb-0">Smart Eligibility</h6>
                                            </div>
                                            <p className="small text-muted mb-0">
                                                AI-powered system analyzes your profile to determine scholarship eligibility instantly.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="bg-success bg-opacity-10 rounded-3 p-3 h-100">
                                            <div className="d-flex align-items-center mb-2">
                                                <div className="bg-success rounded-2 p-2 me-3">
                                                    <FileText size={20} className="text-white" />
                                                </div>
                                                <h6 className="fw-bold mb-0">Easy Application</h6>
                                            </div>
                                            <p className="small text-muted mb-0">
                                                Simple multi-step process with document upload and real-time tracking.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="bg-info bg-opacity-10 rounded-3 p-3 h-100">
                                            <div className="d-flex align-items-center mb-2">
                                                <div className="bg-info rounded-2 p-2 me-3">
                                                    <BarChart3 size={20} className="text-white" />
                                                </div>
                                                <h6 className="fw-bold mb-0">Real-time Analytics</h6>
                                            </div>
                                            <p className="small text-muted mb-0">
                                                Track progress and view detailed analytics on your applications.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="bg-warning bg-opacity-10 rounded-3 p-3 h-100">
                                            <div className="d-flex align-items-center mb-2">
                                                <div className="bg-warning rounded-2 p-2 me-3">
                                                    <ShieldCheck size={20} className="text-white" />
                                                </div>
                                                <h6 className="fw-bold mb-0">Secure Platform</h6>
                                            </div>
                                            <p className="small text-muted mb-0">
                                                Enterprise-grade security for your personal and academic data.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Footer */}
                            <div
                                className="bg-primary text-white rounded-3 p-4 mt-auto"
                                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%) !important' }}
                            >
                                <div className="row text-center">
                                    <div className="col-4">
                                        <div className="h4 fw-bold mb-1">500+</div>
                                        <div className="small">Students Registered</div>
                                    </div>
                                    <div className="col-4">
                                        <div className="h4 fw-bold mb-1">₱2M+</div>
                                        <div className="small">Scholarships Awarded</div>
                                    </div>
                                    <div className="col-4">
                                        <div className="h4 fw-bold mb-1">95%</div>
                                        <div className="small">Success Rate</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Login Form */}
                    <div className="col-lg-5 col-xl-4 p-4">
                        <div className="bg-white rounded-4 shadow p-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
                            {/* Login Header */}
                            <div className="text-center mb-4">
                                <div className="d-flex align-items-center justify-content-center mb-3">
                                    <div className="bg-primary rounded-3 p-2 me-3">
                                        <LogIn size={24} className="text-white" />
                                    </div>
                                    <div className="text-start">
                                        <h3 className="h4 fw-bold mb-0">Student Login</h3>
                                        <small className="text-muted">Access your dashboard</small>
                                    </div>
                                </div>
                            </div>

                            {/* Error Alert */}
                            {errors && (
                                <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                                    <AlertCircle size={18} className="me-2" />
                                    <span className="small">{errors}</span>
                                </div>
                            )}

                            {/* Login Form */}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault(); // prevent page reload
                                    handleSubmit();
                                }}
                            >
                                {/* Username Field */}
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label small fw-semibold text-secondary">
                                        <User size={14} className="me-1" />
                                        Username
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        className="form-control"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username or student ID"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Password Field */}
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label small fw-semibold text-secondary">
                                        <Lock size={14} className="me-1" />
                                        Password
                                    </label>
                                    <div className="position-relative">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            className="form-control pe-5"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            required
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-link position-absolute top-50 end-0 translate-middle-y border-0 text-muted"
                                            onClick={togglePasswordVisibility}
                                            disabled={isLoading}
                                            style={{ padding: '0.375rem' }}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember & Forgot */}
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="remember"
                                            checked={remember}
                                            onChange={handleRememberChange}
                                            disabled={isLoading}
                                        />
                                        <label htmlFor="remember" className="form-check-label small text-muted">
                                            Remember me
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-link p-0 text-primary small text-decoration-none"
                                        onClick={() => handleLinkClick('/forgot-password')}
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                {/* Login Button */}
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="btn btn-primary w-100 fw-semibold py-2 mb-3"
                                    disabled={isLoading}
                                    style={{
                                        background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                                        border: 'none'
                                    }}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn size={18} className="me-2" />
                                            LOGIN TO DASHBOARD
                                        </>
                                    )}
                                </button>

                                {/* Divider */}
                                <div className="position-relative text-center my-3">
                                    <hr />
                                    <span className="position-absolute top-50 start-50 translate-middle px-2 bg-white small text-muted">
                                        or continue with
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="row g-2 mb-3">
                                    <div className="col-6">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm w-100"
                                            disabled={isLoading}
                                            onClick={() => handleLinkClick('/help')}
                                        >
                                            <HelpCircle size={14} className="me-1" />
                                            Help
                                        </button>
                                    </div>
                                    <div className="col-6">
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm w-100"
                                            onClick={() => handleLinkClick('/application-status')}
                                        >
                                            <Search size={14} className="me-1" />
                                            Track App
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* Footer */}
                            <div className="text-center border-top pt-3">
                                <div className="mb-2">
                                    <span className="text-muted small">New to iScholar?</span>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => handleLinkClick('/register')}
                                >
                                    <UserPlus size={14} className="me-1" />
                                    Create Student Account
                                </button>
                                <div className="mt-3">
                                    <small className="text-muted">
                                        By logging in, you agree to our{' '}
                                        <button
                                            type="button"
                                            className="btn btn-link p-0 text-primary text-decoration-none small"
                                            onClick={() => handleLinkClick('/terms')}
                                        >
                                            Terms
                                        </button>{' '}
                                        and{' '}
                                        <button
                                            type="button"
                                            className="btn btn-link p-0 text-primary text-decoration-none small"
                                            onClick={() => handleLinkClick('/privacy')}
                                        >
                                            Privacy Policy
                                        </button>
                                    </small>
                                </div>
                            </div>

                            {/* Additional Info Icons */}
                            <div className="text-center mt-3">
                                <div className="row g-2 text-muted">
                                    <div className="col-4">
                                        <Clock size={14} className="d-block mx-auto mb-1" />
                                        <div className="small" style={{ fontSize: '0.7rem' }}>24/7 Access</div>
                                    </div>
                                    <div className="col-4">
                                        <Shield size={14} className="d-block mx-auto mb-1" />
                                        <div className="small" style={{ fontSize: '0.7rem' }}>Secure Login</div>
                                    </div>
                                    <div className="col-4">
                                        <Smartphone size={14} className="d-block mx-auto mb-1" />
                                        <div className="small" style={{ fontSize: '0.7rem' }}>Mobile Ready</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;