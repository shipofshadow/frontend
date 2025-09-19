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
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    const grades: GradeEntry[] = applicant.grades || [];
    const totalUnits = grades.reduce((acc, g) => acc + g.units, 0);
    const weightedSum = grades.reduce((acc, g) => acc + g.grade * g.units, 0);
    const gwa = totalUnits ? (weightedSum / totalUnits).toFixed(2) : "0.00";

    const combinedIncome = parseFloat(applicant.father_income || 0 as unknown as string) + parseFloat(applicant.mother_income || 0 as unknown as string);

    const renderScholarshipRecommendations = () => {
        if (loading) {
            return (
                <div className="d-flex justify-content-center py-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading recommendations...</span>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </div>
            );
        }

        // Additional safety check
        if (!Array.isArray(recommendedScholarships) || recommendedScholarships.length === 0) {
            console.log('recommendedScholarships is not an array or is empty:', recommendedScholarships);
            return (
                <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    No scholarship recommendations available.
                </div>
            );
        }

        return (
            <div className="row">
                {recommendedScholarships.map((scholarship, index) => {

                    if (!scholarship || typeof scholarship !== 'object') {
                        console.warn('Invalid scholarship object:', scholarship);
                        return null;
                    }

                    const isSelected = scholarship.selection_status === 'selected';
                    return (
                        <div className="col-md-6 col-lg-6 mb-4" key={scholarship.id || index}>
                            <div className={`card h-100 border-0 shadow-sm rounded-4 position-relative ${isSelected ? 'border border-2 border-success' : ''}`}>
                                {isSelected && (
                                    <span className="badge bg-success position-absolute top-0 end-0 mt-2 me-2 rounded-pill px-3 py-1 shadow-sm">
                            Selected
                          </span>
                                )}
                                <div className="card-body d-flex flex-column justify-content-between">
                                    <div>
                                        <h5 className="fw-semibold text-dark mb-2">
                                            {scholarship.name || 'Unnamed Scholarship'}
                                        </h5>
                                        <p className="text-muted small mb-3">
                                            {scholarship.description || 'No description available.'}
                                        </p>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted d-flex align-items-center">
                                            <i className="bi bi-calendar me-1"></i>
                                            {scholarship.created_at ? new Date(scholarship.created_at).toLocaleDateString() : 'N/A'}
                                        </small>
                                        <span className={`badge rounded-pill px-2 ${scholarship.is_active ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
          {scholarship.is_active ? 'Active' : 'Inactive'}
        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    );
                }).filter(Boolean)} {/* Filter out null values */}
            </div>
        );
    };

    return (
        <>
            <div className="container-fluid px-4">
                {/* Header Card with Student Summary */}
                <div className="card mb-4 border-0 shadow-sm">
                    <div className="card-body ">
                        <div className="row align-items-center">
                            <div className="col-md-8">
                                <h4 className="mb-1">
                                    <i className="far fa-person me-2"></i>
                                    {`${applicant.first_name} ${applicant.middle_name || ''} ${applicant.last_name} ${applicant.name_extension || ''}`.trim()}
                                </h4>
                                <p className="mb-0 opacity-75">
                                    <i className="far fa-mortar-board me-1"></i>
                                    {applicant.course} • {applicant.year_level} • {applicant.campus}
                                </p>
                            </div>
                            <div className="col-md-4 text-md-end">
                                <div className="d-flex flex-column align-items-md-end">
                                    <span className="badge bg-light text-dark fs-6 mb-1">ID: {applicant["students.student_id"]}</span>
                                    <span className="badge bg-warning text-dark fs-6">GWA: {gwa}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-bottom">
                        <ul className="nav nav-pills nav-fill" id="applicant-tab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button
                                    className="nav-link active rounded-pill mx-1"
                                    id="tab-student-info"
                                    data-bs-toggle="pill"
                                    data-bs-target="#pane-student-info"
                                    type="button"
                                    role="tab"
                                    aria-controls="pane-student-info"
                                    aria-selected="true"
                                >
                                    <i className="bi bi-person me-2"></i>
                                    Personal Info
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className="nav-link rounded-pill mx-1"
                                    id="tab-grades"
                                    data-bs-toggle="pill"
                                    data-bs-target="#pane-grades"
                                    type="button"
                                    role="tab"
                                    aria-controls="pane-grades"
                                    aria-selected="false"
                                >
                                    <i className="bi bi-graph-up me-2"></i>
                                    Academic Records
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className="nav-link rounded-pill mx-1"
                                    id="tab-files"
                                    data-bs-toggle="pill"
                                    data-bs-target="#pane-files"
                                    type="button"
                                    role="tab"
                                    aria-controls="pane-files"
                                    aria-selected="false"
                                >
                                    <i className="bi bi-files me-2"></i>
                                    Documents
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className="nav-link rounded-pill mx-1"
                                    id="tab-scholarship"
                                    data-bs-toggle="pill"
                                    data-bs-target="#pane-scholarship"
                                    type="button"
                                    role="tab"
                                    aria-controls="pane-scholarship"
                                    aria-selected="false"
                                >
                                    <i className="bi bi-award me-2"></i>
                                    Scholarship Eligibility
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className="nav-link rounded-pill mx-1"
                                    id="tab-history"
                                    data-bs-toggle="pill"
                                    data-bs-target="#pane-history"
                                    type="button"
                                    role="tab"
                                    aria-controls="pane-history"
                                    aria-selected="false"
                                >
                                    <i className="bi bi-award me-2"></i>
                                    Scholarship History
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div className="card-body p-4">
                        <div className="tab-content" id="applicant-tab-content">
                            {/* Personal Information Tab */}
                            <div
                                className="tab-pane fade show active"
                                id="pane-student-info"
                                role="tabpanel"
                                aria-labelledby="tab-student-info"
                            >
                                {/* Personal Information Section */}
                                <div className="card border-0 bg-light mb-4">
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            <i className="far fa-person-dots-from-line me-2"></i>
                                            Personal Information
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-lg-8">
                                                <label className="form-label fw-semibold">Full Name</label>
                                                <input type="text" className="form-control"
                                                       value={`${applicant.first_name} ${applicant.middle_name || ''} ${applicant.last_name} ${applicant.name_extension || ''}`.trim()}
                                                       readOnly/>
                                            </div>
                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold">Student ID</label>
                                                <input type="text" className="form-control"
                                                       value={applicant["students.student_id"]} readOnly/>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label fw-semibold">Birth Date</label>
                                                <input type="text" className="form-control"
                                                       value={new Date(applicant.birth_date).toLocaleDateString()} readOnly/>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label fw-semibold">Gender</label>
                                                <input type="text" className="form-control" value={applicant.gender || 'N/A'} readOnly/>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label fw-semibold">Civil Status</label>
                                                <input type="text" className="form-control" value={applicant.civil_status || 'N/A'} readOnly/>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Contact Number</label>
                                                <input type="text" className="form-control" value={applicant.contact_number || 'N/A'} readOnly/>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Email Address</label>
                                                <input type="email" className="form-control" value={applicant.email || 'N/A'} readOnly/>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Section */}
                                <div className="card border-0 bg-light mb-4">
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            <i className="far fa-map-location me-2"></i>
                                            Address Information
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <label className="form-label fw-semibold">Complete Address</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={`${applicant.street}, ${applicant.barangay_name}, ${applicant.municipality_name}, ${applicant.province_name} ${applicant.zip_code || ''}`}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                {/* Educational Information Section */}
                                <div className="card border-0 bg-light mb-4">
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            <i className="far fa-mortar-board me-2"></i>
                                            Educational Information
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Campus</label>
                                                <input type="text" className="form-control" value={applicant.campus} readOnly/>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Department</label>
                                                <input type="text" className="form-control" value={applicant.department} readOnly/>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Course</label>
                                                <input type="text" className="form-control" value={applicant.course} readOnly/>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Year Level</label>
                                                <input type="text" className="form-control" value={applicant.year_level} readOnly/>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Enrollment Status</label>
                                                <input type="text" className="form-control" value={applicant.enrollment_status} readOnly/>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Total Units</label>
                                                <input type="text" className="form-control" value={applicant.total_units} readOnly/>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Family Background Section */}
                                <div className="card border-0 bg-light mb-4">
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            <i className="far fa-people me-2"></i>
                                            Family Background
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Father's Name</label>
                                                <input type="text" className="form-control"
                                                       value={`${applicant.father_first_name || ''} ${applicant.father_middle_name || ''} ${applicant.father_last_name || ''}`.trim() || 'N/A'}
                                                       readOnly/>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Father's Occupation</label>
                                                <input type="text" className="form-control" value={applicant.father_occupation || 'N/A'} readOnly/>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Father's Monthly Income</label>
                                                <input type="text" className="form-control"
                                                       value={`₱${parseFloat(applicant.father_income || 0 as unknown as string).toLocaleString()}`} readOnly/>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Mother's Name</label>
                                                <input type="text" className="form-control"
                                                       value={`${applicant.mother_first_name || ''} ${applicant.mother_middle_name || ''} ${applicant.mother_last_name || ''}`.trim() || 'N/A'}
                                                       readOnly/>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Mother's Occupation</label>
                                                <input type="text" className="form-control" value={applicant.mother_occupation || 'N/A'} readOnly/>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Mother's Monthly Income</label>
                                                <input type="text" className="form-control"
                                                       value={`₱${parseFloat(applicant.mother_income || 0 as unknown as string).toLocaleString()}`} readOnly/>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Information Section */}
                                <div className="card border-0 bg-light">
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            <i className="far fa-circle-info me-2"></i>
                                            Additional Information
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <label className="form-label fw-semibold">IP Affiliation</label>
                                                <input type="text" className="form-control" value={applicant.ip_affiliation || 'None'} readOnly/>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label fw-semibold">4Ps Member</label>
                                                <input type="text" className="form-control"
                                                       value={applicant.is_4ps_member ? "Yes" : "No"} readOnly/>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label fw-semibold">Household Number</label>
                                                <input type="text" className="form-control" value={applicant.household_number || 'N/A'} readOnly/>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Number of Siblings</label>
                                                <input type="text" className="form-control" value={applicant.siblings || '0'} readOnly/>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Siblings Currently Studying</label>
                                                <input type="text" className="form-control" value={applicant.siblings_studying || '0'} readOnly/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Grades Tab */}
                            <div
                                className="tab-pane fade"
                                id="pane-grades"
                                role="tabpanel"
                                aria-labelledby="tab-grades"
                            >
                                <div className="card border-0">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0">
                                            <i className="far fa-clipboard-list me-2"></i>
                                            Academic Performance Summary
                                        </h6>
                                        <div className="d-flex gap-3">
                                            <span className="badge bg-light text-dark fs-6">
                                                Total Units: {totalUnits}
                                            </span>
                                            <span className="badge bg-warning text-dark fs-6">
                                                GWA: {gwa}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="table-responsive">
                                            <table className="table table-hover mb-0">
                                                <thead className="">
                                                <tr>
                                                    <th className="ps-4 py-3">Subject Code & Description</th>
                                                    <th className="text-center py-3">Grade</th>
                                                    <th className="text-center py-3 pe-4">Units</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {grades.length > 0 ? grades.map((entry, index) => (
                                                    <tr key={index}>
                                                        <td className="ps-4 py-3">{entry.subject_name}</td>
                                                        <td className="text-center py-3">
                                                                <span className={`badge ${entry.grade <= 3.0 ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                                    {entry.grade.toFixed(2)}
                                                                </span>
                                                        </td>
                                                        <td className="text-center py-3 pe-4">{entry.units}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={3} className="text-center py-5 text-muted">
                                                            <i className="bi bi-inbox display-4 d-block mb-2"></i>
                                                            No grade records available
                                                        </td>
                                                    </tr>
                                                )}
                                                </tbody>
                                                {grades.length > 0 && (
                                                    <tfoot className="">
                                                    <tr>
                                                        <th className="ps-4 py-3">GENERAL WEIGHTED AVERAGE</th>
                                                        <th className="text-center py-3">
                                                            <span className="badge bg-warning text-dark fs-6">{gwa}</span>
                                                        </th>
                                                        <th className="text-center py-3 pe-4">
                                                            <span className="badge bg-info fs-6">{totalUnits}</span>
                                                        </th>
                                                    </tr>
                                                    </tfoot>
                                                )}
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Files Tab */}
                            <div
                                className="tab-pane fade"
                                id="pane-files"
                                role="tabpanel"
                                aria-labelledby="tab-files"
                            >
                                <div className="card border-0">
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            <i className="far fa-file-download me-2"></i>
                                            Submitted Documents
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-4">
                                            {applicant.itr_file && (
                                                <div className="col-md-6">
                                                    <div className="border rounded-3 p-3 h-100">
                                                        <FilePreview
                                                            label="Income Tax Return (ITR)"
                                                            filePath={applicant.itr_file}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {applicant.grades_file && (
                                                <div className="col-md-6">
                                                    <div className="border rounded-3 p-3 h-100">
                                                        <FilePreview
                                                            label="Academic Transcript"
                                                            filePath={applicant.grades_file}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {!applicant.itr_file && !applicant.grades_file && (
                                                <div className="col-12">
                                                    <div className="text-center py-5 text-muted">
                                                        <i className="bi bi-file-x display-4 d-block mb-3"></i>
                                                        <h5>No documents uploaded</h5>
                                                        <p>The applicant has not submitted any supporting documents.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scholarship Eligibility Tab */}
                            <div
                                className="tab-pane fade"
                                id="pane-scholarship"
                                role="tabpanel"
                                aria-labelledby="tab-scholarship"
                            >
                                <div className="card border-0">
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            <i className="far fa-medal me-2"></i>
                                            Scholarship Eligibility Assessment
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-4">
                                            {/* Eligibility Metrics */}
                                            <div className="col-lg-8">
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label fw-semibold">Indigenous Peoples (IP) Status</label>
                                                        <div className="input-group">
                                                            <span className="input-group-text">
                                                                <i className="far fa-people"></i>
                                                            </span>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={applicant.ip_affiliation || "Not Applicable"}
                                                                readOnly
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label fw-semibold">4Ps Beneficiary</label>
                                                        <div className="input-group">
                                                            <span className="input-group-text">
                                                                <i className="far fa-shield-check"></i>
                                                            </span>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={applicant.is_4ps_member ? "Yes" : "No"}
                                                                readOnly
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label fw-semibold">Combined Family Income</label>
                                                        <div className="input-group">
                                                            <span className="input-group-text">₱</span>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={combinedIncome.toLocaleString()}
                                                                readOnly
                                                            />
                                                            <span className="input-group-text">monthly</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label fw-semibold">General Weighted Average</label>
                                                        <div className="input-group">
                                                            <span className="input-group-text">
                                                                <i className="far fa-up-to-dotted-line"></i>
                                                            </span>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={gwa}
                                                                readOnly
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Assessment Results */}
                                            <div className="col-lg-4">
                                                <div className="card bg-light border-0 h-100">
                                                    <div className="card-body text-center">
                                                        <h6 className="card-title text-muted mb-3">Assessment Results</h6>

                                                        <div className="mb-3">
                                                            <label className="form-label fw-semibold small">Eligibility Score</label>
                                                            <div className="display-6 fw-bold text-primary mb-2">
                                                                {applicant?.score !== undefined ? `${(applicant.score * 100).toFixed(2)}%` : "—"}
                                                            </div>

                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label fw-semibold small">Classification</label>
                                                            <div>
                                                                <span className={`badge fs-6 ${
                                                                    applicant?.classification === 'Qualified' ? 'bg-success' :
                                                                        applicant?.classification === 'Not Qualified' ? 'bg-danger' :
                                                                            'bg-secondary'
                                                                }`}>
                                                                    {applicant?.classification || "Pending Evaluation"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-12 mb-3">
                                                <h5 className="border-bottom pb-2">
                                                    <i className="bi bi-award-fill me-2"></i>Recommended Scholarships
                                                </h5>
                                                {renderScholarshipRecommendations()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scholarship History Tab */}
                        <div
                            className="tab-pane fade"
                            id="pane-history"
                            role="tabpanel"
                            aria-labelledby="tab-history"
                        >
                            <ScholarshipSummary studentId={applicant.student_id}/>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ViewApplicantReadOnlyForm;