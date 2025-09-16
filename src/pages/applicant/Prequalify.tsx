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
    const { token } = useAuth();

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
        <>
            <div className="container-fluid py-4">
                <div className="row">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm rounded-3">
                            {/* Header */}
                            <div className="card-header border-0 rounded-top-3" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)' }}>
                                <div className="d-flex justify-content-between align-items-center py-2">
                                    <div>
                                        <h4 className="mb-1 fw-bold text-white d-flex align-items-center">
                                            <i className="fas fa-graduation-cap me-2"></i>
                                            iScholar Prequalification
                                        </h4>
                                        <p className="mb-0 text-white-50">Discover scholarship eligibility in real time</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body p-4">
                                <div className="row g-4">
                                    {/* Left Column: Form */}
                                    <div className="col-lg-6">
                                        <div className="h-100">
                                            <h5 className="mb-4 text-primary fw-semibold d-flex align-items-center">
                                                <i className="fas fa-clipboard-list me-2"></i>
                                                Your Information
                                            </h5>

                                            {/* Academic */}
                                            <div className="card mb-4 border-0 shadow-sm">
                                                <div className="card-header bg-light border-0">
                                                    <h6 className="mb-0 text-success fw-semibold d-flex align-items-center">
                                                        <i className="fas fa-book-open me-2"></i>
                                                        Academic Details
                                                    </h6>
                                                </div>
                                                <div className="card-body">
                                                    {/* GWA */}
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
                                                                className={`form-control border-0 shadow-sm`}
                                                                value={formData.gwa}
                                                                onChange={(e) => handleNumberInput(e.target.value, 'gwa')}
                                                                placeholder="Enter GWA (e.g. 1.75)"
                                                                aria-describedby="gwaHelp"
                                                            />
                                                        </div>
                                                        <div id="gwaHelp" className="form-text">
                                                            Scale: 1.00 (Excellent) to 5.00 (Failed)
                                                        </div>
                                                    </div>

                                                    {/* Year level */}
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

                                                    {/* Units */}
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
                                                                className="form-control border-0 shadow-sm"
                                                                value={formData.total_units}
                                                                onChange={(e) => handleNumberInput(e.target.value, 'total_units')}
                                                                placeholder="Enter total units (e.g. 21)"
                                                                aria-describedby="unitsHelp"
                                                            />
                                                            <span className="input-group-text bg-light">
                              <i className="fas fa-book me-1"></i>
                              units
                            </span>
                                                        </div>
                                                        <div id="unitsHelp" className="form-text">
                                                            Typical full load is 18 units or more
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Financial */}
                                            <div className="card mb-4 border-0 shadow-sm">
                                                <div className="card-header bg-light border-0">
                                                    <h6 className="mb-0 text-warning fw-semibold d-flex align-items-center">
                                                        <i className="fas fa-coins me-2"></i>
                                                        Financial Information
                                                    </h6>
                                                </div>
                                                <div className="card-body">
                                                    {/* Income */}
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
                                                                className="form-control border-0 shadow-sm"
                                                                value={formData.income}
                                                                onChange={(e) => handleNumberInput(e.target.value, 'income')}
                                                                placeholder="Enter monthly income (e.g. 25000)"
                                                                aria-describedby="incomeHelp"
                                                            />
                                                            <span className="input-group-text bg-light">
                              <i className="fas fa-calendar-alt me-1"></i>
                              /month
                            </span>
                                                        </div>
                                                        <div id="incomeHelp" className="form-text">
                                                            Provide a rough estimate if unsure
                                                        </div>
                                                    </div>

                                                    {/* Parents’ occupations */}
                                                    <div className="row g-3">
                                                        <div className="col-md-6">
                                                            <label className="form-label fw-medium d-flex align-items-center">
                                                                Father's Occupation
                                                                <i className="fas fa-info-circle text-muted ms-2" data-bs-toggle="tooltip" title="Father's current job or profession"></i>
                                                            </label>
                                                            <div className="input-group">
                              <span className="input-group-text bg-primary text-white border-0">
                                <i className="fas fa-person"></i>
                              </span>
                                                                <input
                                                                    type="text"
                                                                    className="form-control border-0 shadow-sm"
                                                                    value={formData.father_occupation || ''}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, father_occupation: e.target.value }))}
                                                                    placeholder="e.g. Farmer, Teacher, Driver"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label fw-medium d-flex align-items-center">
                                                                Mother's Occupation
                                                                <i className="fas fa-info-circle text-muted ms-2" data-bs-toggle="tooltip" title="Mother's current job or profession"></i>
                                                            </label>
                                                            <div className="input-group">
                              <span className="input-group-text bg-danger text-white border-0">
                                <i className="fas fa-person-dress"></i>
                              </span>
                                                                <input
                                                                    type="text"
                                                                    className="form-control border-0 shadow-sm"
                                                                    value={formData.mother_occupation || ''}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, mother_occupation: e.target.value }))}
                                                                    placeholder="e.g. Housewife, Vendor, Nurse"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Special circumstances */}
                                            <div className="card border-0 shadow-sm">
                                                <div className="card-header bg-light border-0">
                                                    <h6 className="mb-0 text-info fw-semibold d-flex align-items-center">
                                                        <i className="fas fa-star me-2"></i>
                                                        Special Circumstances
                                                        <small className="text-muted ms-2">(Optional)</small>
                                                    </h6>
                                                </div>
                                                <div className="card-body">
                                                    <div className="row g-3">
                                                        <div className="col-md-4">
                                                            <div className="p-3 rounded text-center bg-light">
                                                                <input
                                                                    className="form-check-input mb-2"
                                                                    type="checkbox"
                                                                    id="fourps"
                                                                    checked={formData.is_4ps_member}
                                                                    onChange={(e) => handleInputChange('is_4ps_member', e.target.checked)}
                                                                />
                                                                <label className="form-check-label d-block" htmlFor="fourps">
                                                                    <i className="fas fa-home text-primary d-block mb-2 fs-4"></i>
                                                                    <strong>4Ps Beneficiary</strong>
                                                                    <br />
                                                                    <small className="text-muted">Pantawid Pamilyang Pilipino Program</small>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="p-3 rounded text-center bg-light">
                                                                <input
                                                                    className="form-check-input mb-2"
                                                                    type="checkbox"
                                                                    id="ip"
                                                                    checked={formData.ip_affiliation}
                                                                    onChange={(e) => handleInputChange('ip_affiliation', e.target.checked)}
                                                                />
                                                                <label className="form-check-label d-block" htmlFor="ip">
                                                                    <i className="fas fa-globe-asia text-success d-block mb-2 fs-4"></i>
                                                                    <strong>Indigenous People</strong>
                                                                    <br />
                                                                    <small className="text-muted">Cultural community member</small>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="p-3 rounded text-center bg-light">
                                                                <input
                                                                    className="form-check-input mb-2"
                                                                    type="checkbox"
                                                                    id="pwd"
                                                                    checked={formData.is_pwd}
                                                                    onChange={(e) => handleInputChange('is_pwd', e.target.checked)}
                                                                />
                                                                <label className="form-check-label d-block" htmlFor="pwd">
                                                                    <i className="fas fa-wheelchair text-warning d-block mb-2 fs-4"></i>
                                                                    <strong>Person with Disability</strong>
                                                                    <br />
                                                                    <small className="text-muted">Certified PWD with valid ID</small>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>


                                        </div>
                                    </div>

                                    {/* Right Column: Results */}
                                    <div className="col-lg-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-header border-0" style={{ background: 'linear-gradient(135deg, #198754 0%, #146c43 100%)' }}>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <h5 className="mb-0 fw-bold text-white d-flex align-items-center">
                                                        <i className="fas fa-chart-line me-2"></i>
                                                        Live Eligibility Assessment
                                                    </h5>
                                                    {isCalculating && (
                                                        <div className="d-flex align-items-center text-white-75">
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
                                                                <br />
                                                                <small>Please check inputs and try again.</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : eligibilityResult ? (
                                                    <>
                                                        {/* Circular meter simplified (no pulsing/extra indicators) */}
                                                        <div className="text-center mb-4">
                                                            <div className="position-relative d-inline-block">
                                                                <div
                                                                    className="mx-auto mb-3"
                                                                    style={{
                                                                        width: '160px',
                                                                        height: '160px',
                                                                        background: `conic-gradient(${
                                                                            eligibilityResult.score >= 80 ? '#28a745'
                                                                                : eligibilityResult.score >= 60 ? '#ffc107'
                                                                                    : eligibilityResult.score >= 40 ? '#fd7e14'
                                                                                        : '#dc3545'
                                                                        } ${eligibilityResult.score * 3.6}deg, #e9ecef 0deg)`,
                                                                        borderRadius: '50%',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        position: 'relative',
                                                                        boxShadow: 'inset 0 0 0 10px #fff, 0 6px 24px rgba(0,0,0,0.08)',
                                                                    }}
                                                                    aria-label="Eligibility score"
                                                                >
                                                                    <div
                                                                        className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                                                                        style={{ width: '120px', height: '120px' }}
                                                                    >
                                                                        <div className="text-center">
                                                                            <div className="display-6 fw-bold text-primary">
                                                                                {eligibilityResult.score}%
                                                                            </div>
                                                                            <small className="text-muted fw-medium">Eligibility Score</small>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Status badge simplified */}
                                                            <div className="mt-2">
                              <span className={`badge fs-6 px-3 py-2 rounded-pill shadow-sm ${
                                  eligibilityResult.score >= 80 ? 'bg-success'
                                      : eligibilityResult.score >= 60 ? 'bg-warning'
                                          : eligibilityResult.score >= 40 ? 'bg-info'
                                              : 'bg-danger'
                              }`}>
                                {eligibilityResult.score >= 80 ? 'Highly Eligible'
                                    : eligibilityResult.score >= 60 ? 'Moderately Eligible'
                                        : eligibilityResult.score >= 40 ? 'Somewhat Eligible'
                                            : 'Not Eligible'}
                              </span>
                                                            </div>
                                                        </div>

                                                        {/* Recommended scholarships */}
                                                        {eligibilityResult.recommended_scholarships && eligibilityResult.recommended_scholarships.length > 0 && (
                                                            <div className="mb-4">
                                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                                    <h6 className="mb-0 fw-bold d-flex align-items-center">
                                                                        <i className="fas fa-trophy me-2 text-warning"></i>
                                                                        Your Scholarship Matches
                                                                    </h6>
                                                                    <span className="badge bg-primary rounded-pill">
                                  {eligibilityResult.recommended_scholarships.length} {eligibilityResult.recommended_scholarships.length === 1 ? 'match' : 'matches'}
                                </span>
                                                                </div>

                                                                <div className="row g-3">
                                                                    {eligibilityResult.recommended_scholarships.map((scholarship: Scholarship, index: number) => (
                                                                        <div key={index} className="col-12">
                                                                            <div className="card border-0 shadow-sm h-100">
                                                                                <div className="card-body p-3">
                                                                                    <div className="d-flex justify-content-between align-items-start">
                                                                                        <div className="flex-grow-1 pe-3">
                                                                                            <div className="d-flex align-items-center mb-1">
                                                                                                <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-2">
                                                                                                    <i className="fas fa-award text-warning"></i>
                                                                                                </div>
                                                                                                <h6 className="mb-0 text-primary fw-bold">
                                                                                                    {scholarship.name}
                                                                                                </h6>
                                                                                            </div>
                                                                                            <p className="text-muted small mb-2">
                                                                                                {scholarship.description}
                                                                                            </p>
                                                                                            <div className="d-flex gap-2">
                                              <span className="badge bg-success">
                                                <i className="fas fa-peso-sign me-1"></i>
                                                  {scholarship.amount.toLocaleString()}
                                              </span>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="text-center">
                                                                                            <div className="bg-light rounded-circle p-3" style={{ width: '60px', height: '60px' }}>
                                                                                                <div className="d-flex align-items-center justify-content-center h-100">
                                                                                                    <div className="text-center">
                                                                                                        <div className="fw-bold text-primary small">
                                                                                                            {scholarship.score}%
                                                                                                        </div>
                                                                                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>Match</small>
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

                                                        {/* Actions */}
                                                        <div className="d-grid gap-3">
                                                            <Link to="/applicant/apply" className="btn btn-primary btn-lg fw-bold">
                                                                <i className="fas fa-rocket me-2"></i>
                                                                Apply for Scholarships Now
                                                            </Link>
                                                            <div className="row g-2">
                                                                <div className="col-4">
                                                                    <button className="btn btn-outline-secondary w-100" onClick={handleReset}>
                                                                        <i className="fas fa-rotate-left me-1"></i>
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
                                                    // Empty state
                                                    <div className="text-center py-5">
                                                        <div className="mb-4">
                                                            <div className="bg-light rounded-circle mx-auto d-flex align-items-center justify-content-center shadow-sm" style={{ width: '120px', height: '120px' }}>
                                                                <i className="fas fa-calculator display-6 text-muted"></i>
                                                            </div>
                                                        </div>
                                                        <h5 className="text-dark mb-2">Ready to Discover Opportunities?</h5>
                                                        <p className="text-muted mb-4">
                                                            Enter GWA and family income to unlock personalized scholarship recommendations.
                                                        </p>
                                                        <div className="row g-3">
                                                            <div className="col-6">
                                                                <div className="bg-light rounded p-3 shadow-sm">
                                                                    <i className="fas fa-bolt text-warning mb-2 d-block fs-5"></i>
                                                                    <small className="fw-bold d-block">Instant Results</small>
                                                                    <small className="text-muted">Real-time assessment</small>
                                                                </div>
                                                            </div>
                                                            <div className="col-6">
                                                                <div className="bg-light rounded p-3 shadow-sm">
                                                                    <i className="fas fa-shield-alt text-success mb-2 d-block fs-5"></i>
                                                                    <small className="fw-bold d-block">Secure</small>
                                                                    <small className="text-muted">Your data is protected</small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4">
                                                            <div className="bg-primary bg-opacity-10 rounded p-3">
                                                                <small className="text-primary d-flex align-items-center">
                                                                    <i className="fas fa-magic me-2"></i>
                                                                    <strong className="me-1">Powered by AI</strong>
                                                                    Fuzzy logic evaluates multiple factors for accurate assessment.
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* End Right Column */}
                                    <div className="col-12">
                                        {/* Quick Start */}
                                        <div className="alert alert-primary border-0 mt-4 shadow-sm" role="alert">
                                            <div className="d-flex">
                                                <i className="fas fa-lightbulb me-3 mt-1 fs-5"></i>
                                                <div>
                                                    <h6 className="alert-heading mb-2 d-flex align-items-center">
                                                        <i className="fas fa-rocket me-2"></i>
                                                        Quick Start Guide
                                                    </h6>
                                                    <p className="mb-2">
                                                        <strong>Step 1:</strong> Enter GWA and family income for instant results<br />
                                                        <strong>Step 2:</strong> Add optional details to refine matches<br />
                                                        <strong>Step 3:</strong> Review and apply directly
                                                    </p>
                                                    <small className="text-muted d-flex align-items-center">
                                                        <i className="fas fa-shield-alt me-1"></i>
                                                        Information is used only for eligibility assessment
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Minimal, production polish */}
                <style>{`
        .form-control:focus, .form-select:focus {
          box-shadow: 0 0 0 0.25rem rgba(13,110,253,0.15);
          border-color: #86b7fe;
        }
        .card { border-radius: .75rem; }
        .card-header { border-top-left-radius: .75rem; border-top-right-radius: .75rem; }
        .btn { border-radius: .6rem; }
        .hover-card { transition: transform .2s ease, box-shadow .2s ease; }
        .hover-card:hover { transform: translateY(-2px); box-shadow: 0 8px 26px rgba(0,0,0,0.12) !important; }
        @media (max-width: 768px) {
          .sticky-top { position: relative !important; top: auto !important; }
        }
      `}</style>
            </div>
        </>
    );
};

export default Prequalify;
