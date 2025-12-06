import React, { useState, useEffect, useRef, useMemo } from 'react';
import {useAuth} from "../../context/AuthContext.tsx";
import { API_BASE_URL } from '../../config.ts';
import Swal from 'sweetalert2';
import { sha256 } from 'js-sha256';


interface FormData {
    email: string;
    phone: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    emergencyContact: string;
    emergencyPhone: string;
}

interface ValidationErrors {
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
}

interface PasswordStrength {
    score: number;
    feedback: string[];
    isValid: boolean;
}

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'account' | 'password' | 'notifications' | 'privacy'>('account');
    const [isLoading, setIsLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
        score: 0,
        feedback: [],
        isValid: false
    });
    const { user, token, refreshUser } = useAuth();
    const profile = user?.profile;
    
    // Avatar upload state
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Avatar URL computation
    const currentAvatarUrl = useMemo(() => {
        const avatar = profile?.avatar;
        if (!avatar) return null;
        if (avatar.startsWith('http')) return avatar;
        return `${API_BASE_URL}/api/profile/avatar/${encodeURIComponent(avatar.replace(/^.*[\\/]/, ''))}`;
    }, [profile?.avatar]);


    const [formData, setFormData] = useState<FormData>({
        email: user?.profile?.email || '',
        phone: profile?.contact_number || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        emergencyContact: profile?.emergency_contact_name || '',
        emergencyPhone: profile?.emergency_contact_number || ''
    });

    const [notifications, setNotifications] = useState({
        emailUpdates: true,
        smsAlerts: false,
        pushNotifications: true,
        academicReminders: true,
        applicationStatus: true,
        scholarshipAlerts: true,
        maintenanceNotices: false
    });

    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: 'friends',
        showEmail: false,
        showPhone: false,
        allowMessaging: true,
        dataProcessing: true,
        marketingEmails: false
    });

    // Validation functions
    const validateEmail = (email: string): string | undefined => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return 'Email is required';
        if (!emailRegex.test(email)) return 'Please enter a valid email address';
        return undefined;
    };

    const validatePhone = (phone: string): string | undefined => {
        const phoneRegex = /^(\+63|0)?[9]\d{9}$/;
        if (!phone) return 'Phone number is required';
        if (!phoneRegex.test(phone.replace(/\s+/g, ''))) return 'Please enter a valid Philippine mobile number';
        return undefined;
    };

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

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);

        // Clear validation error for this field
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: undefined }));
        }

        // Real-time password strength assessment
        if (field === 'newPassword') {
            setPasswordStrength(assessPasswordStrength(value));
        }
    };

    const handleNotificationChange = (field: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [field]: !prev[field] }));
        setHasChanges(true);
    };

    const handlePrivacyChange = (field: keyof typeof privacySettings, value: string | boolean) => {
        setPrivacySettings(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};

        if (activeTab === 'account') {
            const emailError = validateEmail(formData.email);
            if (emailError) errors.email = emailError;

            const phoneError = validatePhone(formData.phone);
            if (phoneError) errors.phone = phoneError;

            if (formData.emergencyContact && formData.emergencyContact.trim().length < 2) {
                errors.emergencyContact = 'Emergency contact name must be at least 2 characters';
            }

            if (formData.emergencyPhone) {
                const emergencyPhoneError = validatePhone(formData.emergencyPhone);
                if (emergencyPhoneError) errors.emergencyPhone = emergencyPhoneError;
            }
        }

        if (activeTab === 'password') {
            if (!formData.currentPassword) errors.currentPassword = 'Current password is required';
            if (!formData.newPassword) errors.newPassword = 'New password is required';
            if (!passwordStrength.isValid) errors.newPassword = 'Password does not meet requirements';
            if (formData.newPassword !== formData.confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }
            if (formData.currentPassword === formData.newPassword) {
                errors.newPassword = 'New password must be different from current password';
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsLoading(false);
        setHasChanges(false);

        // Reset password fields after successful password change
        if (activeTab === 'password') {

            await handlePasswordChange();
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
            setPasswordStrength({ score: 0, feedback: [], isValid: false });
            setHasChanges(false);
            setValidationErrors({});
        }
    };


    
    // Password change API call
    const handlePasswordChange = async () => {
        try {
            const hashedNewPassword = sha256(formData.newPassword);
            const hashedConfirmPassword = sha256(formData.confirmPassword);
            const hashedCurrentPassword = sha256(formData.currentPassword);

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
                    title: 'Oops...',
                    text: data.error || 'Failed to change password',
                });
                throw new Error(data.error || 'Failed to change password');
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: data.message || 'Password changed successfully',
                });
                console.log('Password changed successfully:', data.message);
            }
                
            // Reset password fields after successful change
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
            setPasswordStrength({ score: 0, feedback: [], isValid: false });
            setHasChanges(false);
            setValidationErrors({});

          
        } catch (error) {
            console.error('Password change error:', error);
        }
    };

    // File selection handler with validation
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid File Type',
                text: 'Please select a PNG, JPG, or GIF image'
            });
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            Swal.fire({
                icon: 'error',
                title: 'File Too Large',
                text: 'Please select an image smaller than 5MB'
            });
            return;
        }
        
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    // Avatar upload handler
    const handleAvatarUpload = async () => {
        if (!avatarFile) return;
        
        setIsUploadingAvatar(true);
        const formDataUpload = new FormData();
        formDataUpload.append('avatar', avatarFile);
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/profile/upload-avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataUpload
            });
            
            const data = await response.json();
            
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Profile photo updated successfully'
                });
                await refreshUser();
                setAvatarFile(null);
                setAvatarPreview(null);
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar';
            Swal.fire({
                icon: 'error',
                title: 'Upload Failed',
                text: errorMessage
            });
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    // Cancel upload handler
    const handleCancelUpload = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
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

    // Auto-save indicator
    useEffect(() => {
        if (hasChanges) {
            const timer = setTimeout(() => {
                // Auto-save logic could go here
            }, 30000);

            return () => clearTimeout(timer);
        }
    }, [hasChanges]);

    return (
        <div className="container-fluid py-4">
            
            <div className="row justify-content-center">
                <div className="col-xl-10 col-lg-12">
                    {/* Header */}
                

                    <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                        {/* Enhanced Navigation Tabs */}
                        <div className="card-header border-0 bg-gradient" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                            <div className="nav nav-pills nav-justified bg-white bg-opacity-20 rounded-3 p-1" role="tablist">
                                {[
                                    { key: 'account', icon: 'person', label: 'Account Info', color: 'primary' },
                                    { key: 'password', icon: 'shield', label: 'Security', color: 'danger' },
                                    { key: 'notifications', icon: 'bell', label: 'Notifications', color: 'warning' },
                                    { key: 'privacy', icon: 'eye-slash', label: 'Privacy', color: 'info' }
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        className={`nav-link fw-medium  border-0 ${activeTab === tab.key ? 'active bg-white text-dark' : '-50'}`}
                                        onClick={() => setActiveTab(tab.key as typeof activeTab)}
                                        type="button"
                                    >
                                        <i className={`far fa-${tab.icon} me-2`}></i>
                                        <span className="d-none d-md-inline">{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="card-body p-0">
                            {/* Account Information Tab */}
                            {activeTab === 'account' && (
                                <div className="p-4 p-md-5">
                                    <div className="row align-items-center mb-4">
                                        <div className="col-auto">
                                            <div className="bg-primary bg-gradient rounded-circle p-3 shadow">
                                                <i className="far fa-user-gear fs-3 text-white"></i>
                                            </div>
                                        </div>
                                        <div className="col">
                                            <h3 className="mb-1 fw-bold">Account Information</h3>
                                            <p className="text-muted mb-0">Update your personal details and contact information</p>
                                        </div>
                                    </div>

                                    {/* Profile Photo Section */}
                                    <div className="text-center mb-4 pb-4 border-bottom">
                                        <div className="position-relative d-inline-block mb-3">
                                            <div
                                                className="rounded-circle overflow-hidden border border-3 border-primary"
                                                style={{ width: '120px', height: '120px' }}
                                            >
                                                <img
                                                    src={avatarPreview || currentAvatarUrl || '/default.png'}
                                                    alt="Profile"
                                                    className="w-100 h-100"
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </div>
                                            {isUploadingAvatar && (
                                                <div
                                                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-circle"
                                                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                                                >
                                                    <span className="spinner-border spinner-border-sm text-white" role="status"></span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="d-none"
                                            accept="image/png,image/jpeg,image/gif"
                                            onChange={handleFileSelect}
                                        />
                                        
                                        {!avatarPreview ? (
                                            <div>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <i className="far fa-camera me-2"></i>
                                                    Change Photo
                                                </button>
                                                <div className="form-text mt-2">
                                                    PNG, JPG or GIF (max 5MB)
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="d-flex justify-content-center gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm"
                                                    onClick={handleAvatarUpload}
                                                    disabled={isUploadingAvatar}
                                                >
                                                    {isUploadingAvatar ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="far fa-upload me-2"></i>
                                                            Upload
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={handleCancelUpload}
                                                    disabled={isUploadingAvatar}
                                                >
                                                    <i className="far fa-times me-2"></i>
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <form onSubmit={handleSubmit}>
                                        <div className="row g-4">
                                            {/* Primary Contact */}
                                            <div className="col-12">
                                                <h5 className="fw-bold text-primary border-bottom pb-2 mb-3">
                                                    <i className="far fa-telephone-plus me-2"></i>
                                                    Primary Contact Information
                                                </h5>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">
                                                    <i className="far fa-envelope me-1 text-primary"></i>
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    className={`form-control form-control-lg ${validationErrors.email ? 'is-invalid' : ''}`}
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    placeholder="your@email.com"
                                                />
                                                {validationErrors.email ? (
                                                    <div className="invalid-feedback">{validationErrors.email}</div>
                                                ) : (
                                                    <div className="form-text">
                                                        <i className="far fa-info-circle me-1"></i>
                                                        We'll send verification to your new email
                                                    </div>
                                                )}
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">
                                                    <i className="far fa-telephone me-1 text-primary"></i>
                                                    Phone Number *
                                                </label>
                                                <input
                                                    type="tel"
                                                    className={`form-control form-control-lg ${validationErrors.phone ? 'is-invalid' : ''}`}
                                                    value={formData.phone}
                                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                                    placeholder="+63 9xx xxx xxxx"
                                                />
                                                {validationErrors.phone ? (
                                                    <div className="invalid-feedback">{validationErrors.phone}</div>
                                                ) : (
                                                    <div className="form-text">
                                                        <i className="far fa-shield-check me-1"></i>
                                                        Used for security notifications and SMS alerts
                                                    </div>
                                                )}
                                            </div>


                                        </div>

                                        <hr className="my-5" />

                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted">
                                                    <i className="far fa-clock-history me-1"></i>
                                                    Last updated: March 15, 2024 at 2:30 PM
                                                </small>
                                            </div>
                                            <div className="d-flex gap-3">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-lg"
                                                    onClick={() => {
                                                        setFormData({
                                                            email: user?.email || '',
                                                            phone: profile?.contact_number || '',
                                                            currentPassword: '',
                                                            newPassword: '',
                                                            confirmPassword: '',
                                                            emergencyContact: profile?.emergency_contact_name || '',
                                                            emergencyPhone: profile?.emergency_contact_number || ''
                                                        });
                                                        setHasChanges(false);
                                                        setValidationErrors({});
                                                    }}
                                                >
                                                    <i className="far fa-arrow-clockwise me-2"></i>
                                                    Reset Changes
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary btn-lg"
                                                    disabled={isLoading || !hasChanges}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                            Saving Changes...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="far fa-check-lg me-2"></i>
                                                            Save Account Info
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Password Tab */}
                            {activeTab === 'password' && (
                                <div className="p-4 p-md-5">
                                    <div className="row align-items-center mb-4">
                                        <div className="col-auto">
                                            <div className="bg-danger bg-gradient rounded-circle p-3 shadow">
                                                <i className="far fa-shield fs-3 text-white"></i>
                                            </div>
                                        </div>
                                        <div className="col">
                                            <h3 className="mb-1 fw-bold">Security Settings</h3>
                                            <p className="text-muted mb-0">Update your password and enhance account security</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit}>
                                        <div className="row g-4">
                                            <div className="col-12">
                                                <label className="form-label fw-medium">
                                                    <i className="far fa-key me-1 text-danger"></i>
                                                    Current Password *
                                                </label>
                                                <div className="input-group input-group-lg">
                                                    <input
                                                        type={showPassword.current ? 'text' : 'password'}
                                                        className={`form-control ${validationErrors.currentPassword ? 'is-invalid' : ''}`}
                                                        value={formData.currentPassword}
                                                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                                                        placeholder="Enter your current password"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => togglePasswordVisibility('current')}
                                                    >
                                                        <i className={`far fa-eye${showPassword.current ? '-slash' : ''}`}></i>
                                                    </button>
                                                    {validationErrors.currentPassword && (
                                                        <div className="invalid-feedback">{validationErrors.currentPassword}</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">
                                                    <i className="far fa-shield-plus me-1 text-success"></i>
                                                    New Password *
                                                </label>
                                                <div className="input-group input-group-lg">
                                                    <input
                                                        type={showPassword.new ? 'text' : 'password'}
                                                        className={`form-control ${validationErrors.newPassword ? 'is-invalid' : ''}`}
                                                        value={formData.newPassword}
                                                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                                        placeholder="Enter new password"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => togglePasswordVisibility('new')}
                                                    >
                                                        <i className={`far fa-eye${showPassword.new ? '-slash' : ''}`}></i>
                                                    </button>
                                                    {validationErrors.newPassword && (
                                                        <div className="invalid-feedback">{validationErrors.newPassword}</div>
                                                    )}
                                                </div>

                                                {/* Password Strength Indicator */}
                                                {formData.newPassword && (
                                                    <div className="mt-2">
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <small className="text-muted">Password Strength:</small>
                                                            <small className={`text-${getPasswordStrengthColor()} fw-medium`}>
                                                                {getPasswordStrengthText()}
                                                            </small>
                                                        </div>
                                                        <div className="progress" style={{height: '4px'}}>
                                                            <div
                                                                className={`progress-bar bg-${getPasswordStrengthColor()}`}
                                                                style={{width: `${(passwordStrength.score / 5) * 100}%`}}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">
                                                    <i className="far fa-shield-check me-1 text-success"></i>
                                                    Confirm New Password *
                                                </label>
                                                <div className="input-group input-group-lg">
                                                    <input
                                                        type={showPassword.confirm ? 'text' : 'password'}
                                                        className={`form-control ${validationErrors.confirmPassword ? 'is-invalid' : ''}`}
                                                        value={formData.confirmPassword}
                                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                                        placeholder="Confirm new password"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => togglePasswordVisibility('confirm')}
                                                    >
                                                        <i className={`far fa-eye${showPassword.confirm ? '-slash' : ''}`}></i>
                                                    </button>
                                                    {validationErrors.confirmPassword && (
                                                        <div className="invalid-feedback">{validationErrors.confirmPassword}</div>
                                                    )}
                                                </div>

                                                {/* Password Match Indicator */}
                                                {formData.confirmPassword && (
                                                    <div className="mt-2">
                                                        <small className={`${formData.newPassword === formData.confirmPassword ? 'text-success' : 'text-danger'}`}>
                                                            <i className={`far fa-${formData.newPassword === formData.confirmPassword ? 'check-circle' : 'x-circle'} me-1`}></i>
                                                            {formData.newPassword === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                                                        </small>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Enhanced Password Requirements */}
                                        <div className="mt-4">
                                            <div className="card border-0 bg-light">
                                                <div className="card-body p-4">
                                                    <h6 className="card-title mb-3">
                                                        <i className="far fa-info-circle me-1"></i>
                                                        Password Requirements:
                                                    </h6>
                                                    <div className="row g-2">
                                                        {[
                                                            { text: 'At least 8 characters', check: formData.newPassword.length >= 8 },
                                                            { text: 'One uppercase letter', check: /[A-Z]/.test(formData.newPassword) },
                                                            { text: 'One lowercase letter', check: /[a-z]/.test(formData.newPassword) },
                                                            { text: 'One number', check: /\d/.test(formData.newPassword) },
                                                            { text: 'One special character', check: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) }
                                                        ].map((req, index) => (
                                                            <div key={index} className="col-md-6">
                                                                <small className={`d-flex align-items-center ${req.check ? 'text-success' : 'text-muted'}`}>
                                                                    <i className={`far fa-${req.check ? 'check-circle-fill text-success' : 'circle text-muted'} me-2`}></i>
                                                                    {req.text}
                                                                </small>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="my-5" />

                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted">
                                                    <i className="far fa-shield-check me-1"></i>
                                                    Last password change: January 20, 2024
                                                </small>
                                            </div>
                                            <button
                                                type="submit"
                                                className="btn btn-danger btn-lg"
                                                disabled={isLoading || !hasChanges}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                        Updating Password...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="far fa-shield-lock me-2"></i>
                                                        Update Password
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div className="p-4 p-md-5">
                                    <div className="row align-items-center mb-4">
                                        <div className="col-auto">
                                            <div className="bg-warning bg-gradient rounded-circle p-3 shadow">
                                                <i className="far fa-bell fs-3 text-white "></i>
                                            </div>
                                        </div>
                                        <div className="col">
                                            <h3 className="mb-1 fw-bold">Notification Preferences</h3>
                                            <p className="text-muted mb-0">Choose how you'd like to receive updates and alerts</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit}>
                                        <div className="row g-4">
                                            {/* Academic Notifications */}
                                            <div className="col-12">
                                                <h5 className="fw-bold text-primary border-bottom pb-2 mb-3">
                                                    <i className="far fa-mortarboard me-2"></i>
                                                    Academic & Scholarship Notifications
                                                </h5>
                                            </div>

                                            {[
                                                {
                                                    key: 'applicationStatus',
                                                    icon: 'file-earmark-check',
                                                    title: 'Application Status Updates',
                                                    description: 'Get notified when your scholarship application status changes',
                                                    color: 'primary'
                                                },
                                                {
                                                    key: 'scholarshipAlerts',
                                                    icon: 'award',
                                                    title: 'New Scholarship Opportunities',
                                                    description: 'Receive alerts about new scholarships you may be eligible for',
                                                    color: 'success'
                                                },
                                                {
                                                    key: 'academicReminders',
                                                    icon: 'calendar-check',
                                                    title: 'Academic Reminders',
                                                    description: 'Deadlines, important dates, and academic requirements',
                                                    color: 'info'
                                                }
                                            ].map(notif => (
                                                <div key={notif.key} className="col-12">
                                                    <div className="card border-0 bg-light mb-3">
                                                        <div className="card-body p-4">
                                                            <div className="form-check form-switch d-flex align-items-start">
                                                                <input
                                                                    className="form-check-input mt-1 me-3"
                                                                    type="checkbox"
                                                                    checked={notifications[notif.key as keyof typeof notifications]}
                                                                    onChange={() => handleNotificationChange(notif.key as keyof typeof notifications)}
                                                                    id={notif.key}
                                                                    style={{width: '3em', height: '1.5em'}}
                                                                />
                                                                <div className="flex-grow-1">
                                                                    <label className="form-check-label fw-medium d-flex align-items-center mb-1" htmlFor={notif.key}>
                                                                        <i className={`far fa-${notif.icon} me-2 text-${notif.color}`}></i>
                                                                        {notif.title}
                                                                    </label>
                                                                    <div className="form-text mb-0">{notif.description}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Communication Channels */}
                                            <div className="col-12">
                                                <h5 className="fw-bold text-success border-bottom pb-2 mb-3 mt-4">
                                                    <i className="far fa-chat-dots me-2"></i>
                                                    Communication Channels
                                                </h5>
                                            </div>

                                            {[
                                                {
                                                    key: 'emailUpdates',
                                                    icon: 'envelope',
                                                    title: 'Email Notifications',
                                                    description: 'Receive detailed updates via email',
                                                    color: 'primary'
                                                },
                                                {
                                                    key: 'smsAlerts',
                                                    icon: 'chat-dots',
                                                    title: 'SMS Alerts',
                                                    description: 'Get critical alerts via text message',
                                                    color: 'success'
                                                },
                                                {
                                                    key: 'pushNotifications',
                                                    icon: 'app-indicator',
                                                    title: 'Browser Push Notifications',
                                                    description: 'Instant notifications in your browser',
                                                    color: 'warning'
                                                },
                                                {
                                                    key: 'maintenanceNotices',
                                                    icon: 'tools',
                                                    title: 'System Maintenance Notices',
                                                    description: 'Get notified about scheduled system maintenance',
                                                    color: 'secondary'
                                                }
                                            ].map(notif => (
                                                <div key={notif.key} className="col-md-6">
                                                    <div className="card border-0 bg-light mb-3 h-100">
                                                        <div className="card-body p-4">
                                                            <div className="form-check form-switch d-flex align-items-start">
                                                                <input
                                                                    className="form-check-input mt-1 me-3"
                                                                    type="checkbox"
                                                                    checked={notifications[notif.key as keyof typeof notifications]}
                                                                    onChange={() => handleNotificationChange(notif.key as keyof typeof notifications)}
                                                                    id={notif.key}
                                                                    style={{width: '3em', height: '1.5em'}}
                                                                />
                                                                <div className="flex-grow-1">
                                                                    <label className="form-check-label fw-medium d-flex align-items-center mb-1" htmlFor={notif.key}>
                                                                        <i className={`far fa-${notif.icon} me-2 text-${notif.color}`}></i>
                                                                        {notif.title}
                                                                    </label>
                                                                    <div className="form-text mb-0">{notif.description}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <hr className="my-5" />

                                        <div className="d-flex justify-content-end">
                                            <button
                                                type="submit"
                                                className="btn btn-warning btn-lg"
                                                disabled={isLoading || !hasChanges}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                        Saving Preferences...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="far fa-check-lg me-2"></i>
                                                        Save Notification Preferences
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Privacy Tab */}
                            {activeTab === 'privacy' && (
                                <div className="p-4 p-md-5">
                                    <div className="row align-items-center mb-4">
                                        <div className="col-auto">
                                            <div className="bg-info bg-gradient rounded-circle p-3 shadow">
                                                <i className="far fa-eye-slash fs-3 text-white"></i>
                                            </div>
                                        </div>
                                        <div className="col">
                                            <h3 className="mb-1 fw-bold">Privacy & Data Settings</h3>
                                            <p className="text-muted mb-0">Control your privacy and data processing preferences</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit}>
                                        <div className="row g-4">
                                


                                            {/* Contact Information Privacy */}
                                            <div className="col-12">
                                                <h5 className="fw-bold text-warning border-bottom pb-2 mb-3 mt-4">
                                                    <i className="far fa-telephone-x me-2"></i>
                                                    Contact Information Privacy
                                                </h5>
                                            </div>

                                            {[
                                                {
                                                    key: 'showEmail',
                                                    icon: 'envelope-slash',
                                                    title: 'Show Email Address',
                                                    description: 'Allow others to see your email address in your profile',
                                                    color: 'warning'
                                                },
                                                {
                                                    key: 'showPhone',
                                                    icon: 'telephone-x',
                                                    title: 'Show Phone Number',
                                                    description: 'Allow others to see your phone number in your profile',
                                                    color: 'warning'
                                                },
                                                {
                                                    key: 'allowMessaging',
                                                    icon: 'chat-square-dots',
                                                    title: 'Allow Direct Messages',
                                                    description: 'Allow other users to send you direct messages',
                                                    color: 'info'
                                                }
                                            ].map(setting => (
                                                <div key={setting.key} className="col-md-6">
                                                    <div className="card border-0 bg-light mb-3 h-100">
                                                        <div className="card-body p-4">
                                                            <div className="form-check form-switch d-flex align-items-start">
                                                                <input
                                                                    className="form-check-input mt-1 me-3"
                                                                    type="checkbox"
                                                                    checked={privacySettings[setting.key as keyof typeof privacySettings] as boolean}
                                                                    onChange={() => handlePrivacyChange(setting.key as keyof typeof privacySettings, !privacySettings[setting.key as keyof typeof privacySettings])}
                                                                    id={setting.key}
                                                                    style={{width: '3em', height: '1.5em'}}
                                                                />
                                                                <div className="flex-grow-1">
                                                                    <label className="form-check-label fw-medium d-flex align-items-center mb-1" htmlFor={setting.key}>
                                                                        <i className={`far fa-${setting.icon} me-2 text-${setting.color}`}></i>
                                                                        {setting.title}
                                                                    </label>
                                                                    <div className="form-text mb-0">{setting.description}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Data Processing */}
                                            <div className="col-12">
                                                <h5 className="fw-bold text-danger border-bottom pb-2 mb-3 mt-4">
                                                    <i className="far fa-database-lock me-2"></i>
                                                    Data Processing & Marketing
                                                </h5>
                                            </div>

                                            {[
                                                {
                                                    key: 'dataProcessing',
                                                    icon: 'database-check',
                                                    title: 'Allow Data Processing',
                                                    description: 'Allow the system to process your data for scholarship matching and analytics',
                                                    color: 'success',
                                                    required: true
                                                },
                                                {
                                                    key: 'marketingEmails',
                                                    icon: 'envelope-paper',
                                                    title: 'Marketing Communications',
                                                    description: 'Receive promotional emails about events, programs, and opportunities',
                                                    color: 'primary'
                                                }
                                            ].map(setting => (
                                                <div key={setting.key} className="col-12">
                                                    <div className="card border-0 bg-light mb-3">
                                                        <div className="card-body p-4">
                                                            <div className="form-check form-switch d-flex align-items-start">
                                                                <input
                                                                    className="form-check-input mt-1 me-3"
                                                                    type="checkbox"
                                                                    checked={privacySettings[setting.key as keyof typeof privacySettings] as boolean}
                                                                    onChange={() => !setting.required && handlePrivacyChange(setting.key as keyof typeof privacySettings, !privacySettings[setting.key as keyof typeof privacySettings])}
                                                                    id={setting.key}
                                                                    disabled={setting.required}
                                                                    style={{width: '3em', height: '1.5em'}}
                                                                />
                                                                <div className="flex-grow-1">
                                                                    <label className="form-check-label fw-medium d-flex align-items-center mb-1" htmlFor={setting.key}>
                                                                        <i className={`far fa-${setting.icon} me-2 text-${setting.color}`}></i>
                                                                        {setting.title}
                                                                        {setting.required && <span className="badge bg-danger ms-2">Required</span>}
                                                                    </label>
                                                                    <div className="form-text mb-0">
                                                                        {setting.description}
                                                                        {setting.required && (
                                                                            <><br /><strong>Note:</strong> This setting is required for the scholarship system to function properly.</>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Privacy Notice */}
                                            <div className="col-12">
                                                <div className="alert alert-info d-flex align-items-start" role="alert">
                                                    <i className="far fa-info-circle-fill me-2 mt-1"></i>
                                                    <div>
                                                        <strong>Privacy Notice:</strong> Your data is processed in accordance with our Privacy Policy.
                                                        You can review how we collect, use, and protect your information by visiting our
                                                        <a href="#" className="alert-link"> Privacy Policy page</a>.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="my-5" />

                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted">
                                                    <i className="far fa-shield-check me-1"></i>
                                                    Your privacy settings are encrypted and secure
                                                </small>
                                            </div>
                                            <button
                                                type="submit"
                                                className="btn btn-info btn-lg"
                                                disabled={isLoading || !hasChanges}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                        Saving Privacy Settings...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="far fa-shield-check me-2"></i>
                                                        Save Privacy Settings
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;