import React, { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    Calendar,
    CreditCard,
    UserPlus,
    ArrowLeft,
    CheckCircle,
    Shield,
    Users,
    Award,
    BookOpen
} from 'lucide-react';
import {useNavigate, type To} from "react-router-dom";
import type {RegisterForm} from "../interfaces/registerForm.ts";
import {notyf} from "../utils/utils.ts";
import {sha256} from "js-sha256";
import {registerUser} from "../services/authService.tsx";

const Register = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState<RegisterForm>({
        student_id: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        extension_name: '',
        gender: '',
        username: '',
        email: '',
        contact_number: '',
        password: '',
        birth_date: '',
    });

    const isFormValid = () => {
        const requiredFields = [
            'student_id', 'first_name', 'last_name', 'gender', 'username',
            'email', 'contact_number', 'password', 'birth_date'
        ];

        for (const field of requiredFields) {
            if (!form[field as keyof typeof form]) {
                return false;
            }
        }
        return true;
    };

    const isStep1Valid = () => {
        return form.student_id && form.first_name && form.last_name &&
            form.birth_date && form.gender;
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setForm(prev => ({...prev, [name]: value}));
    };

    const handleNext = () => {
        if (currentStep === 1 && !isStep1Valid()) {
            notyf.error('Please complete all required fields in this step.');
            return;
        }
        if (currentStep === 1 && !form.student_id.match(/^[A-Z]\d{2}-\d{5}$/)) {
            notyf.error('Student ID must be in the format E25-00123');
            return;
        }
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid()) {
            notyf.error('Please fill in all required fields.');
            return;
        }

        if (!form.student_id.match(/^[A-Z]\d{2}-\d{5}$/)) {
            notyf.error('Student ID must be in the format E25-00123');
            return;
        }

        setIsLoading(true);

        try {
            const hashedPassword = sha256(form.password);
            const response = await registerUser({
                ...form,
                password: hashedPassword
            });

            notyf.success(response.message || 'Registration successful! Please log in.');
            navigate('/login');
        } catch (err) {
            notyf.error(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };


    const handleLinkClick = (path: To) => {
        navigate(path)
    };

    return (
        <div className="min-vh-100 bg-light position-relative overflow-hidden">
            {/* Background decorations */}
            <div
                className="position-absolute rounded-circle opacity-25"
                style={{
                    top: '-5%',
                    left: '-5%',
                    width: '200px',
                    height: '200px',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                    zIndex: 1
                }}
            />
            <div
                className="position-absolute rounded-circle opacity-25"
                style={{
                    bottom: '-5%',
                    right: '-5%',
                    width: '250px',
                    height: '250px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    zIndex: 1
                }}
            />

            <div className="container-fluid h-100 position-relative" style={{ zIndex: 2, margin: '5rem auto' }}>
                <div className="row h-100 align-items-center justify-content-center">
                    {/* Left Panel - Information */}
                    <div className="col-lg-7 col-xl-6 d-none d-lg-block p-4">
                        <div className="p-5 h-100 d-flex flex-column">
                            {/* Header */}
                            <div className="d-flex align-items-center mb-4">
                                <img
                                    src="https://ispsctagudin.info/home/assets/img/ispsc_logo.png"
                                    alt="iScholar Logo"
                                    className="rounded-3 me-3"
                                    style={{ width: '60px', height: '60px' }}
                                />
                                <div>
                                    <h1
                                        className="h2 fw-bold mb-1"
                                        style={{
                                            background: 'linear-gradient(90deg, #3B82F6 0%, #1D4ED8 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        Join the iScholar Community
                                    </h1>
                                    <p className="text-muted mb-0 fs-6">
                                        Start your scholarship journey today
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-secondary mb-4 fs-6 lh-base">
                                Create your iScholar account to access our intelligent scholarship prequalification system.
                                Get matched with scholarships that fit your profile and track your applications in real-time.
                            </p>

                            {/* Benefits Grid */}
                            <div className="flex-grow-1 mb-4">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="bg-primary bg-opacity-10 rounded-3 p-3 h-100">
                                            <div className="d-flex align-items-center mb-2">
                                                <div className="bg-primary rounded-2 p-2 me-3">
                                                    <Users size={20} className="text-white" />
                                                </div>
                                                <h6 className="fw-bold mb-0">Join 500+ Students</h6>
                                            </div>
                                            <p className="small text-muted mb-0">
                                                Be part of a growing community of scholarship recipients.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="bg-success bg-opacity-10 rounded-3 p-3 h-100">
                                            <div className="d-flex align-items-center mb-2">
                                                <div className="bg-success rounded-2 p-2 me-3">
                                                    <Award size={20} className="text-white" />
                                                </div>
                                                <h6 className="fw-bold mb-0">₱2M+ Awarded</h6>
                                            </div>
                                            <p className="small text-muted mb-0">
                                                Over ₱2 million in scholarships successfully awarded.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="bg-info bg-opacity-10 rounded-3 p-3 h-100">
                                            <div className="d-flex align-items-center mb-2">
                                                <div className="bg-info rounded-2 p-2 me-3">
                                                    <BookOpen size={20} className="text-white" />
                                                </div>
                                                <h6 className="fw-bold mb-0">Smart Matching</h6>
                                            </div>
                                            <p className="small text-muted mb-0">
                                                AI-powered system matches you with suitable scholarships.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="bg-warning bg-opacity-10 rounded-3 p-3 h-100">
                                            <div className="d-flex align-items-center mb-2">
                                                <div className="bg-warning rounded-2 p-2 me-3">
                                                    <Shield size={20} className="text-white" />
                                                </div>
                                                <h6 className="fw-bold mb-0">Secure & Private</h6>
                                            </div>
                                            <p className="small text-muted mb-0">
                                                Enterprise-grade security for your personal data.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Process Steps */}
                            <div
                                className="bg-primary text-white rounded-3 p-4 mt-auto"
                                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%) !important' }}
                            >
                                <h6 className="fw-bold mb-3">How It Works</h6>
                                <div className="row text-center">
                                    <div className="col-3">
                                        <div className="h5 fw-bold mb-1">1</div>
                                        <div className="small opacity-75">Create Account</div>
                                    </div>
                                    <div className="col-3">
                                        <div className="h5 fw-bold mb-1">2</div>
                                        <div className="small opacity-75">Complete Profile</div>
                                    </div>
                                    <div className="col-3">
                                        <div className="h5 fw-bold mb-1">3</div>
                                        <div className="small opacity-75">Get Matched</div>
                                    </div>
                                    <div className="col-3">
                                        <div className="h5 fw-bold mb-1">4</div>
                                        <div className="small opacity-75">Apply & Track</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Registration Form */}
                    <div className="col-lg-5 col-xl-4 p-4">
                        <div className="bg-white rounded-4 shadow p-4" style={{ maxWidth: '450px', margin: '0 auto' }}>
                            {/* Mobile Header */}
                            <div className="text-center mb-4 d-lg-none">
                                <img
                                    src="https://ispsctagudin.info/home/assets/img/ispsc_logo.png"
                                    alt="iScholar Logo"
                                    className="rounded-3 mb-3"
                                    style={{ width: '50px', height: '50px' }}
                                />
                                <h2 className="h4 fw-bold text-primary mb-1">Join iScholar</h2>
                                <p className="text-muted small mb-0">Create your account</p>
                            </div>

                            {/* Progress Header */}
                            <div className="mb-4">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <h3 className="h5 fw-bold mb-0 text-primary">Create Account</h3>
                                    <small className="text-muted">Step {currentStep} of 2</small>
                                </div>

                                {/* Progress Bar */}
                                <div className="progress mb-2" style={{ height: '4px' }}>
                                    <div
                                        className="progress-bar bg-primary"
                                        style={{ width: `${(currentStep / 2) * 100}%` }}
                                    />
                                </div>

                                <div className="d-flex justify-content-between">
                                    <small className={currentStep >= 1 ? 'text-primary fw-semibold' : 'text-muted'}>
                                        Personal Info
                                    </small>
                                    <small className={currentStep >= 2 ? 'text-primary fw-semibold' : 'text-muted'}>
                                        Account Setup
                                    </small>
                                </div>
                            </div>

                            {/* Step 1: Personal Information */}
                            {currentStep === 1 && (
                                <div>
                                    <div className="text-center mb-4">
                                        <div className="d-flex align-items-center justify-content-center mb-3">
                                            <div className="bg-primary rounded-3 p-2 me-3">
                                                <User size={20} className="text-white" />
                                            </div>
                                            <div className="text-start">
                                                <h4 className="h6 fw-bold mb-0">Personal Information</h4>
                                                <small className="text-muted">Tell us about yourself</small>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Student ID */}
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold text-secondary">
                                            <CreditCard size={14} className="me-1" />
                                            Student ID <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="student_id"
                                            className="form-control"
                                            placeholder="E25-00123"
                                            value={form.student_id}
                                            onChange={handleChange}
                                            required
                                        />
                                        <div className="form-text small text-muted">
                                            Format: E25-00123
                                        </div>
                                    </div>

                                    {/* Name Fields */}
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="form-label small fw-semibold text-secondary">
                                                First Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="first_name"
                                                className="form-control"
                                                value={form.first_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-semibold text-secondary">
                                                Middle Name
                                            </label>
                                            <input
                                                type="text"
                                                name="middle_name"
                                                className="form-control"
                                                value={form.middle_name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="row g-2 mb-3">
                                        <div className="col-8">
                                            <label className="form-label small fw-semibold text-secondary">
                                                Last Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="last_name"
                                                className="form-control"
                                                value={form.last_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-4">
                                            <label className="form-label small fw-semibold text-secondary">
                                                Extension
                                            </label>
                                            <input
                                                type="text"
                                                name="extension_name"
                                                className="form-control"
                                                placeholder="Jr., III"
                                                value={form.extension_name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Birth Date & Gender */}
                                    <div className="row g-2 mb-4">
                                        <div className="col-6">
                                            <label className="form-label small fw-semibold text-secondary">
                                                <Calendar size={14} className="me-1" />
                                                Birth Date <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                name="birth_date"
                                                className="form-control"
                                                value={form.birth_date}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-semibold text-secondary">
                                                Gender <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                name="gender"
                                                className="form-select"
                                                value={form.gender}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Choose...</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Next Button */}
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="btn btn-primary w-100 fw-semibold py-2"
                                        style={{
                                            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                                            border: 'none'
                                        }}
                                    >
                                        Continue to Account Setup
                                        <ArrowLeft size={16} className="ms-2" style={{ transform: 'rotate(180deg)' }} />
                                    </button>
                                </div>
                            )}

                            {/* Step 2: Account Information */}
                            {currentStep === 2 && (
                                <div>
                                    <div className="text-center mb-4">
                                        <div className="d-flex align-items-center justify-content-center mb-3">
                                            <div className="bg-success rounded-3 p-2 me-3">
                                                <UserPlus size={20} className="text-white" />
                                            </div>
                                            <div className="text-start">
                                                <h4 className="h6 fw-bold mb-0">Account Setup</h4>
                                                <small className="text-muted">Create your login credentials</small>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Username */}
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold text-secondary">
                                            <User size={14} className="me-1" />
                                            Username <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            className="form-control"
                                            placeholder="Choose your username"
                                            value={form.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold text-secondary">
                                            <Mail size={14} className="me-1" />
                                            Email Address <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control"
                                            placeholder="your.email@example.com"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Contact Number */}
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold text-secondary">
                                            <Phone size={14} className="me-1" />
                                            Contact Number <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="contact_number"
                                            className="form-control"
                                            placeholder="+63 912 345 6789"
                                            value={form.contact_number}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="mb-4">
                                        <label className="form-label small fw-semibold text-secondary">
                                            <Lock size={14} className="me-1" />
                                            Password <span className="text-danger">*</span>
                                        </label>
                                        <div className="position-relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                className="form-control pe-5"
                                                placeholder="Create a strong password"
                                                value={form.password}
                                                onChange={handleChange}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-link position-absolute top-50 end-0 translate-middle-y border-0 text-muted"
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{ padding: '0.375rem' }}
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        <div className="form-text small text-muted">
                                            Use at least 8 characters with letters, numbers, and symbols
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="row g-2 mb-3">
                                        <div className="col-4">
                                            <button
                                                type="button"
                                                onClick={handleBack}
                                                className="btn btn-outline-secondary w-100"
                                            >
                                                <ArrowLeft size={16} />
                                            </button>
                                        </div>
                                        <div className="col-8">
                                            <button
                                                type="button"
                                                onClick={handleSubmit}
                                                className="btn btn-success w-100 fw-semibold"
                                                disabled={isLoading}
                                                style={{
                                                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                                    border: 'none'
                                                }}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" />
                                                        Creating Account...
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus size={16} className="me-2" />
                                                        CREATE ACCOUNT
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Terms Notice */}
                                    <div className="alert alert-light border-0 rounded-3 mb-0">
                                        <div className="d-flex align-items-start">
                                            <CheckCircle size={16} className="text-primary me-2 mt-1 flex-shrink-0" />
                                            <small className="text-muted">
                                                By creating an account, you agree to our{' '}
                                                <button
                                                    type="button"
                                                    className="btn btn-link p-0 text-primary text-decoration-none small"
                                                    onClick={() => handleLinkClick('/terms')}
                                                >
                                                    Terms of Service
                                                </button>{' '}
                                                and{' '}
                                                <button
                                                    type="button"
                                                    className="btn btn-link p-0 text-primary text-decoration-none small"
                                                    onClick={() => handleLinkClick('/privacy')}
                                                >
                                                    Privacy Policy
                                                </button>.
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="text-center border-top pt-3 mt-4">
                                <div className="mb-2">
                                    <span className="text-muted small">Already have an account?</span>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => handleLinkClick('/login')}
                                >
                                    <ArrowLeft size={14} className="me-1" />
                                    Sign In Here
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Register;