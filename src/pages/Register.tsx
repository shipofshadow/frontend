import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { notyf } from "../utils/utils.ts";
import { registerUser } from "../services/authService.tsx";
import { sha256 } from "js-sha256";
import type { RegisterForm } from "../interfaces/registerForm.ts";

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
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
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
            await registerUser({
                ...form,
                password: hashedPassword
            });

            notyf.success('Registration successful! Please login with your credentials.');
            navigate('/login');
        } catch (err) {
            notyf.error(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center bg-light position-relative overflow-hidden">
            {/* Background decorative elements */}
            <div
                className="position-absolute"
                style={{
                    top: '-10%',
                    left: '-10%',
                    width: '300px',
                    height: '300px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%)',
                    borderRadius: '50%',
                    zIndex: 1
                }}
            />
            <div
                className="position-absolute"
                style={{
                    bottom: '-10%',
                    right: '-10%',
                    width: '400px',
                    height: '400px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                    borderRadius: '50%',
                    zIndex: 1
                }}
            />

            <div className="container-fluid px-4 position-relative" style={{ zIndex: 2 }}>
                <div className="row min-vh-100 align-items-center">

                    {/* Left Content Section - 8 columns */}
                    <div className="col-lg-7 d-none d-lg-flex flex-column justify-content-center pe-lg-5">

                        {/* Main Hero Section */}
                        <div className="mb-5">
                            <div className="d-flex align-items-center mb-4">
                                <div
                                    className="rounded-4 d-flex align-items-center justify-content-center shadow-sm bg-white border me-4"
                                    style={{
                                        width: '100px',
                                        height: '100px'
                                    }}
                                >
                                    <img
                                        src="https://ispsctagudin.info/home/assets/img/ispsc_logo.png"
                                        alt="ISPSC Logo"
                                        className="img-fluid"
                                        style={{
                                            width: '75px',
                                            height: '75px',
                                            objectFit: 'contain'
                                        }}
                                    />
                                </div>
                                <div>
                                    <h1 className="display-4 fw-bold text-primary mb-2">
                                        Join the <span className="text-gradient">iScholar</span> Community
                                    </h1>
                                    <p className="lead text-muted mb-0">
                                        Start your scholarship journey today
                                    </p>
                                </div>
                            </div>

                            <p className="fs-5 text-muted mb-4 pe-lg-5">
                                Create your iScholar account to access our intelligent scholarship
                                prequalification system. Get matched with scholarships that fit your
                                profile and track your applications in real-time.
                            </p>
                        </div>

                        {/* Benefits Grid */}
                        <div className="row g-4 mb-5">
                            <div className="col-md-6">
                                <div className="card border-0 bg-white shadow-sm h-100 rounded-4">
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <div
                                                className="rounded-3 d-flex align-items-center justify-content-center text-white me-3"
                                                style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                                                }}
                                            >
                                                <Users size={24} />
                                            </div>
                                            <h5 className="fw-bold mb-0">Join 500+ Students</h5>
                                        </div>
                                        <p className="text-muted small mb-0">
                                            Be part of a growing community of scholarship recipients
                                            who have successfully secured their educational funding.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="card border-0 bg-white shadow-sm h-100 rounded-4">
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <div
                                                className="rounded-3 d-flex align-items-center justify-content-center text-white me-3"
                                                style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                                                }}
                                            >
                                                <Award size={24} />
                                            </div>
                                            <h5 className="fw-bold mb-0">₱2M+ Awarded</h5>
                                        </div>
                                        <p className="text-muted small mb-0">
                                            Over ₱2 million in scholarships have been successfully
                                            awarded through our intelligent matching system.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="card border-0 bg-white shadow-sm h-100 rounded-4">
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <div
                                                className="rounded-3 d-flex align-items-center justify-content-center text-white me-3"
                                                style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
                                                }}
                                            >
                                                <BookOpen size={24} />
                                            </div>
                                            <h5 className="fw-bold mb-0">Smart Matching</h5>
                                        </div>
                                        <p className="text-muted small mb-0">
                                            Our AI-powered system analyzes your profile to match you
                                            with the most suitable scholarship opportunities.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="card border-0 bg-white shadow-sm h-100 rounded-4">
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <div
                                                className="rounded-3 d-flex align-items-center justify-content-center text-white me-3"
                                                style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                                                }}
                                            >
                                                <Shield size={24} />
                                            </div>
                                            <h5 className="fw-bold mb-0">Secure & Private</h5>
                                        </div>
                                        <p className="text-muted small mb-0">
                                            Your personal information is protected with enterprise-grade
                                            security and will never be shared without consent.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Process Steps */}
                        <div className="card border-0 bg-primary rounded-4 text-white">
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-3">How It Works</h5>
                                <div className="row">
                                    <div className="col-md-3 text-center mb-3 mb-md-0">
                                        <div className="display-6 fw-bold mb-2">1</div>
                                        <div className="small opacity-75">Create Account</div>
                                    </div>
                                    <div className="col-md-3 text-center mb-3 mb-md-0">
                                        <div className="display-6 fw-bold mb-2">2</div>
                                        <div className="small opacity-75">Complete Profile</div>
                                    </div>
                                    <div className="col-md-3 text-center mb-3 mb-md-0">
                                        <div className="display-6 fw-bold mb-2">3</div>
                                        <div className="small opacity-75">Get Matched</div>
                                    </div>
                                    <div className="col-md-3 text-center">
                                        <div className="display-6 fw-bold mb-2">4</div>
                                        <div className="small opacity-75">Apply & Track</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Registration Section - 4 columns */}
                    <div className="col-lg-5">
                        <div className="px-lg-4">

                            {/* Mobile Header */}
                            <div className="text-center mb-4 d-lg-none">
                                <div
                                    className="rounded-4 d-flex align-items-center justify-content-center shadow-sm bg-white border mx-auto mb-3"
                                    style={{
                                        width: '80px',
                                        height: '80px'
                                    }}
                                >
                                    <img
                                        src="https://ispsctagudin.info/home/assets/img/ispsc_logo.png"
                                        alt="ISPSC Logo"
                                        className="img-fluid"
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            objectFit: 'contain'
                                        }}
                                    />
                                </div>
                                <h1 className="h3 fw-bold text-primary mb-2">
                                    Join iScholar
                                </h1>
                                <p className="text-muted mb-0">
                                    Create your account
                                </p>
                            </div>

                            {/* Registration Card */}
                            <div className="card border-0 shadow-lg rounded-4 bg-white">

                                {/* Progress Header */}
                                <div className="card-header bg-light border-0 rounded-top-4 py-4">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <h2 className="h4 fw-bold mb-0 text-primary">Create Account</h2>
                                        <small className="text-muted">Step {currentStep} of 2</small>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="progress" style={{ height: '6px' }}>
                                        <div
                                            className="progress-bar rounded-3"
                                            style={{
                                                width: `${(currentStep / 2) * 100}%`,
                                                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                                            }}
                                        ></div>
                                    </div>

                                    <div className="d-flex justify-content-between mt-2">
                                        <small className={`${currentStep >= 1 ? 'text-primary fw-semibold' : 'text-muted'}`}>
                                            Personal Info
                                        </small>
                                        <small className={`${currentStep >= 2 ? 'text-primary fw-semibold' : 'text-muted'}`}>
                                            Account Setup
                                        </small>
                                    </div>
                                </div>

                                <div className="card-body p-4">
                                    <form onSubmit={handleSubmit}>

                                        {/* Step 1: Personal Information */}
                                        {currentStep === 1 && (
                                            <>
                                                <div className="text-center mb-4">
                                                    <div className="d-flex align-items-center justify-content-center mb-3">
                                                        <div
                                                            className="d-flex align-items-center justify-content-center rounded-4 me-3 text-white"
                                                            style={{
                                                                width: '50px',
                                                                height: '50px',
                                                                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                                                            }}
                                                        >
                                                            <User size={24} />
                                                        </div>
                                                        <div className="text-start">
                                                            <h3 className="h5 fw-bold mb-0">Personal Information</h3>
                                                            <small className="text-muted">Tell us about yourself</small>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Student ID */}
                                                <div className="mb-3">
                                                    <label className="form-label fw-semibold text-secondary d-flex align-items-center">
                                                        <CreditCard size={16} className="me-2" />
                                                        Student ID <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="position-relative">
                                                        <input
                                                            type="text"
                                                            name="student_id"
                                                            className="form-control form-control-lg rounded-3"
                                                            placeholder="E25-00123"
                                                            value={form.student_id}
                                                            onChange={handleChange}
                                                            required
                                                            style={{
                                                                paddingLeft: '3rem',
                                                                border: '2px solid #e5e7eb',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = '#3B82F6';
                                                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                            }}
                                                            onBlur={(e) => {
                                                                e.target.style.borderColor = '#e5e7eb';
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                        />
                                                        <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                                                            <CreditCard size={18} className="text-muted" />
                                                        </div>
                                                    </div>
                                                    <div className="form-text">
                                                        <small className="text-muted">Format: E25-00123</small>
                                                    </div>
                                                </div>

                                                {/* Name Fields */}
                                                <div className="row g-3 mb-3">
                                                    <div className="col-6">
                                                        <label className="form-label fw-semibold text-secondary">
                                                            First Name <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="first_name"
                                                            className="form-control form-control-lg rounded-3"
                                                            value={form.first_name}
                                                            onChange={handleChange}
                                                            required
                                                            style={{
                                                                border: '2px solid #e5e7eb',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = '#3B82F6';
                                                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                            }}
                                                            onBlur={(e) => {
                                                                e.target.style.borderColor = '#e5e7eb';
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="col-6">
                                                        <label className="form-label fw-semibold text-secondary">
                                                            Middle Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="middle_name"
                                                            className="form-control form-control-lg rounded-3"
                                                            value={form.middle_name}
                                                            onChange={handleChange}
                                                            style={{
                                                                border: '2px solid #e5e7eb',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = '#3B82F6';
                                                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                            }}
                                                            onBlur={(e) => {
                                                                e.target.style.borderColor = '#e5e7eb';
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="row g-3 mb-3">
                                                    <div className="col-8">
                                                        <label className="form-label fw-semibold text-secondary">
                                                            Last Name <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="last_name"
                                                            className="form-control form-control-lg rounded-3"
                                                            value={form.last_name}
                                                            onChange={handleChange}
                                                            required
                                                            style={{
                                                                border: '2px solid #e5e7eb',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = '#3B82F6';
                                                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                            }}
                                                            onBlur={(e) => {
                                                                e.target.style.borderColor = '#e5e7eb';
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="col-4">
                                                        <label className="form-label fw-semibold text-secondary">
                                                            Extension
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="extension_name"
                                                            className="form-control form-control-lg rounded-3"
                                                            placeholder="Jr., III"
                                                            value={form.extension_name}
                                                            onChange={handleChange}
                                                            style={{
                                                                border: '2px solid #e5e7eb',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = '#3B82F6';
                                                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                            }}
                                                            onBlur={(e) => {
                                                                e.target.style.borderColor = '#e5e7eb';
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Birth Date & Gender */}
                                                <div className="row g-3 mb-4">
                                                    <div className="col-6">
                                                        <label className="form-label fw-semibold text-secondary d-flex align-items-center">
                                                            <Calendar size={16} className="me-2" />
                                                            Birth Date <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="date"
                                                            name="birth_date"
                                                            className="form-control form-control-lg rounded-3"
                                                            value={form.birth_date}
                                                            onChange={handleChange}
                                                            required
                                                            style={{
                                                                border: '2px solid #e5e7eb',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = '#3B82F6';
                                                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                            }}
                                                            onBlur={(e) => {
                                                                e.target.style.borderColor = '#e5e7eb';
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="col-6">
                                                        <label className="form-label fw-semibold text-secondary">
                                                            Gender <span className="text-danger">*</span>
                                                        </label>
                                                        <select
                                                            name="gender"
                                                            className="form-select form-select-lg rounded-3"
                                                            value={form.gender}
                                                            onChange={handleChange}
                                                            required
                                                            style={{
                                                                border: '2px solid #e5e7eb',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = '#3B82F6';
                                                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                            }}
                                                            onBlur={(e) => {
                                                                e.target.style.borderColor = '#e5e7eb';
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                        >
                                                            <option value="">Choose gender...</option>
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Next Button */}
                                                <div className="d-grid">
                                                    <button
                                                        type="button"
                                                        onClick={handleNext}
                                                        className="btn btn-lg fw-semibold border-0 rounded-3 text-white"
                                                        style={{
                                                            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                                                            padding: '0.875rem 2rem',
                                                            transition: 'all 0.3s ease',
                                                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.6)';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
                                                        }}
                                                    >
                                                        Continue to Account Setup
                                                        <ArrowLeft size={18} className="ms-2" style={{ transform: 'rotate(180deg)' }} />
                                                    </button>
                                                </div>
                                            </>
                                        )}

                                        {/* Step 2: Account Information */}
                                        {currentStep === 2 && (
                                            <>
                                                <div className="text-center mb-4">
                                                    <div className="d-flex align-items-center justify-content-center mb-3">
                                                        <div
                                                            className="d-flex align-items-center justify-content-center rounded-4 me-3 text-white"
                                                            style={{
                                                                width: '50px',
                                                                height: '50px',
                                                                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                                                            }}
                                                        >
                                                            <UserPlus size={24} />
                                                        </div>
                                                        <div className="text-start">
                                                            <h3 className="h5 fw-bold mb-0">Account Setup</h3>
                                                            <small className="text-muted">Create your login credentials</small>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Username & Email */}
                                                <div className="row g-3 mb-3">
                                                    <div className="col-12">
                                                        <label className="form-label fw-semibold text-secondary d-flex align-items-center">
                                                            <User size={16} className="me-2" />
                                                            Username <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="position-relative">
                                                            <input
                                                                type="text"
                                                                name="username"
                                                                className="form-control form-control-lg rounded-3"
                                                                placeholder="Choose your username"
                                                                value={form.username}
                                                                onChange={handleChange}
                                                                required
                                                                style={{
                                                                    paddingLeft: '3rem',
                                                                    border: '2px solid #e5e7eb',
                                                                    transition: 'all 0.3s ease'
                                                                }}
                                                                onFocus={(e) => {
                                                                    e.target.style.borderColor = '#3B82F6';
                                                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                                }}
                                                                onBlur={(e) => {
                                                                    e.target.style.borderColor = '#e5e7eb';
                                                                    e.target.style.boxShadow = 'none';
                                                                }}
                                                            />
                                                            <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                                                                <User size={18} className="text-muted" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label fw-semibold text-secondary d-flex align-items-center">
                                                        <Mail size={16} className="me-2" />
                                                        Email Address <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="position-relative">
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            className="form-control form-control-lg rounded-3"
                                                            placeholder="your.email@example.com"
                                                            value={form.email}
                                                            onChange={handleChange}
                                                            required
                                                            style={{
                                                                paddingLeft: '3rem',
                                                                border: '2px solid #e5e7eb',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = '#3B82F6';
                                                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                            }}
                                                            onBlur={(e) => {
                                                                e.target.style.borderColor = '#e5e7eb';
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                        />
                                                        <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                                                            <Mail size={18} className="text-muted" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Contact Number */}
                                                <div className="mb-3">
                                                    <label className="form-label fw-semibold text-secondary d-flex align-items-center">
                                                        <Phone size={16} className="me-2" />
                                                        Contact Number <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="position-relative">
                                                        <input
                                                            type="tel"
                                                            name="contact_number"
                                                            className="form-control form-control-lg rounded-3"
                                                            placeholder="+63 912 345 6789"
                                                            value={form.contact_number}
                                                            onChange={handleChange}
                                                            required
                                                            style={{
                                                                paddingLeft: '3rem',
                                                                border: '2px solid #e5e7eb',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = '#3B82F6';
                                                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                            }}
                                                            onBlur={(e) => {
                                                                e.target.style.borderColor = '#e5e7eb';
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                        />
                                                        <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                                                            <Phone size={18} className="text-muted" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Password */}
                                                <div className="mb-4">
                                                    <label className="form-label fw-semibold text-secondary d-flex align-items-center">
                                                        <Lock size={16} className="me-2" />
                                                        Password <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="position-relative">
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            name="password"
                                                            className="form-control form-control-lg rounded-3"
                                                            placeholder="Create a strong password"
                                                            value={form.password}
                                                            onChange={handleChange}
                                                            required
                                                            style={{
                                                                paddingLeft: '3rem',
                                                                paddingRight: '3rem',
                                                                border: '2px solid #e5e7eb',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = '#3B82F6';
                                                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                            }}
                                                            onBlur={(e) => {
                                                                e.target.style.borderColor = '#e5e7eb';
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                        />
                                                        <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                                                            <Lock size={18} className="text-muted" />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            style={{ zIndex: 10 }}
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff size={18} className="text-muted" />
                                                            ) : (
                                                                <Eye size={18} className="text-muted" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <div className="form-text">
                                                        <small className="text-muted">
                                                            Use at least 8 characters with letters, numbers, and symbols
                                                        </small>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="row g-2 mb-3">
                                                    <div className="col-4">
                                                        <button
                                                            type="button"
                                                            onClick={handleBack}
                                                            className="btn btn-outline-secondary btn-lg w-100 rounded-3"
                                                        >
                                                            <ArrowLeft size={18} />
                                                        </button>
                                                    </div>
                                                    <div className="col-8">
                                                        <button
                                                            type="submit"
                                                            className="btn btn-lg fw-semibold border-0 rounded-3 text-white w-100"
                                                            style={{
                                                                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                                                padding: '0.875rem 2rem',
                                                                transition: 'all 0.3s ease',
                                                                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                                                            }}
                                                            disabled={isLoading}
                                                            onMouseOver={(e) => {
                                                                if (!isLoading) {
                                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.6)';
                                                                }
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
                                                            }}
                                                        >
                                                            {isLoading ? (
                                                                <>
                                                                    <div
                                                                        className="spinner-border spinner-border-sm me-2"
                                                                        role="status"
                                                                        aria-hidden="true"
                                                                    ></div>
                                                                    Creating Account...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserPlus size={18} className="me-2" />
                                                                    CREATE ACCOUNT
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Terms Notice */}
                                                <div className="alert alert-info border-0 rounded-3 bg-light">
                                                    <div className="d-flex align-items-start">
                                                        <CheckCircle size={16} className="text-primary me-2 mt-1" />
                                                        <small className="text-muted">
                                                            By creating an account, you agree to our
                                                            <Link to="/terms" className="text-primary text-decoration-none ms-1">Terms of Service</Link> and
                                                            <Link to="/privacy" className="text-primary text-decoration-none ms-1">Privacy Policy</Link>.
                                                        </small>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </form>
                                </div>

                                {/* Footer Links */}
                                <div className="card-footer text-center border-0 bg-light rounded-bottom-4 py-4">
                                    <div>
                                        <span className="text-muted small">Already have an account?</span>
                                        <br />
                                        <Link
                                            to="/login"
                                            className="text-primary fw-semibold text-decoration-none mt-1 d-inline-block"
                                        >
                                            <ArrowLeft size={14} className="me-1" />
                                            Sign In Here
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="position-absolute bottom-0 w-100 py-3 text-center" style={{ zIndex: 2 }}>
                <div className="text-muted small">
                    <p className="mb-1">© {new Date().getFullYear()} iScholar - Student Registration Portal</p>
                    <p className="mb-0">Secure • Private • Intelligent</p>
                </div>
            </div>

            <style>{`
        .text-gradient {
          background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-2px);
        }
        
        .shadow-lg {
          box-shadow: 0 1.5rem 4rem rgba(0, 0, 0, 0.15) !important;
        }
        
        .form-control:focus,
        .form-select:focus {
          border-color: #3B82F6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        
        .btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        
        .btn:active {
          transform: translateY(0);
        }
        
        .progress {
          border-radius: 10px;
          background-color: rgba(59, 130, 246, 0.1);
        }
        
        .progress-bar {
          border-radius: 10px;
        }
        
        @media (max-width: 992px) {
          .min-vh-100 {
            padding: 2rem 0;
          }
          
          .card {
            margin: 0 1rem;
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .card {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
        </div>
    );
};

export default Register;
