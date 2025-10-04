import { useState } from 'react';
import { Link } from 'react-router-dom';
import {API_BASE_URL} from "../config.ts";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/request-password-reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.status === "success") {
                setMessage('If that email exists, you will receive reset instructions shortly.');
                setIsSubmitted(true);
            } else {
                setError(data.message || 'Failed to send reset instructions. Please try again.');
            }

        } catch (error) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        setIsSubmitted(false);
        setEmail('');
        setMessage('');
        setError('');
    };

    return (
        <>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                .fade-in {
                    animation: fadeIn 0.5s ease-out;
                }
                
                .slide-down {
                    animation: slideDown 0.3s ease-out;
                }
                
                .icon-pulse {
                    animation: pulse 2s ease-in-out infinite;
                }
                
                .gradient-bg {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                
                .card-shadow {
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                }
                
                .input-focus:focus {
                    border-color: #667eea !important;
                    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
                }
                
                .btn-gradient {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    transition: all 0.3s ease;
                }
                
                .btn-gradient:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
                    background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
                }
                
                .btn-gradient:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                
                .icon-container {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
                }
                
                .success-icon-container {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                    box-shadow: 0 10px 30px rgba(17, 153, 142, 0.3);
                }
                
                .alert-modern {
                    border: none;
                    border-radius: 12px;
                    padding: 1rem 1.25rem;
                }
                
                .steps-container {
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    border-radius: 12px;
                    padding: 1.5rem;
                    border-left: 4px solid #667eea;
                }
                
                .step-item {
                    position: relative;
                    padding-left: 2rem;
                    margin-bottom: 0.75rem;
                }
                
                .step-item:last-child {
                    margin-bottom: 0;
                }
                
                .step-item::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 24px;
                    height: 24px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .link-hover {
                    transition: all 0.2s ease;
                    color: #667eea;
                }
                
                .link-hover:hover {
                    color: #764ba2;
                    text-decoration: underline !important;
                }
            `}</style>
            
            <div className="min-vh-100 d-flex align-items-center justify-content-center  py-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
                            <div className="card border-0 rounded-4 card-shadow fade-in">
                                
                                <div className="card-body p-4 p-sm-5">
                                    {!isSubmitted ? (
                                        <>
                                            <div className="text-center mb-4">
                                                <div className="icon-container rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center icon-pulse">
                                                    <i className="fas fa-lock text-white" style={{ fontSize: '2rem' }}></i>
                                                </div>
                                                <h3 className="fw-bold mb-2" style={{ color: '#2d3748' }}>
                                                    Forgot Password?
                                                </h3>
                                                <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                                                    No worries! Enter your email and we'll send you reset instructions.
                                                </p>
                                            </div>

                                            {error && (
                                                <div className="alert alert-danger alert-modern d-flex align-items-start mb-4 slide-down" role="alert">
                                                    <i className="fas fa-exclamation-circle me-3 mt-1" style={{ fontSize: '1.25rem' }}></i>
                                                    <div>{error}</div>
                                                </div>
                                            )}

                                            <form onSubmit={handleSubmit} noValidate>
                                                <div className="mb-4">
                                                    <label htmlFor="email" className="form-label fw-semibold mb-2" style={{ color: '#4a5568' }}>
                                                        Email Address
                                                    </label>
                                                    <div className="input-group input-group-lg">
                                                        <span className="input-group-text bg-light border-end-0 pe-0" style={{ borderColor: '#e2e8f0' }}>
                                                            <i className="fas fa-envelope text-muted"></i>
                                                        </span>
                                                        <input
                                                            type="email"
                                                            className="form-control border-start-0 ps-2 input-focus"
                                                            id="email"
                                                            placeholder="your.email@example.com"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            required
                                                            autoComplete="email"
                                                            disabled={isLoading}
                                                            style={{ 
                                                                borderColor: '#e2e8f0',
                                                                fontSize: '1rem'
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="form-text mt-2">
                                                        <small className="text-muted">
                                                            <i className="fas fa-info-circle me-1"></i>
                                                            We'll send reset instructions to this address.
                                                        </small>
                                                    </div>
                                                </div>

                                                <button
                                                    type="submit"
                                                    className="btn btn-gradient text-white w-100 py-3 fw-semibold mb-3"
                                                    disabled={isLoading || !email.trim()}
                                                    style={{ fontSize: '1.05rem' }}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Sending Instructions...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-paper-plane me-2"></i>
                                                            Send Reset Instructions
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-center mb-4 fade-in">
                                                <div className="success-icon-container rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center">
                                                    <i className="fas fa-check-circle text-white" style={{ fontSize: '2.5rem' }}></i>
                                                </div>
                                                <h3 className="fw-bold mb-2" style={{ color: '#2d3748' }}>
                                                    Check Your Email
                                                </h3>
                                                <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                                                    Instructions sent successfully!
                                                </p>
                                            </div>

                                            {message && (
                                                <div className="alert alert-success alert-modern d-flex align-items-start mb-4 slide-down" role="alert">
                                                    <i className="fas fa-check-circle me-3 mt-1" style={{ fontSize: '1.25rem' }}></i>
                                                    <div>{message}</div>
                                                </div>
                                            )}

                                            <div className="steps-container mb-4">
                                                <div className="mb-3">
                                                    <strong style={{ color: '#2d3748', fontSize: '1.05rem' }}>
                                                        <i className="fas fa-list-check me-2"></i>
                                                        What's Next?
                                                    </strong>
                                                </div>
                                                <div className="step-item">
                                                    <div style={{ color: '#4a5568', fontSize: '0.95rem' }}>
                                                        <strong>Step 1:</strong> Check your email inbox
                                                    </div>
                                                    <small className="text-muted d-block">(Don't forget spam folder!)</small>
                                                </div>
                                                <div className="step-item">
                                                    <div style={{ color: '#4a5568', fontSize: '0.95rem' }}>
                                                        <strong>Step 2:</strong> Click the reset link
                                                    </div>
                                                    <small className="text-muted d-block">Valid for 24 hours</small>
                                                </div>
                                                <div className="step-item">
                                                    <div style={{ color: '#4a5568', fontSize: '0.95rem' }}>
                                                        <strong>Step 3:</strong> Create a new password
                                                    </div>
                                                    <small className="text-muted d-block">Make it strong and secure!</small>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleBackToLogin}
                                                className="btn btn-outline-primary w-100 py-3 fw-semibold"
                                                style={{ borderWidth: '2px', fontSize: '1.05rem' }}
                                            >
                                                <i className="fas fa-arrow-left me-2"></i>
                                                Send Another Email
                                            </button>
                                        </>
                                    )}

                                    <div className="text-center mt-4 pt-4 border-top">
                                        <div className="mb-3">
                                            <i className="fas fa-shield-alt text-muted me-2"></i>
                                            <small className="text-muted">
                                                Remember your password?{' '}
                                                <Link to="/login" className="text-decoration-none fw-semibold link-hover">
                                                    Back to Login
                                                </Link>
                                            </small>
                                        </div>
                                        <div>
                                            <i className="fas fa-headset text-muted me-2"></i>
                                            <small className="text-muted">
                                                Need help?{' '}
                                                <Link to="/contact" className="text-decoration-none link-hover">
                                                    Contact Support
                                                </Link>
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;