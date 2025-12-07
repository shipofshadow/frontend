import React, { useState, useRef, useMemo, useEffect } from 'react';
import Swal from 'sweetalert2';
import { sha256 } from 'js-sha256';
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from '../../config';

// --- Interfaces ---
interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface ProfileFormData {
    email: string;
    phone: string;
}

interface PasswordStrength {
    score: number;
    isValid: boolean;
}

const Settings: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [activeTab, setActiveTab] = useState<'contact' | 'security'>('contact');
    const [showAvatarModal, setShowAvatarModal] = useState(false);

    // Auth & Profile Data
    const { user, token, refreshUser } = useAuth();
    const profile = user?.profile;

    // --- State: Avatar ---
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- State: Profile Form ---
    const [profileData, setProfileData] = useState<ProfileFormData>({
        email: '',
        phone: ''
    });

    // --- State: Password ---
    const [passwordData, setPasswordData] = useState<PasswordFormData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, isValid: false });

    // Initialize Profile Data
    useEffect(() => {
        if (profile) {
            setProfileData({
                email: profile.email || '',
                phone: profile.contact_number || ''
            });
        }
    }, [profile]);

    // Computed Avatar URL
    const currentAvatarUrl = useMemo(() => {
        const avatar = profile?.avatar;
        if (!avatar) return null;
        if (avatar.startsWith('http')) return avatar;
        return `${API_BASE_URL}/api/profile/avatar/${encodeURIComponent(avatar.replace(/^.*[\\/]/, ''))}`;
    }, [profile?.avatar]);

    // --- Handlers: Avatar ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid File',
                text: 'Please select a PNG, JPG, GIF, or WebP image',
                confirmButtonColor: '#4f46e5'
            });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            Swal.fire({
                icon: 'error',
                title: 'File Too Large',
                text: 'Max file size is 5MB',
                confirmButtonColor: '#4f46e5'
            });
            return;
        }

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        setShowAvatarModal(true);
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;
        setIsUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        try {
            const response = await fetch(`${API_BASE_URL}/api/profile/upload-avatar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();

            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Profile photo updated',
                    timer: 1500,
                    showConfirmButton: false
                });
                await refreshUser();
                setAvatarFile(null);
                setAvatarPreview(null);
                setShowAvatarModal(false);
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Upload Failed',
                text: error.message || 'Error uploading'
            });
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleCancelUpload = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        setShowAvatarModal(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // --- Handlers: Profile Update ---
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);

        try {
            const payload = {
                email: profileData.email,
                phone: profileData.phone,
                emergencyContact: profile?.emergency_contact_name || '',
                emergencyPhone: profile?.emergency_contact_number || '',
                civil_status: profile?.civil_status || '',
                citizenship: profile?.citizenship || ''
            };

            const response = await fetch(`${API_BASE_URL}/api/profile/details`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to update profile');

            await Swal.fire({
                icon: 'success',
                title: 'Profile Updated',
                text: 'Your contact information has been saved.',
                timer: 1500,
                showConfirmButton: false
            });
            await refreshUser();

        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error updating profile'
            });
        } finally {
            setIsSavingProfile(false);
        }
    };

    // --- Handlers: Password Change ---
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Swal.fire({ icon: 'warning', title: 'Mismatch', text: 'New passwords do not match' });
            return;
        }
        setIsLoading(true);
        try {
            const body = {
                old_password: sha256(passwordData.currentPassword),
                new_password: sha256(passwordData.newPassword),
                confirm_password: sha256(passwordData.confirmPassword)
            };

            const response = await fetch(`${API_BASE_URL}/api/profile/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            Swal.fire({
                icon: 'success',
                title: 'Password Updated',
                text: 'Your account is now more secure.',
                confirmButtonColor: '#4f46e5'
            });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPasswordStrength({ score: 0, isValid: false });
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error changing password'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Helper: Password Strength
    const checkStrength = (pass: string) => {
        let s = 0;
        if (pass.length >= 8) s++;
        if (/[A-Z]/.test(pass)) s++;
        if (/[a-z]/.test(pass)) s++;
        if (/\d/.test(pass)) s++;
        if (/[^A-Za-z0-9]/.test(pass)) s++;
        setPasswordStrength({ score: s, isValid: s >= 3 });
    };

    const getStrengthLabel = (score: number) => {
        if (score < 2) return { text: 'Weak', color: 'danger', bgColor: '#fee2e2' };
        if (score < 4) return { text: 'Medium', color: 'warning', bgColor: '#fef3c7' };
        return { text: 'Strong', color: 'success', bgColor: '#d1fae5' };
    };

    const strengthInfo = getStrengthLabel(passwordStrength.score);

    return (
        <div className="min-vh-100 py-4 py-lg-5" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="container">
                {/* Page Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex align-items-center gap-3 mb-2">
                            <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                                <i className="fas fa-cog text-primary fs-4"></i>
                            </div>
                            <div>
                                <h3 className="fw-bold mb-0">Account Settings</h3>
                                <p className="text-muted mb-0 small">Manage your profile and security preferences</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {/* --- SIDEBAR --- */}
                    <div className="col-lg-4 col-xl-3">
                        <div className="card border-0 shadow-sm rounded-4 " style={{ top: '20px' }}>
                            <div className="card-body p-4">
                                {/* Profile Section */}
                                <div className="text-center mb-4 pb-4 border-bottom">
                                    <div className="position-relative d-inline-block mb-3">
                                        <div
                                            className="rounded-circle overflow-hidden border border-3 shadow-sm position-relative"
                                            style={{ width: '100px', height: '100px', borderColor: '#e5e7eb' }}
                                        >
                                            <img
                                                src={avatarPreview || currentAvatarUrl || '/default.png'}
                                                alt="Profile"
                                                className="w-100 h-100"
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                        <button
                                            className="btn btn-primary btn-sm rounded-circle shadow position-absolute"
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                padding: 0,
                                                bottom: '0',
                                                right: '0'
                                            }}
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploadingAvatar}
                                        >
                                            <i className="fas fa-camera" style={{ fontSize: '0.75rem' }}></i>
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="d-none"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            disabled={isUploadingAvatar}
                                        />
                                    </div>
                                    <h6 className="fw-bold mb-1">{user?.first_name} {user?.last_name}</h6>
                                    <p className="text-muted small mb-0">{user?.email}</p>
                                </div>

                                {/* Navigation */}
                                <nav className="nav flex-column gap-2">
                                    <button
                                        onClick={() => setActiveTab('contact')}
                                        className={`btn text-start rounded-3 d-flex align-items-center gap-3 ${
                                            activeTab === 'contact'
                                                ? 'btn-primary shadow-sm'
                                                : 'btn-light border-0'
                                        }`}
                                        style={{ padding: '0.75rem 1rem' }}
                                    >
                                        <i className="fas fa-address-card" style={{ width: '18px' }}></i>
                                        <span className="fw-semibold">Contact Info</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('security')}
                                        className={`btn text-start rounded-3 d-flex align-items-center gap-3 ${
                                            activeTab === 'security'
                                                ? 'btn-primary shadow-sm'
                                                : 'btn-light border-0'
                                        }`}
                                        style={{ padding: '0.75rem 1rem' }}
                                    >
                                        <i className="fas fa-shield-alt" style={{ width: '18px' }}></i>
                                        <span className="fw-semibold">Security</span>
                                    </button>
                                </nav>

                                {/* Info Box */}
                                <div className="mt-4 p-3 rounded-3" style={{ backgroundColor: '#f3f4f6' }}>
                                    <div className="d-flex gap-2">
                                        <i className="fas fa-info-circle text-primary mt-1" style={{ fontSize: '0.875rem' }}></i>
                                        <small className="text-muted">
                                            Keep your information up to date to ensure account security and proper communication.
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- MAIN CONTENT --- */}
                    <div className="col-lg-8 col-xl-9">
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-body p-4 p-md-5">
                                {/* --- TAB: CONTACT INFO --- */}
                                {activeTab === 'contact' && (
                                    <div className="animate__animated animate__fadeIn">
                                        <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                                            <div className="bg-primary bg-opacity-10 rounded-3 p-2">
                                                <i className="fas fa-address-card text-primary"></i>
                                            </div>
                                            <div>
                                                <h5 className="fw-bold mb-0">Contact Information</h5>
                                                <p className="text-muted small mb-0">Update your email and phone number</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handleProfileUpdate}>
                                            <div className="row g-4">
                                                <div className="col-12">
                                                    <label className="form-label fw-semibold mb-2">
                                                        <i className="fas fa-envelope text-muted me-2"></i>
                                                        Email Address
                                                    </label>
                                                    <input
                                                        type="email"
                                                        className="form-control form-control-lg rounded-3"
                                                        style={{ backgroundColor: '#f9fafb' }}
                                                        value={profileData.email}
                                                        onChange={e => setProfileData(p => ({...p, email: e.target.value}))}
                                                        required
                                                        placeholder="your.email@example.com"
                                                    />
                                                </div>

                                                <div className="col-12">
                                                    <label className="form-label fw-semibold mb-2">
                                                        <i className="fas fa-phone text-muted me-2"></i>
                                                        Phone Number
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        className="form-control form-control-lg rounded-3"
                                                        style={{ backgroundColor: '#f9fafb' }}
                                                        value={profileData.phone}
                                                        onChange={e => setProfileData(p => ({...p, phone: e.target.value}))}
                                                        required
                                                        placeholder="+63 XXX XXX XXXX"
                                                    />
                                                </div>

                                                <div className="col-12 pt-3">
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary btn-lg px-5 rounded-3"
                                                        disabled={isSavingProfile}
                                                    >
                                                        {isSavingProfile ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                                Saving Changes...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-check-circle me-2"></i>
                                                                Save Changes
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* --- TAB: SECURITY --- */}
                                {activeTab === 'security' && (
                                    <div className="animate__animated animate__fadeIn">
                                        <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                                            <div className="bg-danger bg-opacity-10 rounded-3 p-2">
                                                <i className="fas fa-shield-alt text-danger"></i>
                                            </div>
                                            <div>
                                                <h5 className="fw-bold mb-0">Security Settings</h5>
                                                <p className="text-muted small mb-0">Update your password to keep your account secure</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handlePasswordChange}>
                                            <div className="row g-4">
                                                {/* Current Password */}
                                                <div className="col-12">
                                                    <label className="form-label fw-semibold mb-2">
                                                        <i className="fas fa-key text-muted me-2"></i>
                                                        Current Password
                                                    </label>
                                                    <div className="input-group input-group-lg">
                                                        <input
                                                            type={showPassword.current ? "text" : "password"}
                                                            className="form-control rounded-start-3 border-end-0"
                                                            style={{ backgroundColor: '#f9fafb' }}
                                                            value={passwordData.currentPassword}
                                                            onChange={e => setPasswordData(p => ({...p, currentPassword: e.target.value}))}
                                                            required
                                                        />
                                                        <button
                                                            className="btn border rounded-end-3 border-start-0"
                                                            type="button"
                                                            style={{ backgroundColor: '#f9fafb' }}
                                                            onClick={() => setShowPassword(p => ({...p, current: !p.current}))}
                                                        >
                                                            <i className={`fas fa-eye${showPassword.current ? '-slash' : ''} text-muted`}></i>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* New Password */}
                                                <div className="col-12">
                                                    <label className="form-label fw-semibold mb-2">
                                                        <i className="fas fa-lock text-muted me-2"></i>
                                                        New Password
                                                    </label>
                                                    <div className="input-group input-group-lg">
                                                        <input
                                                            type={showPassword.new ? "text" : "password"}
                                                            className="form-control rounded-start-3 border-end-0"
                                                            style={{ backgroundColor: '#f9fafb' }}
                                                            value={passwordData.newPassword}
                                                            onChange={e => {
                                                                setPasswordData(p => ({...p, newPassword: e.target.value}));
                                                                checkStrength(e.target.value);
                                                            }}
                                                            required
                                                        />
                                                        <button
                                                            className="btn border rounded-end-3 border-start-0"
                                                            type="button"
                                                            style={{ backgroundColor: '#f9fafb' }}
                                                            onClick={() => setShowPassword(p => ({...p, new: !p.new}))}
                                                        >
                                                            <i className={`fas fa-eye${showPassword.new ? '-slash' : ''} text-muted`}></i>
                                                        </button>
                                                    </div>

                                                    {/* Password Strength Indicator */}
                                                    {passwordData.newPassword && (
                                                        <div className="mt-3">
                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                <small className="text-muted fw-semibold">Password Strength</small>
                                                                <span
                                                                    className={`badge bg-${strengthInfo.color} rounded-pill`}
                                                                    style={{ fontSize: '0.7rem' }}
                                                                >
                                                                    {strengthInfo.text}
                                                                </span>
                                                            </div>
                                                            <div className="progress" style={{ height: '6px' }}>
                                                                <div
                                                                    className={`progress-bar bg-${strengthInfo.color}`}
                                                                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                                                ></div>
                                                            </div>

                                                            {/* Requirements List */}
                                                            <div className="mt-3 p-3 rounded-3" style={{ backgroundColor: strengthInfo.bgColor }}>
                                                                <small className="fw-semibold d-block mb-2">Requirements:</small>
                                                                <ul className="list-unstyled mb-0 small">
                                                                    <li className={passwordData.newPassword.length >= 8 ? 'text-success' : 'text-muted'}>
                                                                        <i className={`fas fa-${passwordData.newPassword.length >= 8 ? 'check-circle' : 'circle'} me-2`}></i>
                                                                        At least 8 characters
                                                                    </li>
                                                                    <li className={/[A-Z]/.test(passwordData.newPassword) && /[a-z]/.test(passwordData.newPassword) ? 'text-success' : 'text-muted'}>
                                                                        <i className={`fas fa-${/[A-Z]/.test(passwordData.newPassword) && /[a-z]/.test(passwordData.newPassword) ? 'check-circle' : 'circle'} me-2`}></i>
                                                                        Upper & lowercase letters
                                                                    </li>
                                                                    <li className={/\d/.test(passwordData.newPassword) ? 'text-success' : 'text-muted'}>
                                                                        <i className={`fas fa-${/\d/.test(passwordData.newPassword) ? 'check-circle' : 'circle'} me-2`}></i>
                                                                        At least one number
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Confirm Password */}
                                                <div className="col-12">
                                                    <label className="form-label fw-semibold mb-2">
                                                        <i className="fas fa-check-double text-muted me-2"></i>
                                                        Confirm New Password
                                                    </label>
                                                    <div className="input-group input-group-lg">
                                                        <input
                                                            type={showPassword.confirm ? "text" : "password"}
                                                            className="form-control rounded-start-3 border-end-0"
                                                            style={{ backgroundColor: '#f9fafb' }}
                                                            value={passwordData.confirmPassword}
                                                            onChange={e => setPasswordData(p => ({...p, confirmPassword: e.target.value}))}
                                                            required
                                                        />
                                                        <button
                                                            className="btn border rounded-end-3 border-start-0"
                                                            type="button"
                                                            style={{ backgroundColor: '#f9fafb' }}
                                                            onClick={() => setShowPassword(p => ({...p, confirm: !p.confirm}))}
                                                        >
                                                            <i className={`fas fa-eye${showPassword.confirm ? '-slash' : ''} text-muted`}></i>
                                                        </button>
                                                    </div>
                                                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                                                        <small className="text-danger d-block mt-2">
                                                            <i className="fas fa-exclamation-triangle me-1"></i>
                                                            Passwords do not match
                                                        </small>
                                                    )}
                                                </div>

                                                <div className="col-12 pt-3">
                                                    <button
                                                        type="submit"
                                                        className="btn btn-danger btn-lg px-5 rounded-3"
                                                        disabled={isLoading || !passwordStrength.isValid || passwordData.newPassword !== passwordData.confirmPassword}
                                                    >
                                                        {isLoading ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                                Updating Password...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-shield-alt me-2"></i>
                                                                Update Password
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Avatar Upload Modal */}
            {showAvatarModal && (
                <>
                    <div
                        className="modal fade show d-block"
                        tabIndex={-1}
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                        onClick={handleCancelUpload}
                    >
                        <div
                            className="modal-dialog modal-dialog-centered"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-content border-0 shadow-lg rounded-4">
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title fw-bold">
                                        <i className="fas fa-image text-primary me-2"></i>
                                        Update Profile Photo
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={handleCancelUpload}
                                        disabled={isUploadingAvatar}
                                    ></button>
                                </div>
                                <div className="modal-body text-center py-4">
                                    <div className="position-relative d-inline-block mb-3">
                                        <div
                                            className="rounded-circle overflow-hidden border border-4 shadow-sm"
                                            style={{ width: '180px', height: '180px', borderColor: '#e5e7eb' }}
                                        >
                                            <img
                                                src={avatarPreview || currentAvatarUrl || '/default.png'}
                                                alt="Preview"
                                                className="w-100 h-100"
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                        {isUploadingAvatar && (
                                            <div
                                                className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 rounded-circle d-flex align-items-center justify-content-center"
                                            >
                                                <div className="spinner-border text-white" role="status">
                                                    <span className="visually-hidden">Uploading...</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-muted mb-0">Preview your new profile photo</p>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button
                                        type="button"
                                        className="btn btn-light rounded-3 px-4"
                                        onClick={handleCancelUpload}
                                        disabled={isUploadingAvatar}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary rounded-3 px-4"
                                        onClick={handleAvatarUpload}
                                        disabled={isUploadingAvatar}
                                    >
                                        {isUploadingAvatar ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-cloud-upload-alt me-2"></i>
                                                Update Photo
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </>
            )}
        </div>
    );
};

export default Settings;