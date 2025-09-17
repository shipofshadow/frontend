import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {API_BASE_URL} from "../config.ts";
import {sha256} from "js-sha256";

const ResetPassword = () => {
    useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing password reset token.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        const hashed_password = sha256(password)


        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/confirm-password-reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, new_password: hashed_password }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                setMessage('Your password has been reset successfully. You can now log in.');
                setIsSubmitted(true);
            } else {
                setError(data.message || 'Failed to reset password. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                        <div className="card shadow-lg border-0 rounded-4">
                            <div className="card-header bg-primary text-white text-center py-4 rounded-top-4">
                                <h4 className="mb-0 fw-bold">
                                    <i className="fas fa-unlock-alt me-2"></i>
                                    Reset Password
                                </h4>
                            </div>

                            <div className="card-body p-5">
                                {!isSubmitted ? (
                                    <>
                                        {error && (
                                            <div
                                                className="alert alert-danger d-flex align-items-center mb-4"
                                                role="alert"
                                            >
                                                <i className="fas fa-exclamation-triangle me-2"></i>
                                                <small>{error}</small>
                                            </div>
                                        )}

                                        {message && (
                                            <div
                                                className="alert alert-success d-flex align-items-center mb-4"
                                                role="alert"
                                            >
                                                <i className="fas fa-check-circle me-2"></i>
                                                <small>{message}</small>
                                            </div>
                                        )}

                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-4">
                                                <label htmlFor="password" className="form-label fw-semibold">
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    className="form-control py-3"
                                                    id="password"
                                                    placeholder="Enter new password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    disabled={isLoading}
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="confirmPassword" className="form-label fw-semibold">
                                                    Confirm Password
                                                </label>
                                                <input
                                                    type="password"
                                                    className="form-control py-3"
                                                    id="confirmPassword"
                                                    placeholder="Confirm new password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                    disabled={isLoading}
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className="btn btn-primary w-100 py-3 fw-semibold"
                                                disabled={isLoading || !token}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <i className="fas fa-spinner fa-spin me-2"></i>
                                                        Resetting Password...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-check me-2"></i>
                                                        Reset Password
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <div
                                            className="bg-success bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                            style={{ width: '60px', height: '60px' }}
                                        >
                                            <i className="fas fa-check-circle text-success fs-2"></i>
                                        </div>
                                        <h5 className="text-success mb-3">Password Reset Successful!</h5>
                                        <p className="text-muted mb-4">
                                            You can now log in with your new password.
                                        </p>
                                        <Link to="/login" className="btn btn-primary w-100 py-3 fw-semibold">
                                            <i className="fas fa-sign-in-alt me-2"></i>
                                            Back to Login
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center mt-4">
                            <small className="text-muted">© 2025 iScholar. Secure password reset system.</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
