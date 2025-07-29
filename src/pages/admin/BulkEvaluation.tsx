import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "simple-datatables";
import "simple-datatables/dist/style.css";
import type { Applicant } from "../../interfaces/applicant";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import type { GradeEntry } from "../../interfaces/GradeEntry";

const BulkEvaluation = () => {
    const tableRef = useRef<HTMLTableElement>(null);
    const { token } = useAuth();

    const [pendingApplicants, setPendingApplicants] = useState<Applicant[]>([]);
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
    const [recommendedScholarships, setRecommendedScholarships] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDecisionModal, setShowDecisionModal] = useState(false);
    const [showEligibilityModal, setShowEligibilityModal] = useState(false);
    const [modalAction, setModalAction] = useState<'approved' | 'denied' | null>(null);
    const [remarks, setRemarks] = useState('');

    const fetchPendingApplicants = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/applicants/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPendingApplicants(response.data);
        } catch (error) {
            console.error("Error fetching applicants:", error);
            await Swal.fire("Error", "Failed to load applicants.", "error");
        }
    };

    const calculateGWA = (grades: GradeEntry[]): number => {
        if (!grades || grades.length === 0) return 0;
        const totalUnits = grades.reduce((acc, g) => acc + g.units, 0);
        const totalWeighted = grades.reduce((acc, g) => acc + g.units * g.grade, 0);
        return totalUnits ? +(totalWeighted / totalUnits).toFixed(2) : 0;
    };

    const evaluateAllApplicants = async () => {
        if (pendingApplicants.length === 0) {
            await Swal.fire("Info", "No applicants to evaluate.", "info");
            return;
        }

        // Filter out already evaluated applicants upfront
        const unevaluatedApplicants = pendingApplicants.filter(applicant => applicant.score === null);

        if (unevaluatedApplicants.length === 0) {
            await Swal.fire("Info", "All applicants have already been evaluated.", "info");
            return;
        }

        const confirm = await Swal.fire({
            title: 'Confirm Bulk Evaluation',
            text: `Are you sure you want to evaluate ${unevaluatedApplicants.length} applicants?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, evaluate all',
            cancelButtonText: 'Cancel'
        });

        if (!confirm.isConfirmed) return;

        setLoading(true);
        let successCount = 0;
        let errorCount = 0;
        const failedApplicants = [];

        // Process all evaluations in parallel (optional - use if your API can handle concurrent requests)
        const evaluationPromises = unevaluatedApplicants.map(async (applicant) => {
            const gwa = calculateGWA(applicant.grades);
            const income = parseFloat(applicant.father_income || '0') + parseFloat(applicant.mother_income || '0');

            try {
                await axios.post(`${API_BASE_URL}/api/evaluation/evaluate`, {
                    application_id: applicant.id,
                    gwa,
                    income,
                    ip_affiliation: applicant.ip_affiliation
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                return { success: true, applicant };
            } catch (error) {
                console.error(`Evaluation failed for ${applicant.first_name}:`, error);
                return { success: false, applicant, error };
            }
        });

        const results = await Promise.allSettled(evaluationPromises);

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                if (result.value.success) {
                    successCount++;
                } else {
                    errorCount++;
                    failedApplicants.push(`${result.value.applicant.first_name} ${result.value.applicant.last_name}`);
                }
            } else {
                errorCount++;
                failedApplicants.push('Unknown applicant');
            }
        });

        // Refresh data only once after all evaluations
        await fetchPendingApplicants();
        setLoading(false);

        // Show detailed results
        if (errorCount === 0) {
            await Swal.fire(
                "Success",
                `All ${successCount} applicants evaluated successfully!`,
                "success"
            );
        } else if (successCount === 0) {
            await Swal.fire(
                "Failed",
                `Failed to evaluate all ${errorCount} applicants.`,
                "error"
            );
        } else {
            // Partial success - show details
            const failedNames = failedApplicants.length <= 5
                ? failedApplicants.join(', ')
                : `${failedApplicants.slice(0, 5).join(', ')} and ${failedApplicants.length - 5} others`;

            await Swal.fire({
                title: "Partial Success",
                html: `
                <div>
                    <p><strong>✅ ${successCount} successful</strong></p>
                    <p><strong>❌ ${errorCount} failed</strong></p>
                    <br>
                    <p><small>Failed applicants: ${failedNames}</small></p>
                </div>
            `,
                icon: "warning"
            });
        }
    };

    const evaluateSingleApplicant = async (applicantId: number) => {
        const applicant = pendingApplicants.find(a => a.id === applicantId);
        if (!applicant) return;

        // Show confirmation dialog
        const confirm = await Swal.fire({
            title: 'Evaluate Applicant',
            text: `Evaluate ${applicant.first_name} ${applicant.last_name}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, evaluate',
            cancelButtonText: 'Cancel'
        });

        if (!confirm.isConfirmed) return;

        try {
            const gwa = calculateGWA(applicant.grades);
            const income = parseFloat(applicant.father_income || '0') + parseFloat(applicant.mother_income || '0');

            const response = await axios.post(`${API_BASE_URL}/api/evaluation/evaluate`, {
                application_id: applicant.id,
                gwa,
                income,
                ip_affiliation: applicant.ip_affiliation
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchPendingApplicants();
            await Swal.fire('Success', 'Applicant evaluated successfully!', 'success');

            // If we're in the modal, update the selected applicant
            if (selectedApplicant?.id === applicantId) {
                const updatedApplicant = pendingApplicants.find(a => a.id === applicantId);
                if (updatedApplicant) {
                    setSelectedApplicant(updatedApplicant);
                }
            }
        } catch (error) {
            console.error(`Evaluation failed for applicant ${applicantId}:`, error);
            await Swal.fire('Error', 'Failed to evaluate applicant. Please try again.', 'error');
        }
    };


    const handleApplicationStatus = async (
        applicationId: number,
        status: 'approved' | 'denied',
        remarks?: string
    ) => {
        const confirm = await Swal.fire({
            title: `Confirm ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            text: `You are about to ${status} this application. This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: `Yes, ${status}!`,
            confirmButtonColor: status === 'approved' ? '#28a745' : '#dc3545'
        });

        if (!confirm.isConfirmed) return;

        try {
            await axios.put(
                `${API_BASE_URL}/api/applicants/${applicationId}/status`,
                {
                    status,
                    remarks: remarks?.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                }
            );

            await Swal.fire(
                'Success',
                `Application has been ${status}.`,
                'success'
            );

            // Refresh data instead of full page reload
            await fetchPendingApplicants();

            // Close modals and reset state
            setShowDecisionModal(false);
            setShowEligibilityModal(false);
            setRemarks('');
            setModalAction(null);
            setSelectedApplicant(null);

        } catch (error) {
            console.error(error);
            Swal.fire('Error', `Failed to ${status} application. Please try again.`, 'error');
        }
    };


    const closeDecisionModal = () => {
        setShowDecisionModal(false);
        setRemarks('');
        setModalAction(null);
    };

    const closeEligibilityModal = () => {
        setShowEligibilityModal(false);
        setTimeout(() => setSelectedApplicant(null), 300); // Delay to allow animation
    };

    const openEligibilityModal = (applicant: Applicant) => {
        setSelectedApplicant(applicant);
        setTimeout(() => setShowEligibilityModal(true), 10); // Small delay for proper rendering
    };

    useEffect(() => {
        fetchPendingApplicants();
    }, []);


    useEffect(() => {
        if (tableRef.current && pendingApplicants.length > 0) {
            new DataTable(tableRef.current, {
                perPage: 5,
                searchable: true,
                sortable: true,
            });
        }
    }, [pendingApplicants]);


    // Calculate values for modal
    const combinedIncome = selectedApplicant
        ? parseFloat(selectedApplicant.father_income || '0') + parseFloat(selectedApplicant.mother_income || '0')
        : 0;
    const modalGwa = selectedApplicant ? calculateGWA(selectedApplicant.grades) : 0;

    const getScoreBadgeClass = (score: number) => {
        if (score >= 0.75) return "bg-success";
        if (score >= 0.5) return "bg-info text-dark";
        if (score >= 0.25) return "bg-warning text-dark";
        return "bg-danger";
    };

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!selectedApplicant) return;

            try {
                const response = await axios.post(
                    `${API_BASE_URL}/api/evaluation/recommendations`,
                    { application_id: selectedApplicant.id },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setRecommendedScholarships(response.data);
            } catch (error) {
                console.error("Failed to fetch recommendations:", error);
            }
        };

        fetchRecommendations();
    }, [selectedApplicant]);


    return (
        <>
            <header className="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
                <div className="container-fluid px-4">
                    <div className="page-header-content">
                        <div className="row align-items-center justify-content-between pt-3">
                            <div className="col-auto mb-3">
                                <h1 className="page-header-title d-flex align-items-center gap-2">
                                    <i data-feather="zap" /> Bulk Evaluation
                                    <small className="text-muted ms-2">({pendingApplicants.length} applicants)</small>
                                </h1>
                            </div>
                            <div className="col-auto">
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={evaluateAllApplicants}
                                    disabled={loading || pendingApplicants.length === 0}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Evaluating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa fa-cogs me-2" />
                                            Evaluate All Students
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-xl">
                <div className="card shadow-sm mb-4">
                    <div className="card-header fw-bold bg-light d-flex justify-content-between align-items-center">
                        <span>Student Evaluation Table</span>
                        <small className="text-muted">
                            {pendingApplicants.filter(a => a.score !== undefined).length} evaluated / {pendingApplicants.length} total
                        </small>
                    </div>
                    <div className="card-body">
                        {pendingApplicants.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fa fa-inbox fa-3x text-muted mb-3"></i>
                                <p className="text-muted">No applicants found</p>
                            </div>
                        ) : (
                            <table ref={tableRef} id="datatablesSimple" className="table table-bordered table-hover">
                                <thead className="table-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Campus</th>
                                    <th>Course</th>
                                    <th>Year</th>
                                    <th>IP Affiliation</th>
                                    <th>4ps Member</th>
                                    <th className="text-end">GWA</th>
                                    <th className="text-end">Family Income</th>
                                    <th className="text-end">Eligibility Score</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {pendingApplicants.map((applicant) => {
                                    const {
                                        id,
                                        first_name,
                                        middle_name,
                                        last_name,
                                        campus,
                                        course,
                                        year_level,
                                        ip_affiliation,
                                        is_4ps_member,
                                        father_income,
                                        mother_income,
                                        grades,
                                        score,
                                        classification
                                    } = applicant;

                                    const gwa = calculateGWA(grades);
                                    const income = parseFloat(father_income || '0') + parseFloat(mother_income || '0');
                                    const fullName = `${first_name} ${middle_name || ""} ${last_name}`.trim();
                                    const formattedIncome = new Intl.NumberFormat("en-PH", {
                                        style: "currency",
                                        currency: "PHP",
                                        minimumFractionDigits: 0
                                    }).format(income);

                                    return (
                                        <tr key={id}>
                                            <td>
                                                <div className="fw-semibold">{fullName}</div>
                                            </td>
                                            <td>{campus}</td>
                                            <td>{course}</td>
                                            <td>{year_level}</td>
                                            <td>{ip_affiliation || <em className="text-muted">None</em>}</td>
                                            <td>
                                                <span className={`badge ${is_4ps_member ? "bg-primary" : "bg-secondary"}`}>
                                                    {is_4ps_member ? "Yes" : "No"}
                                                </span>
                                            </td>
                                            <td className="text-end fw-semibold">{gwa}</td>
                                            <td className="text-end">{formattedIncome}</td>
                                            <td className="text-end">
                                                {typeof score === "number" ? (
                                                    <span className={`badge ${getScoreBadgeClass(score)}`}>
                                                      {(score * 100).toFixed(2)}%
                                                    </span>

                                                ) : (
                                                    <span className="text-muted">—</span>
                                                )}
                                            </td>
                                            <td>
                                                {classification ? (
                                                    <span className={`badge ${getScoreBadgeClass(score)}`}>
                                                        {classification}
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-warning text-dark">Pending</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="btn-group" role="group">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => openEligibilityModal(applicant)}
                                                        title="View Details"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </button>

                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Eligibility Modal */}
            {selectedApplicant && (
                <div
                    className={`modal ${showEligibilityModal ? 'show d-block' : 'd-none'}`}
                    tabIndex={-1}
                    style={{
                        backgroundColor: showEligibilityModal ? 'rgba(0,0,0,0.5)' : 'transparent',
                        transition: 'all 0.3s ease'
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            closeEligibilityModal();
                        }
                    }}
                >
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-medal me-2"></i>
                                    Scholarship Eligibility Assessment - {selectedApplicant.first_name} {selectedApplicant.last_name}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeEligibilityModal}
                                    aria-label="Close"
                                ></button>
                            </div>

                            <div className="modal-body">
                                <div className="row g-4">
                                    {/* Eligibility Metrics */}
                                    <div className="col-lg-8">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Indigenous Peoples (IP) Affiliation</label>
                                                <div className="input-group">
                                                    <span className="input-group-text">
                                                        <i className="fas fa-users"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={selectedApplicant?.ip_affiliation || "Not Applicable"}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">4Ps Beneficiary</label>
                                                <div className="input-group">
                                                    <span className="input-group-text">
                                                        <i className="fas fa-shield-alt"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={selectedApplicant.is_4ps_member ? "Yes" : "No"}
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
                                                        <i className="fas fa-graduation-cap"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={modalGwa}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-3">
                                                <h5 className=" border-bottom pb-2">
                                                    <i className="bi bi-award-fill me-2"></i>Recommended Scholarships
                                                </h5>

                                                {recommendedScholarships.length > 0 ? (
                                                    <div className="row">
                                                        {recommendedScholarships.map((scholarship, index) => (
                                                            <div className="col-md-6 col-lg-6 mb-4" key={index}>
                                                                <div className="card h-100 shadow-sm border-0">
                                                                    <div className="card-body d-flex flex-column justify-content-between">
                                                                        <div>
                                                                            <h6 className="card-title fw-bold">{scholarship.name}</h6>
                                                                            <p className="card-text text-muted small mb-3">
                                                                                {scholarship.description || "No description available."}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="alert alert-info">No scholarship recommendations yet.</div>
                                                )}


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
                                                        {selectedApplicant?.score !== undefined ? `${(selectedApplicant.score * 100).toFixed(2)}%` : "—"}
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label fw-semibold small">Classification</label>
                                                    <div>
                                                        <span className={`badge fs-6 ${
                                                            selectedApplicant?.classification === 'Qualified' ? 'bg-success' :
                                                                selectedApplicant?.classification === 'Not Qualified' ? 'bg-danger' :
                                                                    'bg-secondary'
                                                        }`}>
                                                            {selectedApplicant?.classification || "Pending Evaluation"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-4 pt-3 border-top">
                                    {!selectedApplicant?.score ? (
                                        <div className="d-flex justify-content-center">
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-lg px-5"
                                                onClick={() => evaluateSingleApplicant(selectedApplicant.id)}
                                            >
                                                <i className="fas fa-calculator me-2"></i>
                                                Evaluate Eligibility
                                            </button>
                                        </div>
                                    ) : selectedApplicant.status?.toLowerCase() !== "pending" ? (
                                        <div className="text-center">
                                            <div
                                                className={`alert alert-${
                                                    selectedApplicant.status === "approved" ? "success" : "danger"
                                                } d-inline-block px-5 py-3 mb-0`}
                                                role="alert"
                                            >
                                                <i className={`fas ${
                                                    selectedApplicant.status === "approved" ? "fa-check-circle" : "fa-times-circle"
                                                } me-2`}></i>
                                                <strong>Application {selectedApplicant.status?.toUpperCase()}</strong>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="d-flex justify-content-center gap-3">
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary btn-lg px-4"
                                                onClick={() => evaluateSingleApplicant(selectedApplicant.id)}
                                                title="Re-evaluate this applicant"
                                            >
                                                <i className="fas fa-redo me-2"></i>
                                                Re-evaluate
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-danger btn-lg px-4"
                                                onClick={() => {
                                                    setModalAction('denied');
                                                    setShowDecisionModal(true);
                                                }}
                                            >
                                                <i className="fas fa-times-circle me-2"></i>
                                                Deny Application
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-success btn-lg px-4"
                                                onClick={() => {
                                                    setModalAction('approved');
                                                    setShowDecisionModal(true);
                                                }}
                                            >
                                                <i className="fas fa-check-circle me-2"></i>
                                                Approve Application
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Decision Modal */}
            {selectedApplicant && (
                <div
                    className={`modal ${showDecisionModal ? 'show d-block' : 'd-none'}`}
                    tabIndex={-1}
                    role="dialog"
                    style={{
                        backgroundColor: showDecisionModal ? 'rgba(0,0,0,0.7)' : 'transparent',
                        transition: 'all 0.3s ease',
                        zIndex: 1060
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            closeDecisionModal();
                        }
                    }}
                >
                    <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                        <div className="modal-content">
                            <div className={`modal-header ${modalAction === 'approved' ? 'bg-success' : 'bg-danger'} text-white`}>
                                <h5 className="modal-title text-capitalize">
                                    <i className={`fas ${modalAction === 'approved' ? 'fa-check-circle' : 'fa-times-circle'} me-2`}></i>
                                    {modalAction} Application
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={closeDecisionModal}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="alert alert-info border-0 mb-4" role="alert">
                                    <i className="fas fa-info-circle me-2"></i>
                                    <strong>Applicant:</strong> {selectedApplicant.first_name} {selectedApplicant.last_name}
                                    <br />
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
                                        <small className={remarks.trim().length < 10 ? 'text-danger' : 'text-success'}>
                                            {remarks.trim().length}/10 characters minimum
                                        </small>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer bg-light">
                                <button type="button" className="btn btn-outline-secondary btn-lg" onClick={closeDecisionModal}>
                                    <i className="fas fa-times me-2"></i>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${modalAction === 'approved' ? 'btn-success' : 'btn-danger'} btn-lg px-4`}
                                    disabled={!remarks.trim() || remarks.trim().length < 10}
                                    onClick={() => handleApplicationStatus(selectedApplicant.id, modalAction!, remarks)}
                                >
                                    <i className={`fas ${modalAction === 'approved' ? 'fa-check-circle' : 'fa-times-circle'} me-2`}></i>
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

export default BulkEvaluation;