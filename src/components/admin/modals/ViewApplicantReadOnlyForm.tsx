import type {Applicant} from "../../../interfaces/applicant.ts";
import React, {useEffect, useState} from "react";
import type {GradeEntry} from "../../../interfaces/GradeEntry.ts";
import FilePreview from "../FilePreview.tsx";
import axios from "axios";
import {API_BASE_URL} from "../../../config.ts";
import {useAuth} from "../../../context/AuthContext.tsx";
import ScholarshipSummary from "../../common/admin/ScholarshipSummary.tsx";

interface Props {
    applicant: Applicant;
}

interface RecommendedScholarship {
    id: number;
    scholarship_id: number
    name: string;
    description: string;
    is_active: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    selection_status: string | null;
}

interface ScholarshipRecommendationsResponse {
    recommendations: RecommendedScholarship[];
    selectedScholarships: number[];
}

const ViewApplicantReadOnlyForm: React.FC<Props> = ({ applicant }) => {

    const [recommendedScholarships, setRecommendedScholarships] = useState<RecommendedScholarship[]>([]);
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!applicant?.id) return;

            setLoading(true);
            setError(null);

            try {
                const response = await axios.post<ScholarshipRecommendationsResponse>(
                    `${API_BASE_URL}/api/evaluations/recommendations`,
                    { application_id: applicant.id },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const scholarships: RecommendedScholarship[] = response.data.recommendations || [];
                setRecommendedScholarships(scholarships);

            } catch (error) {
                console.error("Failed to fetch recommendations:", error);
                setError("Failed to load scholarship recommendations");
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations().catch((err) =>
            console.error("Promise rejection in fetchRecommendations:", err)
        );
    }, [applicant, token]);

    if (!applicant) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">Loading applicant information...</p>
            </div>
        </div>
    );

    const grades: GradeEntry[] = applicant.grades || [];
    const totalUnits = grades.reduce((acc, g) => acc + g.units, 0);
    const weightedSum = grades.reduce((acc, g) => acc + g.grade * g.units, 0);
    const gwa = totalUnits ? (weightedSum / totalUnits).toFixed(2) : "0.00";

    const combinedIncome = parseFloat(applicant.father_income || 0 as unknown as string) + parseFloat(applicant.mother_income || 0 as unknown as string);

    const avatar = applicant.avatar;
    const path = avatar
        ? `${API_BASE_URL}/api/profile/avatar/${encodeURIComponent(avatar.split("/").pop()!)}`
        : "/default.png";
    const renderScholarshipRecommendations = () => {
        if (loading) {
            return (
                <div className="d-flex justify-content-center py-5">
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading recommendations...</span>
                        </div>
                        <p className="text-muted mb-0">Loading scholarship recommendations...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="alert alert-warning mb-0 d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill fs-5 me-3"></i>
                    <div>
                        <strong>Unable to load recommendations</strong>
                        <div className="small mt-1">{error}</div>
                    </div>
                </div>
            );
        }

        if (!Array.isArray(recommendedScholarships) || recommendedScholarships.length === 0) {
            return (
                <div className="text-center py-5">
                    <div className="mb-3">
                        <i className="bi bi-inbox display-1 text-muted opacity-25"></i>
                    </div>
                    <h6 className="text-muted mb-2">No Recommendations Available</h6>
                    <p className="text-muted small mb-0">There are currently no scholarship recommendations for this applicant.</p>
                </div>
            );
        }

        return (
            <div className="row g-4">
                {recommendedScholarships.map((scholarship, index) => {
                    if (!scholarship || typeof scholarship !== 'object') {
                        console.warn('Invalid scholarship object:', scholarship);
                        return null;
                    }

                    const isSelected = scholarship.selection_status === 'selected';
                    return (
                        <div className="col-md-6 col-xl-4" key={scholarship.id || index}>
                            <div className={`card h-100 shadow-sm ${isSelected ? 'border-success border-2' : 'border-0'}`}>
                                {isSelected && (
                                    <div className="position-absolute top-0 end-0 m-3">
                                        <span className="badge bg-success shadow-sm px-3 py-2">
                                            <i className="bi bi-check-circle-fill me-1"></i>Selected
                                        </span>
                                    </div>
                                )}
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-start mb-3">
                                        <div className="flex-shrink-0 me-3">
                                            <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                                                <i className="bi bi-award text-primary fs-4"></i>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="card-title fw-bold mb-1 lh-base">
                                                {scholarship.name || 'Unnamed Scholarship'}
                                            </h6>
                                            <span className={`badge ${scholarship.is_active ? 'bg-success' : 'bg-secondary'} bg-opacity-10 ${scholarship.is_active ? 'text-success' : 'text-secondary'} border ${scholarship.is_active ? 'border-success' : 'border-secondary'}`}>
                                                <i className={`bi ${scholarship.is_active ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                                                {scholarship.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="card-text text-muted small mb-3 lh-base">
                                        {scholarship.description || 'No description available.'}
                                    </p>
                                    <div className="border-top pt-3">
                                        <small className="text-muted d-flex align-items-center">
                                            <i className="bi bi-calendar-event me-2"></i>
                                            Created: {scholarship.created_at ? new Date(scholarship.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }).filter(Boolean)}
            </div>
        );
    };

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa' }}>
            {/* Enhanced Header Card */}
            <div className="card mb-4 border-0 shadow-sm">
                <div className="card-body p-4">
                    <div className="row align-items-center">
                        <div className="col-lg-8">
                            <div className="d-flex align-items-center mb-3">

                                {/* --- START: Profile Picture Section --- */}
                                <div className="flex-shrink-0 me-4">
                                    {path ? (
                                        // DESIGN 1: If an image exists
                                        <img
                                            src={path}
                                            alt={`${applicant.first_name} ${applicant.last_name}`}
                                            className="rounded-circle shadow-sm object-fit-cover border border-3 border-white"
                                            width="80"
                                            height="80"
                                        />
                                    ) : (
                                        // DESIGN 2: Fallback placeholder (if no image exists)
                                        // We use inline styles here to ensure it matches the exact dimensions of the img tag above
                                        <div
                                            className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center border border-3 border-white shadow-sm"
                                            style={{width: '80px', height: '80px'}}
                                        >
                                            <i className="bi bi-person-fill text-primary fs-2"></i>
                                        </div>
                                    )}
                                </div>
                                {/* --- END: Profile Picture Section --- */}

                                <div>
                                    <h4 className="mb-1 fw-bold">
                                        {`${applicant.first_name} ${applicant.middle_name || ''} ${applicant.last_name} ${applicant.name_extension || ''}`.trim()}
                                    </h4>
                                    <div className="text-muted">
                                        <i className="bi bi-mortarboard-fill me-2"></i>
                                        <span className="me-3">{applicant.course}</span>
                                        <span className="me-3">• {applicant.year_level}</span>
                                        <span>• {applicant.campus}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="row g-2">
                                <div className="col-6 col-lg-12">
                                    <div className="bg-light rounded-3 p-3 text-center">
                                        <div className="small text-muted mb-1">Student ID</div>
                                        <div className="fw-bold">{applicant["students.student_id"]}</div>
                                    </div>
                                </div>
                                <div className="col-6 col-lg-12">
                                    <div className="bg-warning bg-opacity-10 border border-warning rounded-3 p-3 text-center">
                                        <div className="small text-muted mb-1">General Weighted Average</div>
                                        <div className="fw-bold text-warning fs-5">{gwa}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Main Content Card */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 pt-4 px-4">
                    <ul className="nav nav-pills" id="applicant-tab" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button
                                className="nav-link active rounded-3 px-4"
                                id="tab-student-info"
                                data-bs-toggle="tab"
                                data-bs-target="#pane-student-info"
                                type="button"
                                role="tab"
                            >
                                <i className="bi bi-person me-2"></i>
                                Personal Info
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className="nav-link rounded-3 px-4"
                                id="tab-grades"
                                data-bs-toggle="tab"
                                data-bs-target="#pane-grades"
                                type="button"
                                role="tab"
                            >
                                <i className="bi bi-graph-up me-2"></i>
                                Grades
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className="nav-link rounded-3 px-4"
                                id="tab-files"
                                data-bs-toggle="tab"
                                data-bs-target="#pane-files"
                                type="button"
                                role="tab"
                            >
                                <i className="bi bi-files me-2"></i>
                                Documents
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className="nav-link rounded-3 px-4"
                                id="tab-scholarship"
                                data-bs-toggle="tab"
                                data-bs-target="#pane-scholarship"
                                type="button"
                                role="tab"
                            >
                                <i className="bi bi-award me-2"></i>
                                Eligibility
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className="nav-link rounded-3 px-4"
                                id="tab-history"
                                data-bs-toggle="tab"
                                data-bs-target="#pane-history"
                                type="button"
                                role="tab"
                            >
                                <i className="bi bi-clock-history me-2"></i>
                                History
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="card-body p-4">
                    <div className="tab-content" id="applicant-tab-content">
                        {/* Personal Information Tab */}
                        <div className="tab-pane fade show active" id="pane-student-info" role="tabpanel">
                            {/* Personal Information Section */}
                            <div className="mb-5">
                                <div className="d-flex align-items-center mb-4">
                                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                                        <i className="bi bi-person-vcard text-primary fs-5"></i>
                                    </div>
                                    <h5 className="mb-0 fw-bold">Personal Information</h5>
                                </div>
                                <div className="row g-3">
                                    <div className="col-lg-8">
                                        <label className="form-label fw-semibold small text-muted">Full Name</label>
                                        <input type="text" className="form-control border-0 bg-light"
                                               value={`${applicant.first_name} ${applicant.middle_name || ''} ${applicant.last_name} ${applicant.name_extension || ''}`.trim()}
                                               readOnly/>
                                    </div>
                                    <div className="col-lg-4">
                                        <label className="form-label fw-semibold small text-muted">Student ID</label>
                                        <input type="text" className="form-control border-0 bg-light"
                                               value={applicant["students.student_id"]} readOnly/>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold small text-muted">Birth Date</label>
                                        <input type="text" className="form-control border-0 bg-light"
                                               value={new Date(applicant.birth_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} readOnly/>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold small text-muted">Gender</label>
                                        <input type="text" className="form-control border-0 bg-light" value={applicant.gender || 'N/A'} readOnly/>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold small text-muted">Civil Status</label>
                                        <input type="text" className="form-control border-0 bg-light" value={applicant.civil_status || 'N/A'} readOnly/>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small text-muted">Contact Number</label>
                                        <div className="input-group">
                                            <span className="input-group-text border-0 bg-light"><i className="bi bi-telephone"></i></span>
                                            <input type="text" className="form-control border-0 bg-light" value={applicant.contact_number || 'N/A'} readOnly/>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small text-muted">Email Address</label>
                                        <div className="input-group">
                                            <span className="input-group-text border-0 bg-light"><i className="bi bi-envelope"></i></span>
                                            <input type="email" className="form-control border-0 bg-light" value={applicant.email || 'N/A'} readOnly/>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="mb-5">
                                <div className="d-flex align-items-center mb-4">
                                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                                        <i className="bi bi-geo-alt text-primary fs-5"></i>
                                    </div>
                                    <h5 className="mb-0 fw-bold">Address Information</h5>
                                </div>
                                <label className="form-label fw-semibold small text-muted">Complete Address</label>
                                <input
                                    type="text"
                                    className="form-control border-0 bg-light"
                                    value={`${applicant.street}, ${applicant.barangay_name}, ${applicant.municipality_name}, ${applicant.province_name} ${applicant.zip_code || ''}`}
                                    readOnly
                                />
                            </div>

                            {/* Educational Information Section */}
                            <div className="mb-5">
                                <div className="d-flex align-items-center mb-4">
                                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                                        <i className="bi bi-book text-primary fs-5"></i>
                                    </div>
                                    <h5 className="mb-0 fw-bold">Educational Information</h5>
                                </div>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small text-muted">Campus</label>
                                        <input type="text" className="form-control border-0 bg-light" value={applicant.campus} readOnly/>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small text-muted">Department</label>
                                        <input type="text" className="form-control border-0 bg-light" value={applicant.department} readOnly/>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small text-muted">Course</label>
                                        <input type="text" className="form-control border-0 bg-light" value={applicant.course} readOnly/>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small text-muted">Year Level</label>
                                        <input type="text" className="form-control border-0 bg-light" value={applicant.year_level} readOnly/>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small text-muted">Enrollment Status</label>
                                        <input type="text" className="form-control border-0 bg-light" value={applicant.enrollment_status} readOnly/>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small text-muted">Total Units</label>
                                        <input type="text" className="form-control border-0 bg-light" value={applicant.total_units} readOnly/>
                                    </div>
                                </div>
                            </div>

                            {/* Family Background Section */}
                            <div className="mb-5">
                                <div className="d-flex align-items-center mb-4">
                                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                                        <i className="bi bi-people text-primary fs-5"></i>
                                    </div>
                                    <h5 className="mb-0 fw-bold">Family Background</h5>
                                </div>
                                <div className="row g-4">
                                    {/* Father's Information */}
                                    <div className="col-lg-6">
                                        <div className="border rounded-3 p-3 h-100 bg-light bg-opacity-50">
                                            <h6 className="fw-bold mb-3 text-primary">Father's Information</h6>
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold small text-muted">Full Name</label>
                                                <input type="text" className="form-control border-0 bg-white"
                                                       value={`${applicant.father_first_name || ''} ${applicant.father_middle_name || ''} ${applicant.father_last_name || ''}`.trim() || 'N/A'}
                                                       readOnly/>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold small text-muted">Occupation</label>
                                                <input type="text" className="form-control border-0 bg-white" value={applicant.father_occupation || 'N/A'} readOnly/>
                                            </div>
                                            <div>
                                                <label className="form-label fw-semibold small text-muted">Monthly Income</label>
                                                <div className="input-group">
                                                    <span className="input-group-text border-0 bg-white">₱</span>
                                                    <input type="text" className="form-control border-0 bg-white"
                                                           value={parseFloat(applicant.father_income || 0 as unknown as string).toLocaleString()} readOnly/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Mother's Information */}
                                    <div className="col-lg-6">
                                        <div className="border rounded-3 p-3 h-100 bg-light bg-opacity-50">
                                            <h6 className="fw-bold mb-3 text-primary">Mother's Information</h6>
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold small text-muted">Full Name</label>
                                                <input type="text" className="form-control border-0 bg-white"
                                                       value={`${applicant.mother_first_name || ''} ${applicant.mother_middle_name || ''} ${applicant.mother_last_name || ''}`.trim() || 'N/A'}
                                                       readOnly/>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold small text-muted">Occupation</label>
                                                <input type="text" className="form-control border-0 bg-white" value={applicant.mother_occupation || 'N/A'} readOnly/>
                                            </div>
                                            <div>
                                                <label className="form-label fw-semibold small text-muted">Monthly Income</label>
                                                <div className="input-group">
                                                    <span className="input-group-text border-0 bg-white">₱</span>
                                                    <input type="text" className="form-control border-0 bg-white"
                                                           value={parseFloat(applicant.mother_income || 0 as unknown as string).toLocaleString()} readOnly/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information Section */}
                            <div>
                                <div className="d-flex align-items-center mb-4">
                                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                                        <i className="bi bi-info-circle text-primary fs-5"></i>
                                    </div>
                                    <h5 className="mb-0 fw-bold">Additional Information</h5>
                                </div>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold small text-muted">IP Affiliation</label>
                                        <input type="text" className="form-control border-0 bg-light" value={applicant.ip_affiliation || 'None'} readOnly/>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold small text-muted">4Ps Beneficiary</label>
                                        <input type="text" className="form-control border-0 bg-light"
                                               value={applicant.is_4ps_member ? "Yes" : "No"} readOnly/>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold small text-muted">Household Number</label>
                                        <input type="text" className="form-control border-0 bg-light" value={applicant.household_number || 'N/A'} readOnly/>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small text-muted">Number of Siblings</label>
                                        <input type="text" className="form-control border-0 bg-light" value={applicant.siblings || '0'} readOnly/>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small text-muted">Siblings Currently Studying</label>
                                        <input type="text" className="form-control border-0 bg-light" value={applicant.siblings_studying || '0'} readOnly/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Grades Tab */}
                        <div className="tab-pane fade" id="pane-grades" role="tabpanel">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                                        <i className="bi bi-clipboard-data text-primary fs-5"></i>
                                    </div>
                                    <h5 className="mb-0 fw-bold">Academic Performance</h5>
                                </div>
                                <div className="d-flex gap-2">
                                    <div className="bg-light rounded-3 px-3 py-2">
                                        <small className="text-muted d-block">Total Units</small>
                                        <div className="fw-bold text-center">{totalUnits}</div>
                                    </div>
                                    <div className="bg-warning bg-opacity-10 border border-warning rounded-3 px-3 py-2">
                                        <small className="text-muted d-block">GWA</small>
                                        <div className="fw-bold text-warning text-center">{gwa}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                                    <tr>
                                        <th className="border-0 py-3">Subject Name</th>
                                        <th className="border-0 py-3 text-center" style={{ width: '120px' }}>Grade</th>
                                        <th className="border-0 py-3 text-center" style={{ width: '100px' }}>Units</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {grades.length > 0 ? grades.map((entry, index) => (
                                        <tr key={index}>
                                            <td className="py-3">{entry.subject_name}</td>
                                            <td className="text-center py-3">
                                                <span className={`badge ${entry.grade <= 3.0 ? 'bg-success' : 'bg-warning'} bg-opacity-10 ${entry.grade <= 3.0 ? 'text-success' : 'text-warning'} border ${entry.grade <= 3.0 ? 'border-success' : 'border-warning'} px-3 py-2`}>
                                                    {entry.grade.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="text-center py-3">
                                                <span className="badge bg-light text-dark border px-3 py-2">{entry.units}</span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="text-center py-5">
                                                <div className="text-muted">
                                                    <i className="bi bi-inbox display-1 opacity-25 d-block mb-3"></i>
                                                    <h6>No Grade Records Available</h6>
                                                    <p className="small mb-0">There are currently no grades uploaded for this applicant.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                    {grades.length > 0 && (
                                        <tfoot style={{ backgroundColor: '#f8f9fa' }}>
                                        <tr>
                                            <th className="border-0 py-3">GENERAL WEIGHTED AVERAGE</th>
                                            <th className="text-center border-0 py-3">
                                                <span className="badge bg-warning bg-opacity-10 text-warning border border-warning px-3 py-2">{gwa}</span>
                                            </th>
                                            <th className="text-center border-0 py-3">
                                                <span className="badge bg-info bg-opacity-10 text-info border border-info px-3 py-2">{totalUnits}</span>
                                            </th>
                                        </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>

                        {/* Files Tab */}
                        <div className="tab-pane fade" id="pane-files" role="tabpanel">
                            <div className="d-flex align-items-center mb-4">
                                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                                    <i className="bi bi-file-earmark-text text-primary fs-5"></i>
                                </div>
                                <h5 className="mb-0 fw-bold">Submitted Documents</h5>
                            </div>
                            <div className="row g-4">
                                {applicant.itr_files && applicant.itr_files.length > 0 && (
                                    <div className="col-md-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-body p-4">
                                                <div className="d-flex align-items-center mb-3">
                                                    <div className="bg-danger bg-opacity-10 rounded p-2 me-2">
                                                        <i className="bi bi-file-earmark-pdf text-danger fs-5"></i>
                                                    </div>
                                                    <h6 className="mb-0 fw-bold">
                                                        Income Tax Return{/* Pluralize if multiple files */ }
                                                        {(Array.isArray(applicant.itr_files) ? applicant.itr_files.length : applicant.itr_files.split(',').length) > 1 ? 's' : ''}
                                                    </h6>
                                                </div>

                                                <div className="d-flex flex-column gap-3">
                                                    {/* Handle both Array (if parsed in Python) and String (if raw SQL) */}
                                                    {(Array.isArray(applicant.itr_files)
                                                            ? applicant.itr_files
                                                            : applicant.itr_files.toString().split(',')
                                                    ).map((filePath, index) => (
                                                        <FilePreview
                                                            key={index}
                                                            // Optional: Add a counter label if there's more than one file
                                                            label={`Document ${index + 1}`}
                                                            filePath={filePath.trim()}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {applicant.grades_file && (
                                    <div className="col-md-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-body p-4">
                                                <div className="d-flex align-items-center mb-3">
                                                    <div className="bg-success bg-opacity-10 rounded p-2 me-2">
                                                        <i className="bi bi-file-earmark-text text-success fs-5"></i>
                                                    </div>
                                                    <h6 className="mb-0 fw-bold">Academic Transcript</h6>
                                                </div>
                                                <FilePreview
                                                    label=""
                                                    filePath={applicant.grades_file}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {!applicant.itr_files && !applicant.grades_file && (
                                    <div className="col-12">
                                        <div className="text-center py-5">
                                            <div className="mb-3">
                                                <i className="bi bi-file-x display-1 text-muted opacity-25"></i>
                                            </div>
                                            <h6 className="text-muted mb-2">No Documents Uploaded</h6>
                                            <p className="text-muted small mb-0">The applicant has not submitted any supporting documents.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Scholarship Eligibility Tab */}
                        <div className="tab-pane fade" id="pane-scholarship" role="tabpanel">
                            <div className="d-flex align-items-center mb-4">
                                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                                    <i className="bi bi-check2-square text-primary fs-5"></i>
                                </div>
                                <h5 className="mb-0 fw-bold">Eligibility Assessment</h5>
                            </div>
                            <div className="row g-4 mb-5">
                                <div className="col-lg-8">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold small text-muted">IP Status</label>
                                            <input
                                                type="text"
                                                className="form-control border-0 bg-light"
                                                value={applicant.ip_affiliation || "Not Applicable"}
                                                readOnly
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold small text-muted">4Ps Beneficiary</label>
                                            <input
                                                type="text"
                                                className="form-control border-0 bg-light"
                                                value={applicant.is_4ps_member ? "Yes" : "No"}
                                                readOnly
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold small text-muted">Combined Family Income</label>
                                            <div className="input-group">
                                                <span className="input-group-text border-0 bg-light">₱</span>
                                                <input
                                                    type="text"
                                                    className="form-control border-0 bg-light"
                                                    value={combinedIncome.toLocaleString()}
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold small text-muted">General Weighted Average</label>
                                            <input
                                                type="text"
                                                className="form-control border-0 bg-light"
                                                value={gwa}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-4">
                                    <div className="card border-0 h-100" style={{ backgroundColor: '#f8f9fa' }}>
                                        <div className="card-body text-center p-4">
                                            <h6 className="text-muted mb-4">Assessment Results</h6>
                                            <div className="mb-4">
                                                <small className="text-muted d-block mb-2">Eligibility Score</small>
                                                <div className="display-4 fw-bold text-primary">
                                                    {applicant?.score !== undefined ? `${(applicant.score * 100).toFixed(0)}%` : "—"}
                                                </div>
                                            </div>
                                            <div>
                                                <small className="text-muted d-block mb-2">Classification</small>
                                                <span className={`badge px-4 py-2 ${
                                                    applicant?.classification === 'Qualified' ? 'bg-success' :
                                                        applicant?.classification === 'Not Qualified' ? 'bg-danger' :
                                                            'bg-secondary'
                                                }`}>
                                                    {applicant?.classification || "Pending"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex align-items-center mb-4">
                                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                                    <i className="bi bi-award text-primary fs-5"></i>
                                </div>
                                <h5 className="mb-0 fw-bold">Recommended Scholarships</h5>
                            </div>
                            {renderScholarshipRecommendations()}
                        </div>

                        {/* Scholarship History Tab */}
                        <div className="tab-pane fade" id="pane-history" role="tabpanel">
                            <ScholarshipSummary studentId={applicant.student_id}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewApplicantReadOnlyForm;
