import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import {useAuth} from "../context/AuthContext.tsx";
import type User from "../types/user.ts";

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
    const {login} = useAuth()
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

    if (!token || !refresh_token || !user) {
        window.location.href = "/login";
    }


    // Pre-fill form with OAuth data on component mount
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
        } catch  {
            setError( "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 bg-light d-flex align-items-center py-4">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-xl-10 col-lg-11">
                        {/* Header Section */}
                        <div className="text-center mb-4">
                            <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                 style={{ width: '80px', height: '80px' }}>
                                <i className="fas fa-user-plus text-white fs-1"></i>
                            </div>
                            <h1 className="h2 fw-bold text-dark mb-2">Complete Your Profile</h1>
                            <p className="text-muted mb-0">Just a few more details to get you started with iScholar</p>
                        </div>

                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4 p-md-5">
                                {/* Progress Indicator */}
                                <div className="mb-4">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <small className="text-muted fw-medium">Profile Setup Progress</small>
                                        <small className="text-primary fw-medium">Final Step</small>
                                    </div>
                                    <div className="progress" style={{ height: '4px' }}>
                                        <div className="progress-bar bg-primary" style={{ width: '100%' }}></div>
                                    </div>
                                </div>

                                {/* Alerts */}
                                {error && (
                                    <div className="alert alert-danger border-0 rounded-3 d-flex align-items-center mb-4">
                                        <i className="fas fa-exclamation-circle me-2"></i>
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="alert alert-success border-0 rounded-3 d-flex align-items-center mb-4">
                                        <i className="fas fa-check-circle me-2"></i>
                                        Profile completed successfully! Redirecting to dashboard...
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    {/* Personal Information Section */}
                                    <div className="mb-4">
                                        <h5 className="text-dark fw-bold mb-3 d-flex align-items-center">
                                            <i className="fas fa-user text-primary me-2"></i>
                                            Personal Information
                                        </h5>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">
                                                    Student ID <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="student_id"
                                                    className="form-control form-control-lg border-2"
                                                    value={formData.student_id}
                                                    onChange={handleChange}
                                                    placeholder="Enter your student ID"
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">
                                                    Email Address <span className="text-danger">*</span>
                                                    {prefilledFields.includes('email') && (
                                                        <span className="badge bg-success-subtle text-success ms-2">
                                                            <i className="fas fa-check-circle me-1"></i>Auto-filled
                                                        </span>
                                                    )}
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    className={`form-control form-control-lg border-2 ${prefilledFields.includes('email') ? 'bg-light' : ''}`}
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="your.email@example.com"
                                                    required
                                                    readOnly={prefilledFields.includes('email')}
                                                />
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label fw-medium">
                                                    First Name <span className="text-danger">*</span>
                                                    {prefilledFields.includes('first_name') && (
                                                        <span className="badge bg-success-subtle text-success ms-2">
                                                            <i className="fas fa-check-circle me-1"></i>Auto-filled
                                                        </span>
                                                    )}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="first_name"
                                                    className={`form-control form-control-lg border-2 ${prefilledFields.includes('first_name') ? 'bg-light' : ''}`}
                                                    value={formData.first_name}
                                                    onChange={handleChange}
                                                    placeholder="First name"
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label fw-medium">
                                                    Last Name <span className="text-danger">*</span>
                                                    {prefilledFields.includes('last_name') && (
                                                        <span className="badge bg-success-subtle text-success ms-2">
                                                            <i className="fas fa-check-circle me-1"></i>Auto-filled
                                                        </span>
                                                    )}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="last_name"
                                                    className={`form-control form-control-lg border-2 ${prefilledFields.includes('last_name') ? 'bg-light' : ''}`}
                                                    value={formData.last_name}
                                                    onChange={handleChange}
                                                    placeholder="Last name"
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label fw-medium">Middle Name</label>
                                                <input
                                                    type="text"
                                                    name="middle_name"
                                                    className="form-control form-control-lg border-2"
                                                    value={formData.middle_name}
                                                    onChange={handleChange}
                                                    placeholder="Middle name (optional)"
                                                />
                                            </div>

                                            <div className="col-md-3">
                                                <label className="form-label fw-medium">Extension</label>
                                                <input
                                                    type="text"
                                                    name="name_extension"
                                                    className="form-control form-control-lg border-2"
                                                    value={formData.name_extension}
                                                    onChange={handleChange}
                                                    placeholder="Jr., Sr., III"
                                                />
                                            </div>

                                            <div className="col-md-3">
                                                <label className="form-label fw-medium">
                                                    Gender <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    name="gender"
                                                    className="form-select form-select-lg border-2"
                                                    value={formData.gender}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Prefer not to say</option>
                                                </select>
                                            </div>

                                            <div className="col-md-3">
                                                <label className="form-label fw-medium">
                                                    Birth Date <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    name="birth_date"
                                                    className="form-control form-control-lg border-2"
                                                    value={formData.birth_date}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-3">
                                                <label className="form-label fw-medium">Civil Status</label>
                                                <select
                                                    name="civil_status"
                                                    className="form-select form-select-lg border-2"
                                                    value={formData.civil_status}
                                                    onChange={handleChange}
                                                >
                                                    <option value="Single">Single</option>
                                                    <option value="Married">Married</option>
                                                    <option value="Divorced">Divorced</option>
                                                    <option value="Widowed">Widowed</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="my-4" />

                                    {/* Contact Information Section */}
                                    <div className="mb-4">
                                        <h5 className="text-dark fw-bold mb-3 d-flex align-items-center">
                                            <i className="fas fa-address-book text-primary me-2"></i>
                                            Contact Information
                                        </h5>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">Citizenship</label>
                                                <input
                                                    type="text"
                                                    name="citizenship"
                                                    className="form-control form-control-lg border-2"
                                                    value={formData.citizenship}
                                                    onChange={handleChange}
                                                    placeholder="e.g., Filipino"
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">Contact Number</label>
                                                <input
                                                    type="tel"
                                                    name="contact_number"
                                                    className="form-control form-control-lg border-2"
                                                    value={formData.contact_number}
                                                    onChange={handleChange}
                                                    placeholder="+63 912 345 6789"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="d-grid gap-2 mt-4">
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg py-3 fw-bold"
                                            disabled={loading}
                                            style={{ fontSize: '1.1rem' }}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Creating Your Profile...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-rocket me-2"></i>
                                                    Complete Profile & Get Started
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Help Text */}
                                    <div className="text-center mt-3">
                                        <small className="text-muted">
                                            <i className="fas fa-shield-alt me-1"></i>
                                            Your information is secure and will only be used for scholarship management
                                        </small>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompleteProfile;