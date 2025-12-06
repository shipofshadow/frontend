import React, { useState, useEffect, useRef, useMemo } from 'react';
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
    isValid: boolean;
}

const Settings: React.FC = () => {
    const { user, token, refreshUser } = useAuth();
    const profile = user?.profile;
    const isStudent = user?.role === 'student';

    // Form States
    const [profileData, setProfileData] = useState<ProfileFormData>({
        first_name: '',
        last_name: '',
        email: '',
        contact_number: ''
    });

    const [passwordData, setPasswordData] = useState<PasswordFormData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // UI States
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');

    // Password UI
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, isValid: false });

    // Avatar Upload State
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize Data
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

    // Computed Avatar URL
    const currentAvatarUrl = useMemo(() => {
        const avatar = profile?.avatar;
        if (!avatar) return null;
        if (avatar.startsWith('http')) return avatar;
        return `${API_BASE_URL}/api/profile/avatar/${encodeURIComponent(avatar.replace(/^.*[\\/]/, ''))}`;
    }, [profile?.avatar]);

    // --- Handlers ---

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!['image/png', 'image/jpeg', 'image/gif'].includes(file.type)) {
            Swal.fire({ icon: 'error', title: 'Invalid File', text: 'Please upload a PNG, JPG, or GIF.' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            Swal.fire({ icon: 'error', title: 'File Too Large', text: 'Max file size is 5MB.' });
            return;
        }

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;
        setIsUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        try {
            const res = await fetch(`${API_BASE_URL}/api/profile/upload-avatar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                Swal.fire({ icon: 'success', title: 'Updated!', text: 'Profile photo updated.', timer: 1500, showConfirmButton: false });
                await refreshUser();
                handleCancelUpload();
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to upload photo.' });
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleCancelUpload = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const checkStrength = (pass: string) => {
        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[a-z]/.test(pass)) score++;
        if (/\d/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        setPasswordStrength({ score, isValid: score >= 3 }); // Requirement: 3/5 criteria
    };

    const handlePasswordChange = (field: keyof PasswordFormData, value: string) => {
        setPasswordData(prev => ({ ...prev, [field]: value }));
        if (field === 'newPassword') checkStrength(value);
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProfileLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/profile/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await res.json();
            if (res.ok) {
                Swal.fire({ icon: 'success', title: 'Saved', text: 'Profile information updated.', timer: 1500, showConfirmButton: false });
                await refreshUser();
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Update failed' });
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordStrength.isValid) {
            Swal.fire({ icon: 'warning', title: 'Weak Password', text: 'Please create a stronger password.' });
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Swal.fire({ icon: 'error', title: 'Mismatch', text: 'Passwords do not match.' });
            return;
        }

        setIsPasswordLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/profile/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    old_password: sha256(passwordData.currentPassword),
                    new_password: sha256(passwordData.newPassword),
                    confirm_password: sha256(passwordData.confirmPassword)
                })
            });

            const data = await res.json();
            if (res.ok) {
                Swal.fire({ icon: 'success', title: 'Updated', text: 'Password changed successfully.', timer: 1500, showConfirmButton: false });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setPasswordStrength({ score: 0, isValid: false });
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to change password.' });
        } finally {
            setIsPasswordLoading(false);
        }
    };

    return (
        <div className="min-vh-100 bg-light">
            {/* Header */}
            <div className="bg-white border-bottom shadow-sm">
                <div className="container-fluid px-4 py-4">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                            <i className="fal fa-cog fa-2x"></i>
                        </div>
                        <div>
                            <h1 className="h3 fw-bold mb-0 text-gray-800">Account Settings</h1>
                            <p className="text-muted mb-0 small">Manage your profile details and security preferences</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid px-4 py-4">
                <div className="row g-4">

                    {/* LEFT COLUMN: Profile Card */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body text-center p-5">
                                <div className="position-relative d-inline-block mb-4">
                                    <div className="rounded-circle p-1 border border-2 border-light shadow-sm">
                                        <img
                                            src={avatarPreview || currentAvatarUrl || '/default.png'}
                                            alt="Profile"
                                            className="rounded-circle"
                                            style={{ width: '140px', height: '140px', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <button
                                        className="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle shadow-sm"
                                        style={{ width: '35px', height: '35px' }}
                                        onClick={() => fileInputRef.current?.click()}
                                        title="Change Photo"
                                    >
                                        <i className="fal fa-camera"></i>
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="d-none"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                />

                                {avatarFile && (
                                    <div className="d-flex justify-content-center gap-2 mb-3 fade-in">
                                        <button className="btn btn-sm btn-success rounded-pill px-3" onClick={handleAvatarUpload} disabled={isUploadingAvatar}>
                                            {isUploadingAvatar ? 'Uploading...' : 'Save Photo'}
                                        </button>
                                        <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={handleCancelUpload}>Cancel</button>
                                    </div>
                                )}

                                <h4 className="fw-bold text-dark mb-1">{profile?.first_name} {profile?.last_name}</h4>
                                <p className="text-muted mb-3">{profile?.email}</p>
                                <span className={`badge rounded-pill px-3 py-2 fw-normal bg-primary bg-opacity-10 text-primary`}>
                                    {user?.role?.toUpperCase().replace('_', ' ')}
                                </span>
                            </div>
                            <div className="card-footer bg-light border-0 p-3">
                                <div className="d-grid">
                                    <button
                                        className={`btn btn-outline-primary border-0 text-start d-flex align-items-center gap-3 p-3 ${activeTab === 'general' ? 'bg-white shadow-sm fw-semibold' : ''}`}
                                        onClick={() => setActiveTab('general')}
                                    >
                                        <i className="fal fa-user-circle fa-lg"></i> General Information
                                    </button>
                                    <button
                                        className={`btn btn-outline-danger border-0 text-start d-flex align-items-center gap-3 p-3 ${activeTab === 'security' ? 'bg-white shadow-sm fw-semibold' : ''}`}
                                        onClick={() => setActiveTab('security')}
                                    >
                                        <i className="fal fa-shield-check fa-lg"></i> Security & Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Forms */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-header bg-white border-bottom-0 pt-4 px-4">
                                <h5 className="fw-bold mb-0">
                                    {activeTab === 'general' ? 'General Information' : 'Security Settings'}
                                </h5>
                            </div>

                            <div className="card-body p-4">

                                {/* GENERAL TAB */}
                                {activeTab === 'general' && (
                                    <form onSubmit={handleProfileSubmit} className="fade-in">
                                        <div className="row g-4">
                                            <div className="col-md-6">
                                                <label className="form-label small text-muted fw-bold">First Name</label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0 text-muted"><i className="fal fa-user"></i></span>
                                                    <input
                                                        type="text"
                                                        className="form-control border-start-0 ps-0 bg-light"
                                                        value={profileData.first_name}
                                                        onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small text-muted fw-bold">Last Name</label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0 text-muted"><i className="fal fa-user"></i></span>
                                                    <input
                                                        type="text"
                                                        className="form-control border-start-0 ps-0 bg-light"
                                                        value={profileData.last_name}
                                                        onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label small text-muted fw-bold">Email Address</label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0 text-muted"><i className="fal fa-envelope"></i></span>
                                                    <input
                                                        type="email"
                                                        className="form-control border-start-0 ps-0 bg-light"
                                                        value={profileData.email}
                                                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Contact Number only for Students */}
                                            {isStudent && (
                                                <div className="col-12">
                                                    <label className="form-label small text-muted fw-bold">Contact Number</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0 text-muted"><i className="fal fa-phone"></i></span>
                                                        <input
                                                            type="tel"
                                                            className="form-control border-start-0 ps-0 bg-light"
                                                            value={profileData.contact_number}
                                                            onChange={(e) => setProfileData({...profileData, contact_number: e.target.value})}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-3 border-top text-end">
                                            <button type="submit" className="btn btn-primary px-4 rounded-pill" disabled={isProfileLoading}>
                                                {isProfileLoading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* SECURITY TAB */}
                                {activeTab === 'security' && (
                                    <form onSubmit={handlePasswordSubmit} className="fade-in">
                                        <div className="row g-4">
                                            <div className="col-12">
                                                <div className="alert alert-light border d-flex gap-3 align-items-center">
                                                    <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-2">
                                                        <i className="fal fa-lock-alt fa-lg"></i>
                                                    </div>
                                                    <div>
                                                        <h6 className="fw-bold mb-1">Password Requirements</h6>
                                                        <p className="mb-0 small text-muted">Minimum 8 chars, mixed case, number & special char.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-12">
                                                <label className="form-label small text-muted fw-bold">Current Password</label>
                                                <div className="input-group">
                                                    <input
                                                        type={showPassword.current ? "text" : "password"}
                                                        className="form-control bg-light border-end-0"
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                                    />
                                                    <button type="button" className="btn btn-light border border-start-0 text-muted" onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}>
                                                        <i className={`fal ${showPassword.current ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label small text-muted fw-bold">New Password</label>
                                                <div className="input-group">
                                                    <input
                                                        type={showPassword.new ? "text" : "password"}
                                                        className={`form-control bg-light border-end-0 ${passwordData.newPassword && (passwordStrength.isValid ? 'is-valid' : 'is-invalid')}`}
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                                    />
                                                    <button type="button" className="btn btn-light border border-start-0 text-muted" onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}>
                                                        <i className={`fal ${showPassword.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                    </button>
                                                </div>
                                                {passwordData.newPassword && (
                                                    <div className="progress mt-2" style={{height: '4px'}}>
                                                        <div
                                                            className={`progress-bar bg-${passwordStrength.score <= 2 ? 'danger' : passwordStrength.score === 3 ? 'warning' : 'success'}`}
                                                            style={{width: `${(passwordStrength.score / 5) * 100}%`}}
                                                        ></div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label small text-muted fw-bold">Confirm Password</label>
                                                <div className="input-group">
                                                    <input
                                                        type={showPassword.confirm ? "text" : "password"}
                                                        className={`form-control bg-light border-end-0 ${passwordData.confirmPassword && (passwordData.newPassword === passwordData.confirmPassword ? 'is-valid' : 'is-invalid')}`}
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                                    />
                                                    <button type="button" className="btn btn-light border border-start-0 text-muted" onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}>
                                                        <i className={`fal ${showPassword.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-top text-end">
                                            <button type="submit" className="btn btn-danger px-4 rounded-pill" disabled={isPasswordLoading}>
                                                {isPasswordLoading ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .fade-in { animation: fadeIn 0.3s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Settings;