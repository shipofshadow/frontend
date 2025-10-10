import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { useAuth } from "../context/AuthContext.tsx";
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
        } catch {
            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 bg-light d-flex align-items-center py-5">
            <div className="container mt-5 ">
                <div className="row justify-content-center">
                    <div className="col-12 col-xl-8 col-lg-10">
                        {/* Header */}


                        <div className="card mt-5 border-0 shadow-sm">
                            <div className="card-body p-4 p-md-5">
                                {/* Progress */}
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="badge bg-primary-subtle text-primary px-3 py-2">
                                            Profile Setup
                                        </span>
                                        <small className="text-muted fw-medium">Final Step</small>
                                    </div>
                                    <div className="progress" style={{ height: '6px' }}>
                                        <div className="progress-bar" style={{ width: '100%' }}></div>
                                    </div>
                                </div>

                                {/* Alerts */}
                                {error && (
                                    <div className="alert alert-danger d-flex align-items-start mb-4">
                                        <svg width="20" height="20" fill="currentColor" className="me-2 flex-shrink-0 mt-1">
                                            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                                        </svg>
                                        <div>{error}</div>
                                    </div>
                                )}

                                {success && (
                                    <div className="alert alert-success d-flex align-items-start mb-4">
                                        <svg width="20" height="20" fill="currentColor" className="me-2 flex-shrink-0 mt-1">
                                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                        </svg>
                                        <div>Profile completed successfully! Redirecting to dashboard...</div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    {/* Personal Information */}
                                    <div className="mb-4">
                                        <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom">
                                            Personal Information
                                        </h6>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold small">
                                                    Student ID <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="student_id"
                                                    className="form-control"
                                                    value={formData.student_id}
                                                    onChange={handleChange}
                                                    placeholder="Enter your student ID"
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold small">
                                                    Email Address <span className="text-danger">*</span>
                                                    {prefilledFields.includes('email') && (
                                                        <span className="badge bg-success bg-opacity-10 text-success ms-2">
                                                            ✓ Auto-filled
                                                        </span>
                                                    )}
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    className={`form-control ${prefilledFields.includes('email') ? 'bg-light' : ''}`}
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="your.email@example.com"
                                                    required
                                                    readOnly={prefilledFields.includes('email')}
                                                />
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label fw-semibold small">
                                                    First Name <span className="text-danger">*</span>
                                                    {prefilledFields.includes('first_name') && (
                                                        <span className="badge bg-success bg-opacity-10 text-success ms-2">
                                                            ✓ Auto-filled
                                                        </span>
                                                    )}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="first_name"
                                                    className={`form-control ${prefilledFields.includes('first_name') ? 'bg-light' : ''}`}
                                                    value={formData.first_name}
                                                    onChange={handleChange}
                                                    placeholder="First name"
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label fw-semibold small">
                                                    Last Name <span className="text-danger">*</span>
                                                    {prefilledFields.includes('last_name') && (
                                                        <span className="badge bg-success bg-opacity-10 text-success ms-2">
                                                            ✓ Auto-filled
                                                        </span>
                                                    )}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="last_name"
                                                    className={`form-control ${prefilledFields.includes('last_name') ? 'bg-light' : ''}`}
                                                    value={formData.last_name}
                                                    onChange={handleChange}
                                                    placeholder="Last name"
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label fw-semibold small">Middle Name</label>
                                                <input
                                                    type="text"
                                                    name="middle_name"
                                                    className="form-control"
                                                    value={formData.middle_name}
                                                    onChange={handleChange}
                                                    placeholder="Optional"
                                                />
                                            </div>

                                            <div className="col-md-3">
                                                <label className="form-label fw-semibold small">Extension</label>
                                                <input
                                                    type="text"
                                                    name="name_extension"
                                                    className="form-control"
                                                    value={formData.name_extension}
                                                    onChange={handleChange}
                                                    placeholder="Jr., Sr., III"
                                                />
                                            </div>

                                            <div className="col-md-3">
                                                <label className="form-label fw-semibold small">
                                                    Gender <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    name="gender"
                                                    className="form-select"
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
                                                <label className="form-label fw-semibold small">
                                                    Birth Date <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    name="birth_date"
                                                    className="form-control"
                                                    value={formData.birth_date}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-3">
                                                <label className="form-label fw-semibold small">Civil Status</label>
                                                <select
                                                    name="civil_status"
                                                    className="form-select"
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

                                    {/* Contact Information */}
                                    <div className="mb-4">
                                        <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom">
                                            Contact Information
                                        </h6>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold small">Citizenship</label>
                                                <input
                                                    type="text"
                                                    name="citizenship"
                                                    className="form-control"
                                                    value={formData.citizenship}
                                                    onChange={handleChange}
                                                    placeholder="e.g., Filipino"
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold small">Contact Number</label>
                                                <input
                                                    type="tel"
                                                    name="contact_number"
                                                    className="form-control"
                                                    value={formData.contact_number}
                                                    onChange={handleChange}
                                                    placeholder="+63 912 345 6789"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <div className="d-grid mt-4 pt-3 border-top">
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Creating Profile...
                                                </>
                                            ) : (
                                                'Complete Profile & Get Started'
                                            )}
                                        </button>
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