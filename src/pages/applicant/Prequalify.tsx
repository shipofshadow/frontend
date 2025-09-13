import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from "../../config";

interface FormData {
    gwa: number;
    income: number;
    year_level: string;
    is_4ps_member: boolean;
    ip_affiliation: boolean;
    is_pwd: false;
    siblings_in_college: number;
    mother_occupation: string;
    father_occupation: string;
    total_units: number;
}

interface Scholarship {
    scholarship_id: number;
    name: string;
    description: string;
    amount: number;
    score: number;
    classification: string;
    reasons: []
}

interface EligibilityResult {
    success: boolean;
    score: number;
    original_score?: number;
    bonus_points?: number;
    classification: string;
    recommended_scholarships?: Scholarship[];
    tips?: string[];
    response_time_ms?: number;
    error?: string;
}

const Prequalify: React.FC = () => {
    const { user, token } = useAuth();

    // Initial form data
    const initialFormData: FormData = {
        gwa: 0.0,
        income: 0,
        year_level: '',
        is_4ps_member: false,
        ip_affiliation: false,
        is_pwd: false,
        siblings_in_college: 0,
        father_occupation: '',
        mother_occupation: '',
        total_units: 0
    };

    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
    const [isCalculating, setIsCalculating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Real-time calculation with debouncing
    useEffect(() => {
        const calculateEligibility = async (): Promise<void> => {
            // Only calculate if we have minimum required data
            if (!formData.gwa || !formData.income) return;

            setIsCalculating(true);
            setError(null);

            try {
                const response = await fetch(`${API_BASE_URL}/api/prequalify/calculate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result: EligibilityResult = await response.json();

                if (result.success) {
                    setEligibilityResult(result);
                } else {
                    setError(result.error || 'Calculation failed');
                }
            } catch (err) {
                setError('Network error. Please check your connection.');
                console.error('Prequalification error:', err);
            } finally {
                setIsCalculating(false);
            }
        };

        // Clear previous timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Set new timeout for debouncing
        debounceTimeoutRef.current = setTimeout(calculateEligibility, 800);

        // Cleanup timeout on unmount
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [formData, token]);

    const handleInputChange = <K extends keyof FormData>(field: string, value: FormData[K]): void => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const handleReset = (): void => {
        setFormData(initialFormData);
        setEligibilityResult(null);
        setError(null);
    };

    const handleNumberInput = (value: string, field: 'gwa' | 'income' | 'total_units'): void => {

            handleInputChange(field, value);

    };

    return (
        <div className="container-fluid py-4">
            <div className="row">
                <div className="col-12">
                    <div className="card shadow-lg border-0 rounded-3">
                        {/* Header */}
                        <div className="card-header bg-gradient-primary text-white border-0 rounded-top-3">
                            <div className="d-flex justify-content-between align-items-center py-2">
                                <div>
                                    <h4 className="mb-1 fw-bold">
                                        <i className="fas fa-graduation-cap me-2"></i>
                                        iScholar Prequalification
                                    </h4>
                                    <p className="mb-0 opacity-90">Discover your scholarship eligibility in real-time</p>
                                </div>
                                <div className="d-flex align-items-center">
                                    <div className="badge bg-white text-primary px-3 py-2 rounded-pill">
                                        <i className="fas fa-user-circle me-1"></i>
                                        {user?.username}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card-body p-4">
                            <div className="row g-4">
                                {/* Left Column: Enhanced Form Section */}
                                <div className="col-lg-6">
                                    <div className="h-100">
                                        <h5 className="mb-4 text-primary fw-semibold">
                                            <i className="fas fa-clipboard-list me-2"></i>
                                            Your Information
                                        </h5>

                                        {/* Academic Information Card */}
                                        <div className="card mb-4 border-0 shadow-sm">
                                            <div className="card-header bg-light border-0">
                                                <h6 className="mb-0 text-success fw-semibold">
                                                    <i className="fas fa-book-open me-2"></i>
                                                    Academic Details
                                                </h6>
                                            </div>
                                            <div className="card-body">
                                                {/* GWA Input with Enhanced Validation */}
                                                <div className="mb-4">
                                                    <label className="form-label fw-medium d-flex align-items-center">
                                                        General Weighted Average (GWA)
                                                        <span className="text-danger ms-1">*</span>
                                                        <i
                                                            className="fas fa-info-circle text-muted ms-2"
                                                            data-bs-toggle="tooltip"
                                                            title="Your current academic average (1.00 = highest, 5.00 = lowest)"
                                                        ></i>
                                                    </label>
                                                    <div className="input-group input-group-lg">
                                                <span className="input-group-text bg-primary text-white border-0">
                                                    <i className="fas fa-award"></i>
                                                </span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="1.00"
                                                            max="5.00"
                                                            className={`form-control border-0 shadow-sm ${
                                                                formData.gwa ?
                                                                    (formData.gwa <= 3.0 ? 'is-valid' : 'is-warning') :
                                                                    ''
                                                            }`}
                                                            value={formData.gwa}
                                                            onChange={(e) => handleNumberInput(e.target.value, 'gwa')}
                                                            placeholder="Enter your GWA (e.g. 1.75)"
                                                        />
                                                    </div>
                                                    <div className="form-text d-flex justify-content-between align-items-center">
                                                        <span>Scale: 1.00 (Excellent) to 5.00 (Failed)</span>
                                                        {formData.gwa && (
                                                            <span className={`badge ${
                                                                formData.gwa <= 1.5 ? 'bg-success' :
                                                                    formData.gwa <= 2.5 ? 'bg-warning' :
                                                                        formData.gwa <= 3.0 ? 'bg-info' : 'bg-danger'
                                                            }`}>
                                                        <i className={`fas ${
                                                            formData.gwa <= 1.5 ? 'fa-star' :
                                                                formData.gwa <= 2.5 ? 'fa-thumbs-up' :
                                                                    formData.gwa <= 3.0 ? 'fa-check' : 'fa-exclamation-triangle'
                                                        } me-1`}></i>
                                                                {formData.gwa <= 1.5 ? 'Excellent' :
                                                                    formData.gwa <= 2.5 ? 'Good' :
                                                                        formData.gwa <= 3.0 ? 'Fair' : 'Needs Improvement'}
                                                    </span>
                                                        )}
                                                    </div>
                                                    {/* GWA Progress Bar */}
                                                    {formData.gwa && (
                                                        <div className="mt-2">
                                                            <div className="progress" style={{ height: '6px' }}>
                                                                <div
                                                                    className={`progress-bar ${
                                                                        formData.gwa <= 1.5 ? 'bg-success' :
                                                                            formData.gwa <= 2.5 ? 'bg-warning' :
                                                                                formData.gwa <= 3.0 ? 'bg-info' : 'bg-danger'
                                                                    }`}
                                                                    style={{ width: `${Math.max(20, (5 - parseFloat(String(formData.gwa))) / 4 * 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Year Level */}
                                                <div className="mb-3">
                                                    <label className="form-label fw-medium">Current Year Level</label>
                                                    <select
                                                        className="form-select form-select-lg border-0 shadow-sm"
                                                        value={formData.year_level}
                                                        onChange={(e) => handleInputChange('year_level', e.target.value)}
                                                    >
                                                        <option value="">Select your year level</option>
                                                        <option value="1st Year">1st Year</option>
                                                        <option value="2nd Year">2nd Year</option>
                                                        <option value="3rd Year">3rd Year</option>
                                                        <option value="4th Year">4th Year</option>
                                                    </select>
                                                </div>

                                                {/* Total Units Input */}
                                                <div className="mb-3">
                                                    <label className="form-label fw-medium d-flex align-items-center">
                                                        Total Units Enrolled
                                                        <span className="text-danger ms-1">*</span>
                                                        <i
                                                            className="fas fa-info-circle text-muted ms-2"
                                                            data-bs-toggle="tooltip"
                                                            title="Total number of units you are enrolled in this semester"
                                                        ></i>
                                                    </label>
                                                    <div className="input-group">
        <span className="input-group-text bg-primary text-white border-0">
            <i className="fas fa-calculator"></i>
        </span>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="30"
                                                            className={`form-control border-0 shadow-sm ${
                                                                formData.total_units ? 'is-valid' : ''
                                                            }`}
                                                            value={formData.total_units}
                                                            onChange={(e) => handleNumberInput(e.target.value, 'total_units')}
                                                            placeholder="Enter total units (e.g. 21)"
                                                        />
                                                        <span className="input-group-text bg-light">
            <i className="fas fa-book me-1"></i>
            units
        </span>
                                                    </div>
                                                    {formData.total_units && (
                                                        <div className="form-text">
                                                            <div className="d-flex align-items-center mt-2">
                                                            <span className={`badge me-2 ${
                                                                formData.total_units >= 18 ? 'bg-success' :
                                                                    formData.total_units >= 12 ? 'bg-warning' : 'bg-secondary'
                                                            }`}>
                                                                <i className={`fas ${
                                                                    formData.total_units >= 18 ? 'fa-graduation-cap' :
                                                                        formData.total_units >= 12 ? 'fa-book-open' : 'fa-book'
                                                                } me-1`}></i>
                                                                {formData.total_units >= 18 ? 'Full Load' :
                                                                    formData.total_units >= 12 ? 'Regular Load' : 'Light Load'}
                                                            </span>
                                                                <small className="text-muted">
                                                                    {formData.total_units >= 18 ? 'Full-time student status' :
                                                                        formData.total_units >= 12 ? 'Regular enrollment load' :
                                                                            'Part-time student status'}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Financial Information Card */}
                                        <div className="card mb-4 border-0 shadow-sm">
                                            <div className="card-header bg-light border-0">
                                                <h6 className="mb-0 text-warning fw-semibold">
                                                    <i className="fas fa-coins me-2"></i>
                                                    Financial Information
                                                </h6>
                                            </div>
                                            <div className="card-body">
                                                {/* Income Input */}
                                                <div className="mb-4">
                                                    <label className="form-label fw-medium d-flex align-items-center">
                                                        Monthly Family Income
                                                        <span className="text-danger ms-1">*</span>
                                                        <i
                                                            className="fas fa-info-circle text-muted ms-2"
                                                            data-bs-toggle="tooltip"
                                                            title="Total combined monthly income of all family members"
                                                        ></i>
                                                    </label>
                                                    <div className="input-group input-group-lg">
                <span className="input-group-text bg-success text-white border-0">
                    <i className="fas fa-peso-sign"></i>
                </span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className={`form-control border-0 shadow-sm ${
                                                                formData.income ? 'is-valid' : ''
                                                            }`}
                                                            value={formData.income}
                                                            onChange={(e) => handleNumberInput(e.target.value, 'income')}
                                                            placeholder="Enter monthly income (e.g. 25000)"
                                                        />
                                                        <span className="input-group-text bg-light">
                    <i className="fas fa-calendar-alt me-1"></i>
                    /month
                </span>
                                                    </div>
                                                    {formData.income && (
                                                        <div className="form-text">
                                                            <div className="d-flex align-items-center mt-2">
                        <span className={`badge me-2 ${
                            formData.income < 20000 ? 'bg-success' :
                                formData.income < 50000 ? 'bg-warning' : 'bg-secondary'
                        }`}>
                            <i className={`fas ${
                                formData.income < 20000 ? 'fa-heart' :
                                    formData.income < 50000 ? 'fa-balance-scale' : 'fa-dollar-sign'
                            } me-1`}></i>
                            {formData.income < 20000 ? 'High Priority' :
                                formData.income < 50000 ? 'Moderate Priority' :
                                    'Standard Priority'}
                        </span>
                                                                <small className="text-muted">
                                                                    {formData.income < 20000 ? 'Low income bracket - excellent scholarship prospects' :
                                                                        formData.income < 50000 ? 'Middle income bracket - good scholarship opportunities' :
                                                                            'Higher income bracket - merit-based scholarships available'}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Parent Occupations Row */}
                                                <div className="row mb-4">
                                                    {/* Father's Occupation */}
                                                    <div className="col-md-6">
                                                        <label className="form-label fw-medium d-flex align-items-center">
                                                            Father's Occupation
                                                            <i
                                                                className="fas fa-info-circle text-muted ms-2"
                                                                data-bs-toggle="tooltip"
                                                                title="Father's current job or profession"
                                                            ></i>
                                                        </label>
                                                        <div className="input-group">
                    <span className="input-group-text bg-primary text-white border-0">
                        <i className="fas fa-male"></i>
                    </span>
                                                            <input
                                                                type="text"
                                                                className="form-control border-0 shadow-sm"
                                                                value={formData.father_occupation || ''}
                                                                onChange={(e) => setFormData(prev => ({
                                                                    ...prev,
                                                                    father_occupation: e.target.value
                                                                }))}
                                                                placeholder="e.g. Farmer, Teacher, Driver"
                                                            />
                                                        </div>
                                                        {/* Special occupation indicators */}
                                                        {formData.father_occupation && (
                                                            <div className="form-text">
                                                                {['farmer', 'fisherfolk', 'fisherman'].some(job =>
                                                                    formData.father_occupation.toLowerCase().includes(job)
                                                                ) && (
                                                                    <small className="text-success">
                                                                        <i className="fas fa-seedling me-1"></i>
                                                                        Agricultural/Fishery background may qualify for special scholarships
                                                                    </small>
                                                                )}
                                                                {['ofw', 'overseas', 'abroad'].some(job =>
                                                                    formData.father_occupation.toLowerCase().includes(job)
                                                                ) && (
                                                                    <small className="text-info">
                                                                        <i className="fas fa-plane me-1"></i>
                                                                        OFW dependent may qualify for special programs
                                                                    </small>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Mother's Occupation */}
                                                    <div className="col-md-6">
                                                        <label className="form-label fw-medium d-flex align-items-center">
                                                            Mother's Occupation
                                                            <i
                                                                className="fas fa-info-circle text-muted ms-2"
                                                                data-bs-toggle="tooltip"
                                                                title="Mother's current job or profession"
                                                            ></i>
                                                        </label>
                                                        <div className="input-group">
                    <span className="input-group-text bg-danger text-white border-0">
                        <i className="fas fa-female"></i>
                    </span>
                                                            <input
                                                                type="text"
                                                                className="form-control border-0 shadow-sm"
                                                                value={formData.mother_occupation || ''}
                                                                onChange={(e) => setFormData(prev => ({
                                                                    ...prev,
                                                                    mother_occupation: e.target.value
                                                                }))}
                                                                placeholder="e.g. Housewife, Vendor, Nurse"
                                                            />
                                                        </div>
                                                        {/* Special occupation indicators */}
                                                        {formData.mother_occupation && (
                                                            <div className="form-text">
                                                                {['farmer', 'fisherfolk', 'fisherman'].some(job =>
                                                                    formData.mother_occupation.toLowerCase().includes(job)
                                                                ) && (
                                                                    <small className="text-success">
                                                                        <i className="fas fa-seedling me-1"></i>
                                                                        Agricultural/Fishery background may qualify for special scholarships
                                                                    </small>
                                                                )}
                                                                {['ofw', 'overseas', 'abroad'].some(job =>
                                                                    formData.mother_occupation.toLowerCase().includes(job)
                                                                ) && (
                                                                    <small className="text-info">
                                                                        <i className="fas fa-plane me-1"></i>
                                                                        OFW dependent may qualify for special programs
                                                                    </small>
                                                                )}
                                                                {['housewife', 'homemaker', 'unemployed'].some(job =>
                                                                    formData.mother_occupation.toLowerCase().includes(job)
                                                                ) && (
                                                                    <small className="text-warning">
                                                                        <i className="fas fa-home me-1"></i>
                                                                        Single income household noted
                                                                    </small>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                  
                                            </div>
                                        </div>

                                        {/* Special Circumstances Card */}
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-header bg-light border-0">
                                                <h6 className="mb-0 text-info fw-semibold">
                                                    <i className="fas fa-star me-2"></i>
                                                    Special Circumstances
                                                    <small className="text-muted ms-2">(Optional - may boost eligibility)</small>
                                                </h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="row g-3">
                                                    <div className="col-md-4">
                                                        <div className={`form-check form-check-lg p-3 rounded text-center h-100 transition-all ${
                                                            formData.is_4ps_member ? 'bg-primary bg-opacity-10 border border-primary' : 'bg-light'
                                                        }`}>
                                                            <input
                                                                className="form-check-input mb-2"
                                                                type="checkbox"
                                                                id="4ps-check"
                                                                checked={formData.is_4ps_member}
                                                                onChange={(e) => handleInputChange('is_4ps_member', e.target.checked)}
                                                            />
                                                            <label className="form-check-label d-block cursor-pointer" htmlFor="4ps-check">
                                                                <i className="fas fa-home text-primary d-block mb-2 fs-4"></i>
                                                                <strong>4Ps Beneficiary</strong>
                                                                <br />
                                                                <small className="text-muted">Pantawid Pamilyang Pilipino Program</small>
                                                                {formData.is_4ps_member && (
                                                                    <div className="mt-2">
                                                                <span className="badge bg-success">
                                                                    <i className="fas fa-check me-1"></i>
                                                                    +10% Bonus
                                                                </span>
                                                                    </div>
                                                                )}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className={`form-check form-check-lg p-3 rounded text-center h-100 transition-all ${
                                                            formData.ip_affiliation ? 'bg-success bg-opacity-10 border border-success' : 'bg-light'
                                                        }`}>
                                                            <input
                                                                className="form-check-input mb-2"
                                                                type="checkbox"
                                                                id="indigenous-check"
                                                                checked={formData.ip_affiliation}
                                                                onChange={(e) => handleInputChange('ip_affiliation', e.target.checked)}
                                                            />
                                                            <label className="form-check-label d-block cursor-pointer" htmlFor="indigenous-check">
                                                                <i className="fas fa-globe-asia text-success d-block mb-2 fs-4"></i>
                                                                <strong>Indigenous People</strong>
                                                                <br />
                                                                <small className="text-muted">Cultural community member</small>
                                                                {formData.ip_affiliation && (
                                                                    <div className="mt-2">
                                                                <span className="badge bg-success">
                                                                    <i className="fas fa-check me-1"></i>
                                                                    +15% Bonus
                                                                </span>
                                                                    </div>
                                                                )}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className={`form-check form-check-lg p-3 rounded text-center h-100 transition-all ${
                                                            formData.is_pwd ? 'bg-warning bg-opacity-10 border border-warning' : 'bg-light'
                                                        }`}>
                                                            <input
                                                                className="form-check-input mb-2"
                                                                type="checkbox"
                                                                id="pwd-check"
                                                                checked={formData.is_pwd}
                                                                onChange={(e) => handleInputChange('is_pwd', e.target.checked)}
                                                            />
                                                            <label className="form-check-label d-block cursor-pointer" htmlFor="pwd-check">
                                                                <i className="fas fa-wheelchair text-warning d-block mb-2 fs-4"></i>
                                                                <strong>Person with Disability</strong>
                                                                <br />
                                                                <small className="text-muted">Certified PWD with valid ID</small>
                                                                {formData.is_pwd && (
                                                                    <div className="mt-2">
                                                                <span className="badge bg-success">
                                                                    <i className="fas fa-check me-1"></i>
                                                                    +20% Bonus
                                                                </span>
                                                                    </div>
                                                                )}
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Enhanced Quick Start Guide */}
                                        <div className="alert alert-primary border-0 mt-4 shadow-sm" role="alert">
                                            <div className="d-flex">
                                                <i className="fas fa-lightbulb me-3 mt-1 fs-5"></i>
                                                <div>
                                                    <h6 className="alert-heading mb-2">
                                                        <i className="fas fa-rocket me-1"></i>
                                                        Quick Start Guide
                                                    </h6>
                                                    <p className="mb-2">
                                                        <strong>Step 1:</strong> Enter your GWA and family income for instant results<br/>
                                                        <strong>Step 2:</strong> Add optional details to unlock more opportunities<br/>
                                                        <strong>Step 3:</strong> Review your matches and apply directly
                                                    </p>
                                                    <small className="text-muted">
                                                        <i className="fas fa-shield-alt me-1"></i>
                                                        Your information is secure and used only for eligibility assessment
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Enhanced Results Section */}
                                <div className="col-lg-6">
                                    <div className="sticky-top" style={{ top: '20px' }}>
                                        <div className="card border-0 shadow-lg h-100">
                                            <div className="card-header bg-gradient-success text-white border-0">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <h5 className="mb-0 fw-bold">
                                                        <i className="fas fa-chart-line me-2"></i>
                                                        Live Eligibility Assessment
                                                    </h5>
                                                    {isCalculating && (
                                                        <div className="d-flex align-items-center">
                                                            <div className="spinner-grow spinner-grow-sm me-2" role="status">
                                                                <span className="visually-hidden">Calculating...</span>
                                                            </div>
                                                            <small>Analyzing...</small>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="card-body">
                                                {error ? (
                                                    <div className="alert alert-danger border-0 shadow-sm">
                                                        <div className="d-flex align-items-center">
                                                            <i className="fas fa-exclamation-triangle me-2 fs-4"></i>
                                                            <div>
                                                                <strong>Assessment Error:</strong> {error}
                                                                <br/>
                                                                <small>Please check your inputs and try again.</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : eligibilityResult ? (
                                                    <>
                                                        {/* Enhanced Circular Progress Meter */}
                                                        <div className="text-center mb-4">
                                                            <div className="position-relative d-inline-block">
                                                                <div
                                                                    className="circular-progress mx-auto mb-3"
                                                                    style={{
                                                                        width: '160px',
                                                                        height: '160px',
                                                                        background: `conic-gradient(
                                                                    ${eligibilityResult.score >= 80 ? '#28a745' :
                                                                            eligibilityResult.score >= 60 ? '#ffc107' :
                                                                                eligibilityResult.score >= 40 ? '#fd7e14' : '#dc3545'
                                                                        } ${eligibilityResult.score * 3.6}deg, 
                                                                    #e9ecef 0deg
                                                                )`,
                                                                        borderRadius: '50%',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        position: 'relative',
                                                                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                                                                    }}
                                                                >
                                                                    <div
                                                                        className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow"
                                                                        style={{ width: '120px', height: '120px' }}
                                                                    >
                                                                        <div className="text-center">
                                                                            <div className="display-5 fw-bold text-primary">
                                                                                {eligibilityResult.score}%
                                                                            </div>
                                                                            <small className="text-muted fw-medium">Eligibility Score</small>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Enhanced Dynamic Status Badge */}
                                                            <div className="mb-3">
                                                        <span className={`badge fs-6 px-4 py-2 rounded-pill shadow-sm animate__animated animate__pulse ${
                                                            eligibilityResult.score >= 80 ? 'bg-success' :
                                                                eligibilityResult.score >= 60 ? 'bg-warning' :
                                                                    eligibilityResult.score >= 40 ? 'bg-info' : 'bg-danger'
                                                        }`}>
                                                            <i className={`fas ${
                                                                eligibilityResult.score >= 80 ? 'fa-check-circle' :
                                                                    eligibilityResult.score >= 60 ? 'fa-exclamation-circle' :
                                                                        eligibilityResult.score >= 40 ? 'fa-info-circle' : 'fa-times-circle'
                                                            } me-2`}></i>
                                                            {eligibilityResult.score >= 80 ? 'Highly Eligible' :
                                                                eligibilityResult.score >= 60 ? 'Moderately Eligible' :
                                                                    eligibilityResult.score >= 40 ? 'Somewhat Eligible' : 'Not Eligible'}
                                                        </span>
                                                            </div>

                                                            {eligibilityResult.response_time_ms && (
                                                                <div className="bg-light rounded-pill px-3 py-1 d-inline-block">
                                                                    <small className="text-muted">
                                                                        <i className="fas fa-bolt me-1 text-warning"></i>
                                                                        Processed in {eligibilityResult.response_time_ms}ms
                                                                    </small>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Enhanced Score Breakdown */}
                                                        {eligibilityResult.original_score !== eligibilityResult.score && (
                                                            <div className="card bg-light border-0 mb-4 shadow-sm">
                                                                <div className="card-body">
                                                                    <h6 className="card-title mb-3">
                                                                        <i className="fas fa-calculator me-2"></i>
                                                                        Score Breakdown
                                                                    </h6>
                                                                    <div className="row g-3">
                                                                        <div className="col-4">
                                                                            <div className="bg-white rounded p-3 shadow-sm text-center">
                                                                                <i className="fas fa-chart-bar text-primary mb-2"></i>
                                                                                <div className="fw-bold text-primary fs-5">{eligibilityResult.original_score}%</div>
                                                                                <small className="text-muted">Base Score</small>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-4">
                                                                            <div className="bg-white rounded p-3 shadow-sm text-center">
                                                                                <i className="fas fa-plus-circle text-success mb-2"></i>
                                                                                <div className="fw-bold text-success fs-5">+{eligibilityResult.bonus_points}%</div>
                                                                                <small className="text-muted">Bonus Points</small>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-4">
                                                                            <div className="bg-white rounded p-3 shadow-sm text-center">
                                                                                <i className="fas fa-trophy text-warning mb-2"></i>
                                                                                <div className="fw-bold text-primary fs-5">{eligibilityResult.score}%</div>
                                                                                <small className="text-muted">Final Score</small>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Enhanced Scholarship Recommendations */}
                                                        {eligibilityResult.recommended_scholarships && eligibilityResult.recommended_scholarships.length > 0 && (
                                                            <div className="mb-4">
                                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                                    <h6 className="mb-0 fw-bold">
                                                                        <i className="fas fa-trophy me-2 text-warning"></i>
                                                                        Your Scholarship Matches
                                                                    </h6>
                                                                    <span className="badge bg-primary rounded-pill fs-6">
                                                                {eligibilityResult.recommended_scholarships.length} {eligibilityResult.recommended_scholarships.length === 1 ? 'match' : 'matches'}
                                                            </span>
                                                                </div>

                                                                <div className="row g-3">
                                                                    {eligibilityResult.recommended_scholarships.map((scholarship: Scholarship, index: number) => (
                                                                        <div key={index} className="col-12">
                                                                            <div className="card border-0 shadow-sm h-100 hover-card">
                                                                                <div className="card-body p-3">
                                                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                                                        <div className="flex-grow-1">
                                                                                            <div className="d-flex align-items-center mb-2">
                                                                                                <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-2">
                                                                                                    <i className="fas fa-award text-warning"></i>
                                                                                                </div>
                                                                                                <h6 className="mb-0 text-primary fw-bold">
                                                                                                    {scholarship.name}
                                                                                                </h6>
                                                                                            </div>
                                                                                            <p className="text-muted small mb-3">
                                                                                                {scholarship.description}
                                                                                            </p>
                                                                                            <div className="d-flex flex-wrap gap-2">
                                                                                        <span className="badge bg-success shadow-sm">
                                                                                            <i className="fas fa-peso-sign me-1"></i>
                                                                                            {scholarship.amount.toLocaleString()}
                                                                                        </span>

                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="text-center ms-3">
                                                                                            <div className="bg-light rounded-circle p-3 shadow-sm" style={{width: '60px', height: '60px'}}>
                                                                                                <div className="d-flex align-items-center justify-content-center h-100">
                                                                                                    <div className="text-center">
                                                                                                        <div className="fw-bold text-primary small">
                                                                                                            {scholarship.score}%
                                                                                                        </div>
                                                                                                        <small className="text-muted" style={{fontSize: '0.7rem'}}>Match</small>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Enhanced Improvement Tips */}
                                                        {eligibilityResult.tips && eligibilityResult.tips.length > 0 && (
                                                            <div className="mb-4">
                                                                <div className="accordion accordion-flush" id="tipsAccordion">
                                                                    <div className="accordion-item border-0 shadow-sm rounded">
                                                                        <h6 className="accordion-header">
                                                                            <button
                                                                                className="accordion-button collapsed bg-light rounded fw-medium"
                                                                                type="button"
                                                                                data-bs-toggle="collapse"
                                                                                data-bs-target="#tipsCollapse"
                                                                            >
                                                                                <i className="fas fa-lightbulb me-2 text-warning"></i>
                                                                                <strong>Tips to Improve Your Score</strong>
                                                                                <span className="badge bg-info ms-2">{eligibilityResult.tips.length}</span>
                                                                            </button>
                                                                        </h6>
                                                                        <div
                                                                            id="tipsCollapse"
                                                                            className="accordion-collapse collapse"
                                                                            data-bs-parent="#tipsAccordion"
                                                                        >
                                                                            <div className="accordion-body">
                                                                                {eligibilityResult.tips.map((tip: string, index: number) => (
                                                                                    <div key={index} className="d-flex mb-3 p-2 bg-light rounded">
                                                                                        <div className="bg-success rounded-circle p-1 me-3 mt-1" style={{width: '20px', height: '20px'}}>
                                                                                            <i className="fas fa-check text-white" style={{fontSize: '0.7rem'}}></i>
                                                                                        </div>
                                                                                        <small className="flex-grow-1">{tip}</small>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Enhanced Action Buttons */}
                                                        <div className="d-grid gap-3">
                                                            <Link
                                                                to="/applicant/apply"
                                                                className="btn btn-primary btn-lg shadow-sm fw-bold"
                                                            >
                                                                <i className="fas fa-rocket me-2"></i>
                                                                Apply for Scholarships Now
                                                            </Link>
                                                            <div className="row g-2">
                                                                <div className="col-4">
                                                                    <button
                                                                        className="btn btn-outline-secondary w-100"
                                                                        onClick={handleReset}
                                                                    >
                                                                        <i className="fas fa-redo me-1"></i>
                                                                        Reset
                                                                    </button>
                                                                </div>
                                                                <div className="col-4">
                                                                    <button className="btn btn-outline-primary w-100">
                                                                        <i className="fas fa-bookmark me-1"></i>
                                                                        Save
                                                                    </button>
                                                                </div>
                                                                <div className="col-4">
                                                                    <button className="btn btn-outline-info w-100">
                                                                        <i className="fas fa-share-alt me-1"></i>
                                                                        Share
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    /* Enhanced Empty State */
                                                    <div className="text-center py-5">
                                                        <div className="mb-4">
                                                            <div
                                                                className="bg-light rounded-circle mx-auto d-flex align-items-center justify-content-center shadow-sm"
                                                                style={{width: '120px', height: '120px'}}
                                                            >
                                                                <i className="fas fa-calculator display-4 text-muted"></i>
                                                            </div>
                                                        </div>
                                                        <h5 className="text-dark mb-3">Ready to Discover Your Opportunities?</h5>
                                                        <p className="text-muted mb-4">
                                                            Enter your <strong>GWA</strong> and <strong>family income</strong> to unlock
                                                            your personalized scholarship recommendations.
                                                        </p>
                                                        <div className="row g-3">
                                                            <div className="col-6">
                                                                <div className="bg-light rounded p-3 shadow-sm">
                                                                    <i className="fas fa-bolt text-warning mb-2 d-block fs-3"></i>
                                                                    <small className="fw-bold">Instant Results</small>
                                                                    <br/>
                                                                    <small className="text-muted">Real-time assessment</small>
                                                                </div>
                                                            </div>
                                                            <div className="col-6">
                                                                <div className="bg-light rounded p-3 shadow-sm">
                                                                    <i className="fas fa-shield-alt text-success mb-2 d-block fs-3"></i>
                                                                    <small className="fw-bold">100% Secure</small>
                                                                    <br/>
                                                                    <small className="text-muted">Data protected</small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4">
                                                            <div className="bg-primary bg-opacity-10 rounded p-3">
                                                                <small className="text-primary">
                                                                    <i className="fas fa-magic me-1"></i>
                                                                    <strong>Powered by AI:</strong> Our fuzzy logic system analyzes multiple factors for the most accurate eligibility assessment.
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .hover-card {
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .hover-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 35px rgba(0,0,0,0.15) !important;
        }
        .circular-progress {
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate__animated.animate__pulse {
            animation-duration: 2s;
            animation-iteration-count: infinite;
        }
        .form-control:focus, .form-select:focus {
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
            border-color: #86b7fe;
        }
        .is-warning {
            border-color: #ffc107;
            background-color: #fff3cd;
        }
        .bg-gradient-primary {
            background: linear-gradient(135deg, #0d6efd 0%, #0056b3 100%);
        }
        .bg-gradient-success {
            background: linear-gradient(135deg, #198754 0%, #146c43 100%);
        }
        .transition-all {
            transition: all 0.3s ease;
        }
        .cursor-pointer {
            cursor: pointer;
        }
        .form-check-input:checked ~ .form-check-label {
            color: #0d6efd;
        }
        .badge {
            font-weight: 500;
        }
        @media (max-width: 768px) {
            .sticky-top {
                position: relative !important;
                top: auto !important;
            }
        }
    `}</style>
        </div>
    );
};

export default Prequalify;
