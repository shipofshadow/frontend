import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import Swal from 'sweetalert2';
import { sha256 } from 'js-sha256';

interface ProfileFormData {
    first_name: string;
    last_name: string;
    email: string;
    contact_number: string;
}

interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface PasswordStrength {
    score: number;
    feedback: string[];
    isValid: boolean;
}

const Settings: React.FC = () => {
    const { user, token, refreshUser } = useAuth();
    const profile = user?.profile;

    const [profileData, setProfileData] = useState<ProfileFormData>({
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        email: profile?.email || '',
        contact_number: profile?.contact_number || ''
    });

    const [passwordData, setPasswordData] = useState<PasswordFormData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
        score: 0,
        feedback: [],
        isValid: false
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Update form data when user profile changes
    useEffect(() => {
        if (profile) {
            setProfileData({
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                email: profile.email || '',
                contact_number: profile.contact_number || ''
            });
        }
    }, [profile]);

    const assessPasswordStrength = (password: string): PasswordStrength => {
        if (!password) return { score: 0, feedback: [], isValid: false };

        let score = 0;
        const feedback: string[] = [];

        if (password.length >= 8) score += 1;
        else feedback.push('At least 8 characters');

        if (/[A-Z]/.test(password)) score += 1;
        else feedback.push('One uppercase letter');

        if (/[a-z]/.test(password)) score += 1;
        else feedback.push('One lowercase letter');

        if (/\d/.test(password)) score += 1;
        else feedback.push('One number');

        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
        else feedback.push('One special character');

        return {
            score,
            feedback,
            isValid: score >= 4
        };
    };

    const handleProfileChange = (field: keyof ProfileFormData, value: string) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    const handlePasswordChange = (field: keyof PasswordFormData, value: string) => {
        setPasswordData(prev => ({ ...prev, [field]: value }));
        if (field === 'newPassword') {
            setPasswordStrength(assessPasswordStrength(value));
        }
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength.score <= 1) return 'danger';
        if (passwordStrength.score <= 3) return 'warning';
        return 'success';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength.score <= 1) return 'Weak';
        if (passwordStrength.score <= 3) return 'Fair';
        return 'Strong';
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProfileLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/profile/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (!response.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error || 'Failed to update profile'
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: data.message || 'Profile updated successfully'
                });
                await refreshUser();
            }
        } catch (error) {
            console.error('Profile update error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An unexpected error occurred'
            });
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side validation
        if (!passwordData.currentPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Current password is required'
            });
            return;
        }

        if (!passwordStrength.isValid) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'New password does not meet requirements'
            });
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Passwords do not match'
            });
            return;
        }

        if (passwordData.currentPassword === passwordData.newPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'New password must be different from current password'
            });
            return;
        }

        setIsPasswordLoading(true);

        try {
            const hashedNewPassword = sha256(passwordData.newPassword);
            const hashedConfirmPassword = sha256(passwordData.confirmPassword);
            const hashedCurrentPassword = sha256(passwordData.currentPassword);

            const response = await fetch(`${API_BASE_URL}/api/profile/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    old_password: hashedCurrentPassword,
                    new_password: hashedNewPassword,
                    confirm_password: hashedConfirmPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error || 'Failed to change password'
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: data.message || 'Password changed successfully'
                });

                // Clear password fields on success
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setPasswordStrength({ score: 0, feedback: [], isValid: false });
            }
        } catch (error) {
            console.error('Password change error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An unexpected error occurred'
            });
        } finally {
            setIsPasswordLoading(false);
        }
    };

    return (
        <>
            <header className="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
                <div className="container-fluid px-4">
                    <div className="page-header-content">
                        <div className="row align-items-center justify-content-between pt-3">
                            <div className="col-auto mb-3">
                                <h1 className="page-header-title">
                                    <div className="page-header-icon"><i data-feather="settings"></i></div>
                                    Account Settings
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-fluid px-4">
                <div className="row">
                    {/* User Details Card */}
                    <div className="col-lg-6 mb-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-primary text-white py-3">
                                <h5 className="card-title mb-0 d-flex align-items-center">
                                    <i className="far fa-user me-2"></i>
                                    User Details
                                </h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleProfileSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">
                                                <i className="far fa-user me-1 text-primary"></i>
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={profileData.first_name}
                                                onChange={(e) => handleProfileChange('first_name', e.target.value)}
                                                placeholder="First Name"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">
                                                <i className="far fa-user me-1 text-primary"></i>
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={profileData.last_name}
                                                onChange={(e) => handleProfileChange('last_name', e.target.value)}
                                                placeholder="Last Name"
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-medium">
                                                <i className="far fa-envelope me-1 text-primary"></i>
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={profileData.email}
                                                onChange={(e) => handleProfileChange('email', e.target.value)}
                                                placeholder="Email"
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-medium">
                                                <i className="fas fa-phone me-1 text-primary"></i>
                                                Contact Number
                                            </label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={profileData.contact_number}
                                                onChange={(e) => handleProfileChange('contact_number', e.target.value)}
                                                placeholder="Contact Number"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={isProfileLoading}
                                        >
                                            {isProfileLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="far fa-check me-2"></i>
                                                    Update Profile
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <div className="col-lg-6 mb-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-danger text-white py-3">
                                <h5 className="card-title mb-0 d-flex align-items-center">
                                    <i className="fas fa-shield me-2"></i>
                                    Change Password
                                </h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handlePasswordSubmit}>
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label fw-medium">
                                                <i className="far fa-key me-1 text-danger"></i>
                                                Current Password
                                            </label>
                                            <div className="input-group">
                                                <input
                                                    type={showPassword.current ? 'text' : 'password'}
                                                    className="form-control"
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                                    placeholder="Enter current password"
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => togglePasswordVisibility('current')}
                                                >
                                                    <i className={`far fa-eye${showPassword.current ? '-slash' : ''}`}></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-medium">
                                                <i className="far fa-lock me-1 text-success"></i>
                                                New Password
                                            </label>
                                            <div className="input-group">
                                                <input
                                                    type={showPassword.new ? 'text' : 'password'}
                                                    className="form-control"
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                                    placeholder="Enter new password"
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => togglePasswordVisibility('new')}
                                                >
                                                    <i className={`far fa-eye${showPassword.new ? '-slash' : ''}`}></i>
                                                </button>
                                            </div>

                                            {/* Password Strength Indicator */}
                                            {passwordData.newPassword && (
                                                <div className="mt-2">
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <small className="text-muted">Password Strength:</small>
                                                        <small className={`text-${getPasswordStrengthColor()} fw-medium`}>
                                                            {getPasswordStrengthText()}
                                                        </small>
                                                    </div>
                                                    <div className="progress" style={{ height: '4px' }}>
                                                        <div
                                                            className={`progress-bar bg-${getPasswordStrengthColor()}`}
                                                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-medium">
                                                <i className="far fa-lock me-1 text-success"></i>
                                                Confirm New Password
                                            </label>
                                            <div className="input-group">
                                                <input
                                                    type={showPassword.confirm ? 'text' : 'password'}
                                                    className="form-control"
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                                    placeholder="Confirm new password"
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => togglePasswordVisibility('confirm')}
                                                >
                                                    <i className={`far fa-eye${showPassword.confirm ? '-slash' : ''}`}></i>
                                                </button>
                                            </div>

                                            {/* Password Match Indicator */}
                                            {passwordData.confirmPassword && (
                                                <div className="mt-2">
                                                    <small className={`${passwordData.newPassword === passwordData.confirmPassword ? 'text-success' : 'text-danger'}`}>
                                                        <i className={`far fa-${passwordData.newPassword === passwordData.confirmPassword ? 'check-circle' : 'times-circle'} me-1`}></i>
                                                        {passwordData.newPassword === passwordData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                                                    </small>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Password Requirements */}
                                    <div className="mt-3">
                                        <div className="card border-0 bg-light">
                                            <div className="card-body p-3">
                                                <h6 className="card-title mb-2 small">
                                                    <i className="far fa-info-circle me-1"></i>
                                                    Password Requirements:
                                                </h6>
                                                <div className="row g-1">
                                                    {[
                                                        { text: 'At least 8 characters', check: passwordData.newPassword.length >= 8 },
                                                        { text: 'One uppercase letter', check: /[A-Z]/.test(passwordData.newPassword) },
                                                        { text: 'One lowercase letter', check: /[a-z]/.test(passwordData.newPassword) },
                                                        { text: 'One number', check: /\d/.test(passwordData.newPassword) },
                                                        { text: 'One special character', check: /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) }
                                                    ].map((req, index) => (
                                                        <div key={index} className="col-md-6">
                                                            <small className={`d-flex align-items-center ${req.check ? 'text-success' : 'text-muted'}`}>
                                                                <i className={`far fa-${req.check ? 'check-circle' : 'circle'} me-1`}></i>
                                                                {req.text}
                                                            </small>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <button
                                            type="submit"
                                            className="btn btn-danger"
                                            disabled={isPasswordLoading}
                                        >
                                            {isPasswordLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Updating Password...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-shield me-2"></i>
                                                    Change Password
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Settings;
