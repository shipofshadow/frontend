import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { useAuth } from "../context/AuthContext.tsx";
import type User from "../types/user.ts";
import { User as UserIcon, Mail, Phone, Calendar, MapPin, Check, AlertCircle, Sparkles } from 'lucide-react';

interface PrefillData {
    email?: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
}

const getUserFromStorage = (): User => {
    const userString = localStorage.getItem("user");
    if (!userString) throw new Error("User not found in storage");

    const userData = JSON.parse(userString) as User;
    if (!userData || !userData.id) throw new Error("Invalid user data");

    return userData;
};

const CompleteProfile: React.FC = () => {
    const navigate = useNavigate();
    const token: string = localStorage.getItem("access_token") ?? "";
    const refresh_token: string = localStorage.getItem("refresh_token") ?? "";
    const user = getUserFromStorage();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        student_id: "",
        first_name: "",
        last_name: "",
        middle_name: "",
        name_extension: "",
        gender: "Other",
        birth_date: "",
        citizenship: "Filipino",
        civil_status: "Single",
        contact_number: "",
        email: "",
        avatar: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [prefilledFields, setPrefilledFields] = useState<string[]>([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    if (!token || !refresh_token || !user) {
        window.location.href = "/login";
    }

    useEffect(() => {
        const prefillData = localStorage.getItem('prefill_profile');
        if (prefillData) {
            try {
                const parsed: PrefillData = JSON.parse(prefillData);
                const fieldsToMark: string[] = [];

                setFormData(prev => {
                    const updated = { ...prev };
                    if (parsed.email) { updated.email = parsed.email; fieldsToMark.push('email'); }
                    if (parsed.first_name) { updated.first_name = parsed.first_name; fieldsToMark.push('first_name'); }
                    if (parsed.last_name) { updated.last_name = parsed.last_name; fieldsToMark.push('last_name'); }
                    if (parsed.avatar) { updated.avatar = parsed.avatar; fieldsToMark.push('avatar'); }
                    return updated;
                });

                setPrefilledFields(fieldsToMark);
            } catch (err) {
                console.error("Error parsing prefill data:", err);
                localStorage.removeItem('prefill_profile');
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirmModal(true);
    };

    const handleConfirmedSubmit = async () => {
        setShowConfirmModal(false);
        setLoading(true);
        setError(null);

        try {
            const res = await axios.post(
                `${API_BASE_URL}/api/profile/complete`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (res.status === 201) {
                setSuccess(true);
                login(user, token, refresh_token);
                localStorage.removeItem('prefill_profile');

                setTimeout(() => {
                    navigate("/applicant/dashboard");
                }, 1500);
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-vh-100 d-flex align-items-center py-5" style={{ backgroundColor: '#f8f9fe' }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-xl-8 col-lg-10">
                            {/* Header Card */}
                            <div className="text-center m-4">
                                <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                     style={{ width: '80px', height: '80px', backgroundColor: '#e8eaf6' }}>
                                    <UserIcon style={{ color: '#5e72e4' }} size={40} />
                                </div>
                                <h2 className="fw-bold mb-2">Complete Your Profile</h2>
                                <p className="text-muted" style={{ fontSize: '1.05rem' }}>
                                    Just a few more details to get you started
                                </p>
                            </div>

                            {/* Main Form Card */}
                            <div className="card border-0 rounded-4 shadow-sm">
                                <div className="card-body p-4 p-md-5">
                                    {/* Progress Indicator */}
                                    <div className="mb-5">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="badge rounded-pill px-4 py-2" style={{ backgroundColor: '#e8eaf6', color: '#5e72e4', fontSize: '0.875rem', fontWeight: 600 }}>
                                                <Sparkles size={14} className="me-2" style={{ marginTop: '-2px' }} />
                                                Profile Setup
                                            </span>
                                            <small className="text-muted fw-semibold">Final Step • 100%</small>
                                        </div>
                                        <div className="progress rounded-pill" style={{ height: '8px', backgroundColor: '#e8eaf6' }}>
                                            <div className="progress-bar rounded-pill"
                                                 style={{ width: '100%', backgroundColor: '#5e72e4' }}></div>
                                        </div>
                                    </div>

                                    {/* Alerts */}
                                    {error && (
                                        <div className="alert border-0 rounded-4 d-flex align-items-start mb-4"
                                             style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                                            <AlertCircle size={20} className="me-2 flex-shrink-0" style={{ marginTop: '2px' }} />
                                            <div>{error}</div>
                                        </div>
                                    )}

                                    {success && (
                                        <div className="alert border-0 rounded-4 d-flex align-items-start mb-4"
                                             style={{ backgroundColor: '#d4edda', color: '#155724' }}>
                                            <Check size={20} className="me-2 flex-shrink-0" style={{ marginTop: '2px' }} />
                                            <div>Profile completed successfully! Redirecting to dashboard...</div>
                                        </div>
                                    )}

                                    <form onSubmit={handleFormSubmit}>
                                        {/* Personal Information Section */}
                                        <div className="mb-5">
                                            <div className="d-flex align-items-center mb-4">
                                                <div className="rounded-3 d-inline-flex align-items-center justify-content-center me-3"
                                                     style={{ width: '44px', height: '44px', backgroundColor: '#e8eaf6' }}>
                                                    <UserIcon style={{ color: '#5e72e4' }} size={22} />
                                                </div>
                                                <div>
                                                    <h5 className="fw-bold mb-0">Personal Information</h5>
                                                    <small className="text-muted">Basic details about yourself</small>
                                                </div>
                                            </div>

                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold mb-2" style={{ fontSize: '0.9rem' }}>
                                                        Student ID <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="student_id"
                                                        className="form-control form-control-lg rounded-3"
                                                        value={formData.student_id}
                                                        onChange={handleChange}
                                                        placeholder="Enter your student ID"
                                                        required
                                                        style={{ border: '2px solid #e9ecef', fontSize: '1rem' }}
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold mb-2 d-flex align-items-center" style={{ fontSize: '0.9rem' }}>
                                                        <Mail size={16} className="me-2" style={{ marginTop: '-2px' }} />
                                                        Email Address <span className="text-danger ms-1">*</span>
                                                        {prefilledFields.includes('email') && (
                                                            <span className="badge rounded-pill ms-2"
                                                                  style={{ backgroundColor: '#d4edda', color: '#155724', fontSize: '0.7rem', fontWeight: 600 }}>
                                                                <Check size={12} className="me-1" />
                                                                Auto-filled
                                                            </span>
                                                        )}
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        className={`form-control form-control-lg rounded-3 ${prefilledFields.includes('email') ? 'bg-light' : ''}`}
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        placeholder="your.email@example.com"
                                                        required
                                                        readOnly={prefilledFields.includes('email')}
                                                        style={{ border: '2px solid #e9ecef', fontSize: '1rem' }}
                                                    />
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="form-label fw-semibold mb-2" style={{ fontSize: '0.9rem' }}>
                                                        First Name <span className="text-danger">*</span>
                                                        {prefilledFields.includes('first_name') && (
                                                            <span className="badge rounded-pill ms-2"
                                                                  style={{ backgroundColor: '#d4edda', color: '#155724', fontSize: '0.7rem', fontWeight: 600 }}>
                                                                <Check size={12} className="me-1" />
                                                                Auto-filled
                                                            </span>
                                                        )}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="first_name"
                                                        className={`form-control form-control-lg rounded-3 ${prefilledFields.includes('first_name') ? 'bg-light' : ''}`}
                                                        value={formData.first_name}
                                                        onChange={handleChange}
                                                        placeholder="First name"
                                                        required
                                                        style={{ border: '2px solid #e9ecef', fontSize: '1rem' }}
                                                    />
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="form-label fw-semibold mb-2" style={{ fontSize: '0.9rem' }}>
                                                        Last Name <span className="text-danger">*</span>
                                                        {prefilledFields.includes('last_name') && (
                                                            <span className="badge rounded-pill ms-2"
                                                                  style={{ backgroundColor: '#d4edda', color: '#155724', fontSize: '0.7rem', fontWeight: 600 }}>
                                                                <Check size={12} className="me-1" />
                                                                Auto-filled
                                                            </span>
                                                        )}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="last_name"
                                                        className={`form-control form-control-lg rounded-3 ${prefilledFields.includes('last_name') ? 'bg-light' : ''}`}
                                                        value={formData.last_name}
                                                        onChange={handleChange}
                                                        placeholder="Last name"
                                                        required
                                                        style={{ border: '2px solid #e9ecef', fontSize: '1rem' }}
                                                    />
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="form-label fw-semibold mb-2" style={{ fontSize: '0.9rem' }}>
                                                        Middle Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="middle_name"
                                                        className="form-control form-control-lg rounded-3"
                                                        value={formData.middle_name}
                                                        onChange={handleChange}
                                                        placeholder="Optional"
                                                        style={{ border: '2px solid #e9ecef', fontSize: '1rem' }}
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label className="form-label fw-semibold mb-2" style={{ fontSize: '0.9rem' }}>
                                                        Extension
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="name_extension"
                                                        className="form-control form-control-lg rounded-3"
                                                        value={formData.name_extension}
                                                        onChange={handleChange}
                                                        placeholder="Jr., Sr., III"
                                                        style={{ border: '2px solid #e9ecef', fontSize: '1rem' }}
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label className="form-label fw-semibold mb-2" style={{ fontSize: '0.9rem' }}>
                                                        Gender <span className="text-danger">*</span>
                                                    </label>
                                                    <select
                                                        name="gender"
                                                        className="form-select form-select-lg rounded-3"
                                                        value={formData.gender}
                                                        onChange={handleChange}
                                                        required
                                                        style={{ border: '2px solid #e9ecef', fontSize: '1rem' }}
                                                    >
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Prefer not to say</option>
                                                    </select>
                                                </div>

                                                <div className="col-md-3">
                                                    <label className="form-label fw-semibold mb-2 d-flex align-items-center" style={{ fontSize: '0.9rem' }}>
                                                        <Calendar size={16} className="me-2" style={{ marginTop: '-2px' }} />
                                                        Birth Date <span className="text-danger ms-1">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        name="birth_date"
                                                        className="form-control form-control-lg rounded-3"
                                                        value={formData.birth_date}
                                                        onChange={handleChange}
                                                        required
                                                        style={{ border: '2px solid #e9ecef', fontSize: '1rem' }}
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label className="form-label fw-semibold mb-2" style={{ fontSize: '0.9rem' }}>
                                                        Civil Status
                                                    </label>
                                                    <select
                                                        name="civil_status"
                                                        className="form-select form-select-lg rounded-3"
                                                        value={formData.civil_status}
                                                        onChange={handleChange}
                                                        style={{ border: '2px solid #e9ecef', fontSize: '1rem' }}
                                                    >
                                                        <option value="Single">Single</option>
                                                        <option value="Married">Married</option>
                                                        <option value="Divorced">Divorced</option>
                                                        <option value="Widowed">Widowed</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact Information Section */}
                                        <div className="mb-4">
                                            <div className="d-flex align-items-center mb-4">
                                                <div className="rounded-3 d-inline-flex align-items-center justify-content-center me-3"
                                                     style={{ width: '44px', height: '44px', backgroundColor: '#d1ecf1' }}>
                                                    <Phone style={{ color: '#11cdef' }} size={22} />
                                                </div>
                                                <div>
                                                    <h5 className="fw-bold mb-0">Contact Information</h5>
                                                    <small className="text-muted">How we can reach you</small>
                                                </div>
                                            </div>

                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold mb-2 d-flex align-items-center" style={{ fontSize: '0.9rem' }}>
                                                        <MapPin size={16} className="me-2" style={{ marginTop: '-2px' }} />
                                                        Citizenship
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="citizenship"
                                                        className="form-control form-control-lg rounded-3"
                                                        value={formData.citizenship}
                                                        onChange={handleChange}
                                                        placeholder="e.g., Filipino"
                                                        style={{ border: '2px solid #e9ecef', fontSize: '1rem' }}
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold mb-2 d-flex align-items-center" style={{ fontSize: '0.9rem' }}>
                                                        <Phone size={16} className="me-2" style={{ marginTop: '-2px' }} />
                                                        Contact Number
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        name="contact_number"
                                                        className="form-control form-control-lg rounded-3"
                                                        value={formData.contact_number}
                                                        onChange={handleChange}
                                                        placeholder="+63 912 345 6789"
                                                        style={{ border: '2px solid #e9ecef', fontSize: '1rem' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info Box */}
                                        <div className="alert border-0 rounded-4 mb-4"
                                             style={{ backgroundColor: '#e8eaf6', color: '#5e72e4' }}>
                                            <div className="d-flex align-items-start">
                                                <Sparkles size={20} className="me-2 flex-shrink-0" style={{ marginTop: '2px' }} />
                                                <div>
                                                    <strong className="d-block mb-1">Almost there!</strong>
                                                    <small style={{ opacity: 0.9 }}>
                                                        Once you complete your profile, you'll have access to all scholarship opportunities and can start applying right away.
                                                    </small>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="d-grid mt-4">
                                            <button
                                                type="submit"
                                                className="btn btn-lg py-3 rounded-pill shadow-sm"
                                                disabled={loading}
                                                style={{ backgroundColor: '#5e72e4', color: 'white', fontWeight: 600, fontSize: '1.05rem', border: 'none' }}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Creating Your Profile...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check size={20} className="me-2" style={{ marginTop: '-2px' }} />
                                                        Complete Profile & Get Started
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Footer Note */}
                            <div className="text-center mt-4">
                                <small className="text-muted">
                                    Your information is secure and will only be used for scholarship applications
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 rounded-4 shadow-lg">
                            <div className="modal-body text-center p-5">
                                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                                     style={{ width: '80px', height: '80px', backgroundColor: '#e8eaf6' }}>
                                    <Check style={{ color: '#5e72e4' }} size={40} />
                                </div>
                                <h4 className="fw-bold mb-3">Confirm Profile Information</h4>
                                <p className="text-muted mb-4" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                                    Please review your information carefully. Once submitted, some details may require administrator approval to change.
                                </p>

                                {/* Summary */}
                                <div className="text-start mb-4 p-4 rounded-3" style={{ backgroundColor: '#f8f9fe' }}>
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <small className="text-muted d-block mb-1">Name</small>
                                            <strong style={{ fontSize: '0.9rem' }}>
                                                {formData.first_name} {formData.middle_name} {formData.last_name} {formData.name_extension}
                                            </strong>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block mb-1">Student ID</small>
                                            <strong style={{ fontSize: '0.9rem' }}>{formData.student_id}</strong>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block mb-1">Email</small>
                                            <strong style={{ fontSize: '0.9rem' }}>{formData.email}</strong>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block mb-1">Contact</small>
                                            <strong style={{ fontSize: '0.9rem' }}>{formData.contact_number || 'Not provided'}</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex gap-3">
                                    <button
                                        type="button"
                                        className="btn btn-lg flex-grow-1 rounded-pill"
                                        onClick={() => setShowConfirmModal(false)}
                                        style={{ backgroundColor: '#f8f9fe', color: '#6c757d', fontWeight: 600, border: 'none' }}
                                    >
                                        Review Again
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-lg flex-grow-1 rounded-pill"
                                        onClick={handleConfirmedSubmit}
                                        style={{ backgroundColor: '#5e72e4', color: 'white', fontWeight: 600, border: 'none' }}
                                    >
                                        <Check size={20} className="me-2" style={{ marginTop: '-2px' }} />
                                        Confirm & Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .form-control:focus,
                .form-select:focus {
                    border-color: #5e72e4 !important;
                    box-shadow: 0 0 0 0.2rem rgba(94, 114, 228, 0.25) !important;
                }

                .modal.show {
                    animation: fadeIn 0.2s ease-in-out;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .modal-content {
                    animation: slideUp 0.3s ease-out;
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </>
    );
};

export default CompleteProfile;
