import type {Applicant} from "../../../interfaces/applicant.ts";
import React, {useState} from "react";
import type {GradeEntry} from "../../../interfaces/GradeEntry.ts";
import FilePreview from "../FilePreview.tsx";

interface Props {
    applicant: Applicant;
    onApplicationStatus?: (id: number, status: "approved" | "denied" | null, remarks?: string) => void;
}

const ViewApplicantReadOnlyForm : React.FC<Props> = ({ applicant, onApplicationStatus }) => {
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState<'approved' | 'denied' | null>(null);
    const [remarks, setRemarks] = useState('');

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

    const combinedIncome = parseFloat(applicant.father_income || 0) + parseFloat(applicant.mother_income || 0);

    return (
        <>
            <div className="container-fluid px-4">
                {/* Header Card with Student Summary */}
                <div className="card mb-4 border-0 shadow-sm">
                    <div className="card-body ">
                        <div className="row align-items-center">
                            <div className="col-md-8">
                                <h4 className="mb-1">
                                    <i className="bi bi-person-badge me-2"></i>
                                    {`${applicant.first_name} ${applicant.middle_name || ''} ${applicant.last_name} ${applicant.name_extension || ''}`.trim()}
                                </h4>
                                <p className="mb-0 opacity-75">
                                    <i className="bi bi-mortarboard me-1"></i>
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
                                    Eligibility
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
                                                       value={`₱${parseFloat(applicant.father_income || 0).toLocaleString()}`} readOnly/>
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
                                                       value={`₱${parseFloat(applicant.mother_income || 0).toLocaleString()}`} readOnly/>
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
                                                <input type="text" className="form-control" value={applicant.sublings_studying || '0'} readOnly/>
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
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="mt-4 pt-3 border-top">
                                            {!applicant?.score ? (
                                                <div className="d-flex justify-content-center">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-lg px-5"
                                                        onClick={() => onApplicationStatus?.(applicant.id, 'evaluate')}
                                                    >
                                                        <i className="far fa-calculator me-2"></i>
                                                        Evaluate Eligibility
                                                    </button>
                                                </div>
                                            ) : applicant.status?.toLowerCase() !== "pending" ? (
                                                <div className="text-center">
                                                    <div
                                                        className={`alert alert-${
                                                            applicant.status === "approved" ? "success" : "danger"
                                                        } d-inline-block px-5 py-3 mb-0`}
                                                        role="alert"
                                                    >
                                                        <i className={`far ${
                                                            applicant.status === "approved" ? "fa-check-circle" : "fa-circle-x"
                                                        } me-2`}></i>
                                                        <strong>Application {applicant.status.toUpperCase()}</strong>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="d-flex justify-content-center gap-3">
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-lg px-4"
                                                        onClick={() => {
                                                            setModalAction('denied');
                                                            setShowModal(true);
                                                        }}
                                                    >
                                                        <i className="far fa-circle-x me-2"></i>
                                                        Deny Application
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-success btn-lg px-4"
                                                        onClick={() => {
                                                            setModalAction('approved');
                                                            setShowModal(true);
                                                        }}
                                                    >
                                                        <i className="far fa-check-circle me-2"></i>
                                                        Approve Application
                                                    </button>
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

            {/* Decision Modal */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                        <div className="modal-content">
                            <div className={`modal-header ${modalAction === 'approved' ? 'bg-success' : 'bg-danger'} text-white`}>
                                <h5 className="modal-title text-capitalize">
                                    <i className={`bi ${modalAction === 'approved' ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>
                                    {modalAction} Application
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="alert alert-info border-0" role="alert">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Please provide detailed remarks for your decision. This will be recorded and visible to the applicant.
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="remarks" className="form-label fw-semibold">
                                        Remarks <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        id="remarks"
                                        className="form-control form-control-lg"
                                        rows={5}
                                        placeholder={`Please provide detailed reasons for ${modalAction === 'approved' ? 'approving' : 'denying'} this application...`}
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        required
                                    ></textarea>
                                    <div className="form-text">
                                        Minimum 10 characters required. Be specific and professional.
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer bg-light">
                                <button type="button" className="btn btn-outline-secondary btn-lg" onClick={() => setShowModal(false)}>
                                    <i className="bi bi-arrow-left me-2"></i>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${modalAction === 'approved' ? 'btn-success' : 'btn-danger'} btn-lg px-4`}
                                    disabled={!remarks.trim() || remarks.trim().length < 10}
                                    onClick={() => {
                                        onApplicationStatus?.(applicant.id, modalAction, remarks);
                                        setShowModal(false);
                                        setRemarks('');
                                        setModalAction(null);
                                    }}
                                >
                                    <i className={`bi ${modalAction === 'approved' ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>
                                    Confirm {modalAction === 'approved' ? 'Approval' : 'Denial'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ViewApplicantReadOnlyForm;