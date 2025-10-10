import { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from "../config.ts";

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
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
                        <div className="card shadow-sm border-0 mt-5">
                            <div className="card-body p-4 p-md-5">
                                {!isSubmitted ? (
                                    <>
                                        <div className="text-center mb-4">
                                            <div className="bg-primary bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                                 style={{ width: '64px', height: '64px' }}>
                                                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                                </svg>
                                            </div>
                                            <p className="text-muted mb-0 small">
                                                Enter your email address and we'll send you instructions to reset your password.
                                            </p>
                                        </div>

                                        {error && (
                                            <div className="alert alert-danger alert-dismissible fade show d-flex align-items-start" role="alert">
                                                <svg width="20" height="20" fill="currentColor" className="me-2 flex-shrink-0 mt-1">
                                                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                                                </svg>
                                                <div className="flex-grow-1">{error}</div>
                                            </div>
                                        )}

                                        <form onSubmit={handleSubmit} noValidate>
                                            <div className="mb-4">
                                                <label htmlFor="email" className="form-label fw-semibold small">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    className="form-control form-control-lg"
                                                    id="email"
                                                    placeholder="your.email@example.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    autoComplete="email"
                                                    disabled={isLoading}
                                                />
                                                <div className="form-text">
                                                    We'll send reset instructions to this email.
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-lg w-100 mb-3"
                                                disabled={isLoading || !email.trim()}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Sending...
                                                    </>
                                                ) : (
                                                    'Send Reset Instructions'
                                                )}
                                            </button>
                                        </form>

                                        <div className="text-center">
                                            <Link to="/login" className="text-decoration-none small">
                                                <svg width="16" height="16" fill="currentColor" className="me-1">
                                                    <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                                                </svg>
                                                Back to Login
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-center mb-4">
                                            <div className="bg-success bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                                 style={{ width: '64px', height: '64px' }}>
                                                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                                                    <polyline points="20 6 9 17 4 12"/>
                                                </svg>
                                            </div>
                                            <h5 className="fw-bold mb-3">Check Your Email</h5>
                                            <p className="text-muted mb-0 small">{message}</p>
                                        </div>

                                        <div className="card bg-light border-0 mb-4">
                                            <div className="card-body p-3">
                                                <h6 className="fw-semibold mb-2 small">What's Next?</h6>
                                                <ol className="ps-3 mb-0 small text-muted">
                                                    <li className="mb-1">Check your email inbox (and spam folder)</li>
                                                    <li className="mb-1">Click the reset link in the email</li>
                                                    <li className="mb-0">Create a new password</li>
                                                </ol>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleBackToLogin}
                                            className="btn btn-outline-primary btn-lg w-100 mb-3"
                                        >
                                            Send Another Email
                                        </button>

                                        <div className="text-center">
                                            <Link to="/login" className="text-decoration-none small">
                                                <svg width="16" height="16" fill="currentColor" className="me-1">
                                                    <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                                                </svg>
                                                Back to Login
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;