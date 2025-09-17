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
                // safer, non-enumerable message
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
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                        <div className="card shadow-lg border-0 rounded-4">
                            <div className="card-header bg-primary text-white text-center py-4 rounded-top-4">
                                <h4 className="mb-0 fw-bold">
                                    <i className="fas fa-shield-alt me-2"></i>
                                    Password Reset
                                </h4>
                            </div>

                            <div className="card-body p-5">
                                {!isSubmitted ? (
                                    <>
                                        <div className="text-center mb-4">
                                            <div className="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                                 style={{ width: '60px', height: '60px' }}>
                                                <i className="fas fa-lock text-primary fs-2"></i>
                                            </div>
                                            <p className="text-muted mb-0">
                                                Enter your email address and we'll send you instructions to reset your password.
                                            </p>
                                        </div>

                                        {error && (
                                            <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                                                <i className="fas fa-exclamation-triangle me-2"></i>
                                                <small>{error}</small>
                                            </div>
                                        )}

                                        <form onSubmit={handleSubmit} noValidate>
                                            <div className="mb-4">
                                                <label htmlFor="email" className="form-label fw-semibold">
                                                    Email Address
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0">
                                                        <i className="fas fa-envelope text-muted"></i>
                                                    </span>
                                                    <input
                                                        type="email"
                                                        className="form-control border-start-0 py-3"
                                                        id="email"
                                                        placeholder="Enter your email address"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                        autoComplete="email"
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                                <div className="form-text">
                                                    <small className="text-muted">
                                                        We'll send reset instructions to this email address.
                                                    </small>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                className="btn btn-primary w-100 py-3 fw-semibold"
                                                disabled={isLoading || !email.trim()}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <i className="fas fa-spinner fa-spin me-2"></i>
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
                                        <div className="text-center mb-4">
                                            <div className="bg-success bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                                 style={{ width: '60px', height: '60px' }}>
                                                <i className="fas fa-check-circle text-success fs-2"></i>
                                            </div>
                                            <h5 className="text-success mb-3">Instructions Sent!</h5>
                                        </div>

                                        {message && (
                                            <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
                                                <i className="fas fa-check-circle me-2"></i>
                                                <small>{message}</small>
                                            </div>
                                        )}

                                        <div className="bg-light rounded p-3 mb-4">
                                            <small className="text-muted d-block mb-2">
                                                <strong>What's next?</strong>
                                            </small>
                                            <small className="text-muted">
                                                1. Check your email inbox (and spam folder)<br/>
                                                2. Click the reset link in the email<br/>
                                                3. Create a new password
                                            </small>
                                        </div>

                                        <button
                                            onClick={handleBackToLogin}
                                            className="btn btn-outline-primary w-100 py-3 fw-semibold"
                                        >
                                            <i className="fas fa-arrow-left me-2"></i>
                                            Send Another Email
                                        </button>
                                    </>
                                )}

                                <div className="text-center mt-4 pt-3 border-top">
                                    <small className="text-muted">
                                        Remember your password?{' '}
                                        <Link to="/login" className="text-decoration-none fw-semibold">
                                            Back to Login
                                        </Link>
                                    </small>
                                </div>

                                <div className="text-center mt-3">
                                    <small className="text-muted">
                                        Need help?{' '}
                                        <Link to="/contact" className="text-decoration-none">
                                            Contact Support
                                        </Link>
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-4">
                            <small className="text-muted">
                                © 2025 iScholar. Secure password reset system.
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
