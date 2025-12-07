import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext'; // Removed .tsx extension for cleaner import
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config'; // Removed .ts extension for cleaner import

// --- Interfaces (Kept identical) ---
interface FormData {
    gwa: number;
    income: number;
    year_level: string;
    is_4ps_member: boolean;
    ip_affiliation: boolean;
    is_pwd: boolean;
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
    reasons: [];
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
    const { token, isAuthenticated } = useAuth();

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
        total_units: 0,
    };

    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
    const [isCalculating, setIsCalculating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // --- Logic Effects (Kept identical) ---
    useEffect(() => {
        const calculateEligibility = async (): Promise<void> => {
            if (!formData.gwa || !formData.income) return;

            setIsCalculating(true);
            setError(null);

            try {
                const response = await fetch(`${API_BASE_URL}/api/prequalify/calculate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const result: EligibilityResult = await response.json();
                if (result.success) setEligibilityResult(result);
                else setError(result.error || 'Calculation failed');
            } catch (err) {
                // Only show error if we have data entered, otherwise it's annoying on load
                if (formData.gwa > 0) {
                    setError('Network error. Please check your connection.');
                }
                console.error('Prequalification error:', err);
            } finally {
                setIsCalculating(false);
            }
        };

        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = setTimeout(calculateEligibility, 800);

        return () => {
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        };
    }, [formData, token]);

    const handleInputChange = <K extends keyof FormData>(field: string, value: FormData[K]): void => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleReset = (): void => {
        setFormData(initialFormData);
        setEligibilityResult(null);
        setError(null);
    };

    const handleNumberInput = (value: string, field: 'gwa' | 'income' | 'total_units'): void => {
        handleInputChange(field, value as unknown as any);
    };

    // Helper to determine score color
    const getScoreColor = (score: number) => {
        if (score >= 80) return '#198754'; // Success
        if (score >= 60) return '#ffc107'; // Warning
        if (score >= 40) return '#fd7e14'; // Orange
        return '#dc3545'; // Danger
    };

    return (
        <div className="min-vh-100 bg-light position-relative" style={{ overflowX: 'hidden' }}>

            <div
                className="container position-relative py-5"
                style={{
                    zIndex: 2,
                    marginTop: !isAuthenticated ? '5rem' : undefined
                }}
            >
                <div className="row g-4 justify-content-center">

                    {/* --- LEFT COLUMN: INPUT FORM --- */}
                    <div className="col-lg-7 col-xl-8">
                        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                            <div className="card-body p-4 p-md-5">
                                <div className="mb-5">
                                    <h2 className="fw-bold text-dark mb-2">Check Eligibility</h2>
                                    <p className="text-muted">Enter your academic and financial details to get an instant scholarship assessment.</p>
                                </div>

                                {/* Section 1: Academic */}
                                <div className="mb-5">
                                    <h6 className="text-primary fw-bold text-uppercase small mb-4 d-flex align-items-center">
                                        <span className="bg-primary rounded-circle d-inline-block me-2" style={{width: '8px', height: '8px'}}></span>
                                        Academic Profile
                                    </h6>

                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="1.00"
                                                    max="5.00"
                                                    className="form-control bg-light border-0"
                                                    id="floatingGwa"
                                                    placeholder="GWA"
                                                    value={formData.gwa || ''}
                                                    onChange={(e) => handleNumberInput(e.target.value, 'gwa')}
                                                />
                                                <label htmlFor="floatingGwa">General Weighted Avg. (GWA)</label>
                                            </div>
                                            <div className="form-text text-muted small ms-1"><i className="fas fa-info-circle me-1"></i>Scale: 1.00 (High) - 5.00 (Low)</div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="number"
                                                    className="form-control bg-light border-0"
                                                    id="floatingUnits"
                                                    placeholder="Units"
                                                    value={formData.total_units || ''}
                                                    onChange={(e) => handleNumberInput(e.target.value, 'total_units')}
                                                />
                                                <label htmlFor="floatingUnits">Total Units Enrolled</label>
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <div className="form-floating">
                                                <select
                                                    className="form-select bg-light border-0"
                                                    id="floatingYear"
                                                    value={formData.year_level}
                                                    onChange={(e) => handleInputChange('year_level', e.target.value)}
                                                >
                                                    <option value="">Select Year Level</option>
                                                    <option value="1st Year">1st Year</option>
                                                    <option value="2nd Year">2nd Year</option>
                                                    <option value="3rd Year">3rd Year</option>
                                                    <option value="4th Year">4th Year</option>
                                                </select>
                                                <label htmlFor="floatingYear">Current Year Level</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Financial */}
                                <div className="mb-5">
                                    <h6 className="text-success fw-bold text-uppercase small mb-4 d-flex align-items-center">
                                        <span className="bg-success rounded-circle d-inline-block me-2" style={{width: '8px', height: '8px'}}></span>
                                        Financial Background
                                    </h6>

                                    <div className="row g-4">
                                        <div className="col-12">
                                            <div className="input-group">
                                                <span className="input-group-text border-0 bg-success text-white px-3">₱</span>
                                                <div className="form-floating flex-grow-1">
                                                    <input
                                                        type="number"
                                                        className="form-control bg-light border-0"
                                                        id="floatingIncome"
                                                        placeholder="Income"
                                                        value={formData.income || ''}
                                                        onChange={(e) => handleNumberInput(e.target.value, 'income')}
                                                    />
                                                    <label htmlFor="floatingIncome">Monthly Family Income</label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control bg-light border-0"
                                                    id="floatingFather"
                                                    placeholder="Father"
                                                    value={formData.father_occupation}
                                                    onChange={(e) => handleInputChange('father_occupation', e.target.value)}
                                                />
                                                <label htmlFor="floatingFather">Father's Occupation</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control bg-light border-0"
                                                    id="floatingMother"
                                                    placeholder="Mother"
                                                    value={formData.mother_occupation}
                                                    onChange={(e) => handleInputChange('mother_occupation', e.target.value)}
                                                />
                                                <label htmlFor="floatingMother">Mother's Occupation</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Special Circumstances (Tiles) */}
                                <div className="mb-2">
                                    <h6 className="text-info fw-bold text-uppercase small mb-4 d-flex align-items-center">
                                        <span className="bg-info rounded-circle d-inline-block me-2" style={{width: '8px', height: '8px'}}></span>
                                        Special Circumstances
                                    </h6>

                                    <div className="row g-3">
                                        {/* 4Ps Tile */}
                                        <div className="col-md-4">
                                            <div
                                                className={`p-3 rounded-4 cursor-pointer text-center h-100 border transition-all ${formData.is_4ps_member ? 'bg-primary-subtle border-primary text-primary' : 'bg-light border-transparent text-muted'}`}
                                                onClick={() => handleInputChange('is_4ps_member', !formData.is_4ps_member)}
                                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                <div className="mb-2 fs-3"><i className="fas fa-home"></i></div>
                                                <div className="fw-bold small">4Ps Beneficiary</div>
                                                <div className="small opacity-75" style={{fontSize: '0.7rem'}}>Pantawid Pamilya Program</div>
                                            </div>
                                        </div>

                                        {/* IP Tile */}
                                        <div className="col-md-4">
                                            <div
                                                className={`p-3 rounded-4 cursor-pointer text-center h-100 border transition-all ${formData.ip_affiliation ? 'bg-success-subtle border-success text-success' : 'bg-light border-transparent text-muted'}`}
                                                onClick={() => handleInputChange('ip_affiliation', !formData.ip_affiliation)}
                                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                <div className="mb-2 fs-3"><i className="fas fa-globe-asia"></i></div>
                                                <div className="fw-bold small">Indigenous People</div>
                                                <div className="small opacity-75" style={{fontSize: '0.7rem'}}>Cultural Community</div>
                                            </div>
                                        </div>

                                        {/* PWD Tile */}
                                        <div className="col-md-4">
                                            <div
                                                className={`p-3 rounded-4 cursor-pointer text-center h-100 border transition-all ${formData.is_pwd ? 'bg-warning-subtle border-warning text-warning-emphasis' : 'bg-light border-transparent text-muted'}`}
                                                onClick={() => handleInputChange('is_pwd', !formData.is_pwd)}
                                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                <div className="mb-2 fs-3"><i className="fas fa-wheelchair"></i></div>
                                                <div className="fw-bold small">PWD</div>
                                                <div className="small opacity-75" style={{fontSize: '0.7rem'}}>Person w/ Disability</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: RESULTS (Sticky) --- */}
                    <div className="col-lg-5 col-xl-4">
                        <div className="sticky-top" style={{ top: '2rem', zIndex: 5 }}>
                            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                                {/* Result Header */}
                                <div className="card-header border-0 py-3 bg-white d-flex justify-content-between align-items-center">
                                    <h6 className="fw-bold mb-0 text-dark"><i className="fas fa-chart-pie me-2 text-primary"></i>Assessment</h6>
                                    {isCalculating && (
                                        <span className="badge bg-light text-primary rounded-pill fw-normal">
                                            <i className="fas fa-sync fa-spin me-1"></i> Analyzing
                                        </span>
                                    )}
                                </div>

                                <div className="card-body p-4 bg-light bg-opacity-50">
                                    {error ? (
                                        <div className="alert alert-danger rounded-3 border-0 shadow-sm mb-0">
                                            <i className="fas fa-exclamation-circle me-2"></i> {error}
                                        </div>
                                    ) : eligibilityResult ? (
                                        <>
                                            {/* Score Dial */}
                                            <div className="text-center mb-4 pt-2">
                                                <div className="position-relative d-inline-flex justify-content-center align-items-center">
                                                    {/* Conic Gradient Chart */}
                                                    <div style={{
                                                        width: '180px',
                                                        height: '180px',
                                                        borderRadius: '50%',
                                                        background: `conic-gradient(${getScoreColor(eligibilityResult.score)} ${eligibilityResult.score * 3.6}deg, #e9ecef 0deg)`,
                                                        position: 'relative',
                                                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)'
                                                    }}></div>

                                                    {/* Inner Circle */}
                                                    <div className="bg-white rounded-circle position-absolute d-flex flex-column align-items-center justify-content-center" style={{ width: '150px', height: '150px' }}>
                                                        <span className="display-4 fw-bold" style={{ color: getScoreColor(eligibilityResult.score) }}>
                                                            {eligibilityResult.score}%
                                                        </span>
                                                        <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Eligibility</span>
                                                    </div>
                                                </div>

                                                <div className="mt-3">
                                                    <h5 className="fw-bold mb-1" style={{ color: getScoreColor(eligibilityResult.score) }}>
                                                        {eligibilityResult.score >= 80 ? 'Highly Eligible' :
                                                            eligibilityResult.score >= 60 ? 'Moderately Eligible' :
                                                                eligibilityResult.score >= 40 ? 'Potentially Eligible' : 'Low Eligibility'}
                                                    </h5>
                                                    <p className="text-muted small">Based on your provided data</p>
                                                </div>
                                            </div>

                                            {/* Matches List */}
                                            <div className="mb-4">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <small className="fw-bold text-muted text-uppercase">Matches Found</small>
                                                    <span className="badge bg-primary rounded-pill">{eligibilityResult.recommended_scholarships?.length || 0}</span>
                                                </div>

                                                <div className="vstack gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                    {eligibilityResult.recommended_scholarships?.map((scholarship, idx) => (
                                                        <div key={idx} className="card border-0 shadow-sm rounded-3">
                                                            <div className="card-body p-3">
                                                                <div className="d-flex align-items-center">
                                                                    <div className="flex-grow-1">
                                                                        <h6 className="fw-bold mb-0 text-dark small">{scholarship.name}</h6>
                                                                        <div className="text-success small fw-bold">₱{scholarship.amount.toLocaleString()}</div>
                                                                    </div>
                                                                    <div className="ms-2 text-end">
                                                                        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">
                                                                            {scholarship.score}% Match
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!eligibilityResult.recommended_scholarships || eligibilityResult.recommended_scholarships.length === 0) && (
                                                        <div className="text-center py-3 text-muted small">
                                                            No specific matches found, but you may still apply.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="d-grid gap-2">
                                                <Link to="/applicant/apply" className="btn btn-primary fw-bold py-2 rounded-3 shadow-sm">
                                                    Apply Now <i className="fas fa-arrow-right ms-2"></i>
                                                </Link>
                                                <button onClick={handleReset} className="btn btn-light text-muted fw-medium py-2 rounded-3">
                                                    Reset Assessment
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        // Empty State
                                        <div className="text-center py-5 px-3">
                                            <div className="mb-4">
                                                <div className="bg-white rounded-circle shadow-sm mx-auto d-flex align-items-center justify-content-center" style={{width: '100px', height: '100px'}}>
                                                    <i className="fas fa-calculator text-primary fs-1 opacity-50"></i>
                                                </div>
                                            </div>
                                            <h5 className="fw-bold text-dark">Live Calculator</h5>
                                            <p className="text-muted small mb-4">
                                                Fill out the academic and financial details on the left to see your eligibility score in real-time.
                                            </p>

                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Info Card */}
                            <div className="mt-3">
                                <div className="alert alert-light border-0 shadow-sm rounded-4 small text-muted">
                                    <i className="fas fa-info-circle me-2 text-primary"></i>
                                    Results are indicative. Final approval depends on submitted document verification.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                /* Hide number input arrows */
                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button { 
                    -webkit-appearance: none; 
                    margin: 0; 
                }
                .form-control:focus, .form-select:focus {
                    box-shadow: none;
                    border: 2px solid #cfe2ff; /* Custom focus border */
                }
                .form-control {
                    border: 1px solid #f8f9fa; /* Seamless look */
                }
                .cursor-pointer { cursor: pointer; }
                .transition-all { transition: all 0.2s ease-in-out; }
            `}</style>
        </div>
    );
};

export default Prequalify;