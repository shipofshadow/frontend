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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    const getPasswordStrength = (pass: string) => {
        if (!pass) return { strength: 0, text: '', color: '' };
        
        let strength = 0;
        if (pass.length >= 8) strength++;
        if (pass.length >= 12) strength++;
        if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
        if (/\d/.test(pass)) strength++;
        if (/[^a-zA-Z0-9]/.test(pass)) strength++;

        if (strength <= 2) return { strength: 33, text: 'Weak', color: 'danger' };
        if (strength <= 3) return { strength: 66, text: 'Medium', color: 'warning' };
        return { strength: 100, text: 'Strong', color: 'success' };
    };

    const passwordStrength = getPasswordStrength(password);

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
                
                @keyframes checkmark {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
                
                .fade-in {
                    animation: fadeIn 0.5s ease-out;
                }
                
                .slide-down {
                    animation: slideDown 0.3s ease-out;
                }
                
                .checkmark-animate {
                    animation: checkmark 0.5s ease-out;
                }
                
                .card-shadow {
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                
                .card-shadow:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.15);
                }
                
                .input-focus:focus {
                    border-color: #0d6efd !important;
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15) !important;
                }
                
                .btn-modern {
                    border-radius: 12px;
                    transition: all 0.3s ease;
                    font-weight: 600;
                    letter-spacing: 0.3px;
                }
                
                .btn-modern:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(13, 110, 253, 0.3);
                }
                
                .btn-modern:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                .icon-container {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
                    box-shadow: 0 10px 30px rgba(13, 110, 253, 0.25);
                }
                
                .success-icon-container {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #198754 0%, #146c43 100%);
                    box-shadow: 0 10px 30px rgba(25, 135, 84, 0.25);
                }
                
                .alert-modern {
                    border: none;
                    border-radius: 12px;
                    padding: 1rem 1.25rem;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                }
                
                .password-toggle {
                    cursor: pointer;
                    transition: color 0.2s ease;
                }
                
                .password-toggle:hover {
                    color: #0d6efd !important;
                }
                
                .strength-meter {
                    height: 6px;
                    background: #e9ecef;
                    border-radius: 10px;
                    overflow: hidden;
                    margin-top: 0.5rem;
                }
                
                .strength-bar {
                    height: 100%;
                    transition: width 0.3s ease, background-color 0.3s ease;
                    border-radius: 10px;
                }
                
                .requirements-list {
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 1rem;
                    margin-top: 1rem;
                }
                
                .requirement-item {
                    display: flex;
                    align-items: center;
                    padding: 0.5rem 0;
                    font-size: 0.9rem;
                    color: #6c757d;
                }
                
                .requirement-item.met {
                    color: #198754;
                }
                
                .requirement-item i {
                    width: 20px;
                    margin-right: 0.5rem;
                }
                
                .bg-pattern {
                    background-color: #f8f9fa;
                    background-image: 
                        linear-gradient(30deg, #f0f0f0 12%, transparent 12.5%, transparent 87%, #f0f0f0 87.5%, #f0f0f0),
                        linear-gradient(150deg, #f0f0f0 12%, transparent 12.5%, transparent 87%, #f0f0f0 87.5%, #f0f0f0),
                        linear-gradient(30deg, #f0f0f0 12%, transparent 12.5%, transparent 87%, #f0f0f0 87.5%, #f0f0f0),
                        linear-gradient(150deg, #f0f0f0 12%, transparent 12.5%, transparent 87%, #f0f0f0 87.5%, #f0f0f0);
                    background-size: 80px 140px;
                    background-position: 0 0, 0 0, 40px 70px, 40px 70px;
                }
            `}</style>
            
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-pattern py-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-sm-12 col-md-12 col-lg-7 col-xl-7">
                            <div className="card border-0 rounded-4 card-shadow fade-in">
                                
                                <div className="card-body p-4 p-sm-5">
                                    {!isSubmitted ? (
                                        <>
                                            <div className="text-center mb-4">
                                                <div className="icon-container rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center">
                                                    <i className="fas fa-unlock-alt text-white" style={{ fontSize: '2rem' }}></i>
                                                </div>
                                                <h3 className="fw-bold mb-2" style={{ color: '#2d3748' }}>
                                                    Reset Your Password
                                                </h3>
                                                <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                                                    Create a strong, secure password for your account
                                                </p>
                                            </div>

                                            {error && (
                                                <div className="alert alert-danger alert-modern d-flex align-items-start mb-4 slide-down" role="alert">
                                                    <i className="fas fa-exclamation-circle me-3 mt-1" style={{ fontSize: '1.25rem' }}></i>
                                                    <div>{error}</div>
                                                </div>
                                            )}

                                            {message && (
                                                <div className="alert alert-success alert-modern d-flex align-items-start mb-4 slide-down" role="alert">
                                                    <i className="fas fa-check-circle me-3 mt-1" style={{ fontSize: '1.25rem' }}></i>
                                                    <div>{message}</div>
                                                </div>
                                            )}

                                            <form onSubmit={handleSubmit}>
                                                <div className="mb-4">
                                                    <label htmlFor="password" className="form-label fw-semibold mb-2" style={{ color: '#4a5568' }}>
                                                        New Password
                                                    </label>
                                                    <div className="input-group input-group-lg">
                                                        <span className="input-group-text bg-light border-end-0 pe-0" style={{ borderColor: '#e2e8f0' }}>
                                                            <i className="fas fa-lock text-muted"></i>
                                                        </span>
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            className="form-control border-start-0 border-end-0 ps-2 pe-0 input-focus"
                                                            id="password"
                                                            placeholder="Enter new password"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            required
                                                            disabled={isLoading}
                                                            style={{ 
                                                                borderColor: '#e2e8f0',
                                                                fontSize: '1rem'
                                                            }}
                                                        />
                                                        <span 
                                                            className="input-group-text bg-light border-start-0 ps-2 password-toggle" 
                                                            style={{ borderColor: '#e2e8f0' }}
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                                                        </span>
                                                    </div>
                                                    
                                                    {password && (
                                                        <div className="slide-down">
                                                            <div className="strength-meter">
                                                                <div 
                                                                    className={`strength-bar bg-${passwordStrength.color}`}
                                                                    style={{ width: `${passwordStrength.strength}%` }}
                                                                ></div>
                                                            </div>
                                                            <small className={`text-${passwordStrength.color} mt-1 d-block`}>
                                                                Password Strength: <strong>{passwordStrength.text}</strong>
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mb-4">
                                                    <label htmlFor="confirmPassword" className="form-label fw-semibold mb-2" style={{ color: '#4a5568' }}>
                                                        Confirm Password
                                                    </label>
                                                    <div className="input-group input-group-lg">
                                                        <span className="input-group-text bg-light border-end-0 pe-0" style={{ borderColor: '#e2e8f0' }}>
                                                            <i className="fas fa-lock text-muted"></i>
                                                        </span>
                                                        <input
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            className="form-control border-start-0 border-end-0 ps-2 pe-0 input-focus"
                                                            id="confirmPassword"
                                                            placeholder="Confirm new password"
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            required
                                                            disabled={isLoading}
                                                            style={{ 
                                                                borderColor: '#e2e8f0',
                                                                fontSize: '1rem'
                                                            }}
                                                        />
                                                        <span 
                                                            className="input-group-text bg-light border-start-0 ps-2 password-toggle" 
                                                            style={{ borderColor: '#e2e8f0' }}
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        >
                                                            <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                                                        </span>
                                                    </div>
                                                    
                                                    {confirmPassword && password && (
                                                        <small className={`mt-1 d-block slide-down ${confirmPassword === password ? 'text-success' : 'text-danger'}`}>
                                                            <i className={`fas ${confirmPassword === password ? 'fa-check-circle' : 'fa-times-circle'} me-1`}></i>
                                                            {confirmPassword === password ? 'Passwords match' : 'Passwords do not match'}
                                                        </small>
                                                    )}
                                                </div>

                                                <div className="requirements-list slide-down mb-4">
                                                    <div className="mb-2">
                                                        <small className="fw-semibold" style={{ color: '#4a5568' }}>
                                                            <i className="fas fa-info-circle me-2"></i>
                                                            Password Requirements:
                                                        </small>
                                                    </div>
                                                    <div className={`requirement-item ${password.length >= 8 ? 'met' : ''}`}>
                                                        <i className={`fas ${password.length >= 8 ? 'fa-check-circle' : 'fa-circle'}`}></i>
                                                        At least 8 characters long
                                                    </div>
                                                    <div className={`requirement-item ${/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'met' : ''}`}>
                                                        <i className={`fas ${/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'fa-check-circle' : 'fa-circle'}`}></i>
                                                        Mixed case letters (a-z, A-Z)
                                                    </div>
                                                    <div className={`requirement-item ${/\d/.test(password) ? 'met' : ''}`}>
                                                        <i className={`fas ${/\d/.test(password) ? 'fa-check-circle' : 'fa-circle'}`}></i>
                                                        At least one number (0-9)
                                                    </div>
                                                    <div className={`requirement-item ${/[^a-zA-Z0-9]/.test(password) ? 'met' : ''}`}>
                                                        <i className={`fas ${/[^a-zA-Z0-9]/.test(password) ? 'fa-check-circle' : 'fa-circle'}`}></i>
                                                        Special character (!@#$%^&*)
                                                    </div>
                                                </div>

                                                <button
                                                    type="submit"
                                                    className="btn btn-primary btn-modern w-100 py-3 mb-3"
                                                    disabled={isLoading || !token || password !== confirmPassword || !password}
                                                    style={{ fontSize: '1.05rem' }}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Resetting Password...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-check-circle me-2"></i>
                                                            Reset Password
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        </>
                                    ) : (
                                        <div className="text-center fade-in">
                                            <div className="success-icon-container rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center checkmark-animate">
                                                <i className="fas fa-check-circle text-white" style={{ fontSize: '2.5rem' }}></i>
                                            </div>
                                            <h3 className="fw-bold mb-3" style={{ color: '#2d3748' }}>
                                                Password Reset Successful!
                                            </h3>
                                            <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>
                                                Your password has been updated successfully. You can now log in with your new password.
                                            </p>
                                            
                                            <div className="bg-light rounded-3 p-3 mb-4">
                                                <small className="text-muted d-block">
                                                    <i className="fas fa-shield-alt me-2"></i>
                                                    <strong>Security Tip:</strong> Never share your password with anyone and consider using a password manager.
                                                </small>
                                            </div>
                                            
                                            <Link to="/login" className="btn btn-primary btn-modern w-100 py-3" style={{ fontSize: '1.05rem' }}>
                                                <i className="fas fa-sign-in-alt me-2"></i>
                                                Continue to Login
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResetPassword;