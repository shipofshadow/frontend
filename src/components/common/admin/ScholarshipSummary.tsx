// components/ScholarshipSummary.tsx
import React, { useState, useEffect } from 'react';
import {useAuth} from "../../../context/AuthContext.tsx";
import {API_BASE_URL} from "../../../config.ts";
import type {ApplicationData, StudentInfo, SummaryStatistics} from "../../../interfaces/scholarship_summary.ts";
interface ScholarshipSummaryResponse {
    student_info: StudentInfo;
    summary_statistics: SummaryStatistics;
    applications: ApplicationData[];
    generated_at: string;
}

interface ScholarshipSummaryProps {
    studentId: number | string | undefined;
}


const ScholarshipSummary: React.FC<ScholarshipSummaryProps> = ({ studentId }) => {
    const { token } = useAuth();
    const [data, setData] = useState<ScholarshipSummaryResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedApplications, setExpandedApplications] = useState<Set<number>>(new Set());


    useEffect(() => {
        fetchScholarshipSummary();
    }, [studentId, token]);

    const fetchScholarshipSummary = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/api/scholarship-summary/${studentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: ScholarshipSummaryResponse = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch scholarship summary');
            console.error('Error fetching scholarship summary:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string): string => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return 'Invalid Date';
        }
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const getStatusBadgeClass = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'approved': return 'badge bg-success';
            case 'pending': return 'badge bg-warning text-dark';
            case 'denied': return 'badge bg-danger';
            case 'awarded': return 'badge bg-primary';
            case 'selected': return 'badge bg-info';
            case 'cancelled': return 'badge bg-secondary';
            default: return 'badge bg-light text-dark';
        }
    };

    const getClassificationBadgeClass = (classification: string): string => {
        switch (classification.toLowerCase()) {
            case 'eligible': return 'badge bg-success';
            case 'somewhat eligible': return 'badge bg-warning text-dark';
            case 'barely eligible': return 'badge bg-info';
            case 'not eligible': return 'badge bg-danger';
            default: return 'badge bg-light text-dark';
        }
    };

    const toggleApplicationExpansion = (applicationId: number): void => {
        const newExpanded = new Set(expandedApplications);
        if (newExpanded.has(applicationId)) {
            newExpanded.delete(applicationId);
        } else {
            newExpanded.add(applicationId);
        }
        setExpandedApplications(newExpanded);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Error</h4>
                <p>Failed to load scholarship summary: {error}</p>
                <button className="btn btn-outline-danger" onClick={fetchScholarshipSummary}>
                    <i className="fas fa-retry me-2"></i>Try Again
                </button>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="alert alert-info" role="alert">
                No scholarship data found for this student.
            </div>
        );
    }

    return (
        <div className="scholarship-summary">

            {/* Summary Statistics - Enhanced Grid Layout */}
            <div className="container-fluid mb-4">
                <div className="row g-4">
                    <div className="col-12 col-sm-6 col-lg-3">
                        <div className="card border-0 shadow-sm h-100 overflow-hidden">
                            <div className="card-body text-center p-4 position-relative">
                                <div className="position-absolute top-0 end-0 opacity-5">
                                    <i className="fas fa-file-alt" style={{ fontSize: '4rem' }}></i>
                                </div>
                                <div className="position-relative">
                                    <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                                        <i className="fas fa-file-alt text-primary fs-2"></i>
                                    </div>
                                    <h2 className="text-primary fw-bold mb-2 display-6">{data.summary_statistics.total_applications}</h2>
                                    <p className="text-muted mb-0 fw-medium">Total Applications</p>
                                </div>
                            </div>
                            <div className="card-footer bg-light border-0 text-center py-3">
                                <small className="text-muted fw-medium">
                                    <i className="fas fa-clock me-1"></i>
                                    All periods
                                </small>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-3">
                        <div className="card border-0 shadow-sm h-100 overflow-hidden">
                            <div className="card-body text-center p-4 position-relative">
                                <div className="position-absolute top-0 end-0 opacity-5">
                                    <i className="fas fa-trophy" style={{ fontSize: '4rem' }}></i>
                                </div>
                                <div className="position-relative">
                                    <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                                        <i className="fas fa-trophy text-success fs-2"></i>
                                    </div>
                                    <h2 className="text-success fw-bold mb-2 display-6">{data.summary_statistics.total_awards}</h2>
                                    <p className="text-muted mb-0 fw-medium">Awards Received</p>
                                </div>
                            </div>
                            <div className="card-footer bg-light border-0 text-center py-3">
                                <small className="text-muted fw-medium">
                                    <i className="fas fa-award me-1"></i>
                                    Successfully awarded
                                </small>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-3">
                        <div className="card border-0 shadow-sm h-100 overflow-hidden">
                            <div className="card-body text-center p-4 position-relative">
                                <div className="position-absolute top-0 end-0 opacity-5">
                                    <i className="fas fa-chart-line" style={{ fontSize: '4rem' }}></i>
                                </div>
                                <div className="position-relative">
                                    <div className="bg-info bg-opacity-10 rounded-circle p-3 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                                        <i className="fas fa-chart-line text-info fs-2"></i>
                                    </div>
                                    <h2 className="text-info fw-bold mb-2 display-6">
                                        {data.summary_statistics.average_gwa ? data.summary_statistics.average_gwa.toFixed(2) : 'N/A'}
                                    </h2>
                                    <p className="text-muted mb-0 fw-medium">Average GWA</p>
                                </div>
                            </div>
                            <div className="card-footer bg-light border-0 text-center py-3">
                                <small className="text-muted fw-medium">
                                    <i className="fas fa-graduation-cap me-1"></i>
                                    Academic performance
                                </small>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-3">
                        <div className="card border-0 shadow-sm h-100 overflow-hidden">
                            <div className="card-body text-center p-4 position-relative">
                                <div className="position-absolute top-0 end-0 opacity-5">
                                    <i className="fas fa-money-bill-wave" style={{ fontSize: '4rem' }}></i>
                                </div>
                                <div className="position-relative">
                                    <div className="bg-warning bg-opacity-10 rounded-circle p-3 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                                        <i className="fas fa-money-bill-wave text-warning fs-2"></i>
                                    </div>
                                    <h2 className="text-warning fw-bold mb-2 display-6">
                                        {formatCurrency(data.summary_statistics.total_awarded_amount)}
                                    </h2>
                                    <p className="text-muted mb-0 fw-medium">Total Awarded</p>
                                </div>
                            </div>
                            <div className="card-footer bg-light border-0 text-center py-3">
                                <small className="text-muted fw-medium">
                                    <i className="fas fa-dollar-sign me-1"></i>
                                    Financial support
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Metrics - Improved Card Design */}
            <div className="container-fluid mb-4">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-gradient-primary text-dark py-3">
                        <div className="d-flex align-items-center">
                            <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                                <i className="fas fa-chart-bar text-primary"></i>
                            </div>
                            <div>
                                <h5 className="mb-1 fw-bold">Performance Metrics</h5>
                                <p className="mb-0 small opacity-90">Application and award success rates</p>
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-4">
                        <div className="row g-4">
                            <div className="col-12 col-md-6">
                                <div className="card bg-light border-0 h-100">
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-check-circle text-success fs-4 me-3"></i>
                                                <h6 className="fw-bold mb-0">Approval Rate</h6>
                                            </div>
                                            <span className="badge bg-success fs-5 px-3 py-2">
                                        {data.summary_statistics.approval_rate}%
                                    </span>
                                        </div>
                                        <div className="progress mb-3" style={{ height: '16px' }}>
                                            <div
                                                className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                                                role="progressbar"
                                                style={{ width: `${data.summary_statistics.approval_rate}%` }}
                                                aria-valuenow={data.summary_statistics.approval_rate}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                            ></div>
                                        </div>
                                        <p className="text-muted mb-0 small">
                                            <i className="fas fa-info-circle me-1"></i>
                                            Applications approved vs total submitted
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-md-6">
                                <div className="card bg-light border-0 h-100">
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-award text-primary fs-4 me-3"></i>
                                                <h6 className="fw-bold mb-0">Award Rate</h6>
                                            </div>
                                            <span className="badge bg-primary fs-5 px-3 py-2">
                                        {data.summary_statistics.award_rate}%
                                    </span>
                                        </div>
                                        <div className="progress mb-3" style={{ height: '16px' }}>
                                            <div
                                                className="progress-bar bg-primary progress-bar-striped progress-bar-animated"
                                                role="progressbar"
                                                style={{ width: `${data.summary_statistics.award_rate}%` }}
                                                aria-valuenow={data.summary_statistics.award_rate}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                            ></div>
                                        </div>
                                        <p className="text-muted mb-0 small">
                                            <i className="fas fa-info-circle me-1"></i>
                                            Applications awarded vs approved
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Applications Timeline - Enhanced Mobile-First Design */}
            <div className="container-fluid">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-gradient-info text-dark py-3">
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
                            <div className="d-flex align-items-center mb-2 mb-sm-0">
                                <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                                    <i className="fas fa-history text-primary"></i>
                                </div>
                                <div>
                                    <h5 className="mb-1 fw-bold">Applications Timeline</h5>
                                    <p className="mb-0 small opacity-90">Chronological overview of all applications</p>
                                </div>
                            </div>
                            {data.applications.length > 0 && (
                                <span className="badge bg-white text-info fs-6 px-3 py-2">
                            {data.applications.length} Application{data.applications.length !== 1 ? 's' : ''}
                        </span>
                            )}
                        </div>
                    </div>

                    <div className="card-body p-4">
                        {data.applications.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="bg-light rounded-circle p-4 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '120px', height: '120px' }}>
                                    <i className="fas fa-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                                </div>
                                <h5 className="text-muted mb-3">No Applications Found</h5>
                                <p className="text-muted mb-0">No scholarship applications have been submitted by this student yet.</p>
                            </div>
                        ) : (
                            <div className="timeline position-relative">
                                {data.applications.map((appData, index) => (
                                    <div key={appData.application.id} className="timeline-item mb-4 position-relative">
                                        {/* Timeline connector for larger screens */}
                                        {index < data.applications.length - 1 && (
                                            <div className="timeline-connector position-absolute d-none d-md-block"
                                                 style={{
                                                     left: '30px',
                                                     top: '90px',
                                                     width: '3px',
                                                     height: 'calc(100% + 30px)',
                                                     background: 'linear-gradient(to bottom, #dee2e6, transparent)'
                                                 }}>
                                            </div>
                                        )}

                                        <div className="row">
                                            <div className="col-12">
                                                <div className="card border-0 shadow-sm position-relative">
                                                    {/* Timeline dot for larger screens */}
                                                    <div className="timeline-dot position-absolute bg-white shadow-sm border border-3 rounded-circle d-none d-md-flex align-items-center justify-content-center"
                                                         style={{
                                                             left: '-15px',
                                                             top: '30px',
                                                             width: '60px',
                                                             height: '60px',
                                                             borderColor: appData.application.status === 'approved' ? '#28a745' :
                                                                 appData.application.status === 'denied' ? '#dc3545' : '#6c757d'
                                                         }}>
                                                        <i className={`fas ${
                                                            appData.application.status === 'approved' ? 'fa-check text-success' :
                                                                appData.application.status === 'denied' ? 'fa-times text-danger' :
                                                                    'fa-clock text-secondary'
                                                        } fs-4`}></i>
                                                    </div>

                                                    <div className="card-header bg-light border-0 py-3">
                                                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                                                            <div className="mb-2 mb-md-0">
                                                                <h6 className="fw-bold mb-2">
                                                                    <i className="fas fa-calendar text-primary me-2"></i>
                                                                    {appData.application.academic_year} - {appData.application.semester}
                                                                </h6>
                                                                <div className="d-flex flex-wrap align-items-center gap-3">
                                                                    <small className="text-muted d-flex align-items-center">
                                                                        <i className="fas fa-clock me-1"></i>
                                                                        Submitted: {formatDate(appData.application.submitted_at)}
                                                                    </small>
                                                                    <span className={`badge ${getStatusBadgeClass(appData.application.status)} d-md-none`}>
                                                                {appData.application.status.charAt(0).toUpperCase() + appData.application.status.slice(1)}
                                                            </span>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-2">
                                                        <span className={`badge ${getStatusBadgeClass(appData.application.status)} d-none d-md-inline px-3 py-2`}>
                                                            {appData.application.status.charAt(0).toUpperCase() + appData.application.status.slice(1)}
                                                        </span>
                                                                <button
                                                                    className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                                                                    onClick={() => toggleApplicationExpansion(appData.application.id)}
                                                                    data-bs-toggle="tooltip"
                                                                    title={expandedApplications.has(appData.application.id) ? 'Collapse details' : 'Expand details'}
                                                                >
                                                                    <i className={`fas fa-chevron-${expandedApplications.has(appData.application.id) ? 'up' : 'down'}`}></i>
                                                                    <span className="d-none d-sm-inline ms-2">
                                                                {expandedApplications.has(appData.application.id) ? 'Less' : 'More'}
                                                            </span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {expandedApplications.has(appData.application.id) && (
                                                        <div className="card-body p-4">
                                                            {/* Application Remarks */}
                                                            {appData.application.remarks && (
                                                                <div className="alert alert-info border-0 mb-4" role="alert">
                                                                    <div className="d-flex">
                                                                        <i className="fas fa-info-circle me-3 mt-1"></i>
                                                                        <div className="flex-grow-1">
                                                                            <h6 className="alert-heading fw-bold">Application Remarks</h6>
                                                                            <p className="mb-0">{appData.application.remarks}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Evaluation Section */}
                                                            {appData.evaluation && (
                                                                <div className="mb-4">
                                                                    <div className="d-flex align-items-center mb-3">
                                                                        <h6 className="text-primary fw-bold mb-0">
                                                                            <i className="fas fa-calculator me-2"></i>
                                                                            Evaluation Results
                                                                        </h6>
                                                                    </div>
                                                                    <div className="row g-3">
                                                                        <div className="col-12 col-lg-8">
                                                                            <div className="card bg-light border-0 h-100">
                                                                                <div className="card-body p-4">
                                                                                    <h6 className="text-muted mb-3 fw-semibold">ACADEMIC & FINANCIAL DATA</h6>
                                                                                    <div className="row g-3">
                                                                                        <div className="col-12 col-sm-4">
                                                                                            <div className="text-center p-3 bg-white rounded-3">
                                                                                                <div className="fw-bold text-primary fs-4">{appData.evaluation.gwa.toFixed(2)}</div>
                                                                                                <small className="text-muted fw-medium">GWA</small>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="col-12 col-sm-4">
                                                                                            <div className="text-center p-3 bg-white rounded-3">
                                                                                                <div className="fw-bold text-info fs-4">{appData.evaluation.total_units}</div>
                                                                                                <small className="text-muted fw-medium">Total Units</small>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="col-12 col-sm-4">
                                                                                            <div className="text-center p-3 bg-white rounded-3">
                                                                                                <div className="fw-bold text-success fs-4">{formatCurrency(appData.evaluation.income)}</div>
                                                                                                <small className="text-muted fw-medium">Family Income</small>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-12 col-lg-4">
                                                                            <div className="card bg-light border-0 h-100">
                                                                                <div className="card-body p-4 text-center">
                                                                                    <h6 className="text-muted mb-3 fw-semibold">EVALUATION SCORE</h6>
                                                                                    <div className="mb-3">
                                                                                        <div className="score-circle mx-auto mb-3 position-relative d-inline-flex align-items-center justify-content-center"
                                                                                             style={{
                                                                                                 width: '100px',
                                                                                                 height: '100px',
                                                                                                 borderRadius: '50%',
                                                                                                 background: `conic-gradient(#007bff ${(appData.evaluation.score * 100) * 3.6}deg, #e9ecef 0deg)`
                                                                                             }}>
                                                                                            <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                                                                                 style={{ width: '75px', height: '75px' }}>
                                                                                                <span className="fw-bold text-primary fs-5">{(appData.evaluation.score * 100).toFixed(0)}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="small text-muted">Score out of 100</div>
                                                                                    </div>
                                                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                                                        <span className="fw-medium">Classification:</span>
                                                                                        <span className={`badge ${getClassificationBadgeClass(appData.evaluation.classification)}`}>
                                                                                    {appData.evaluation.classification}
                                                                                </span>
                                                                                    </div>

                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Selected/Awarded Scholarships */}
                                                            {appData.selected_scholarships.length > 0 && (
                                                                <div className="mb-4">
                                                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                                                        <h6 className="text-success fw-bold mb-0">
                                                                            <i className="fas fa-award me-2"></i>
                                                                            Selected/Awarded Scholarships
                                                                        </h6>
                                                                        <span className="badge bg-success">
                                                                    {appData.selected_scholarships.length} Award{appData.selected_scholarships.length !== 1 ? 's' : ''}
                                                                </span>
                                                                    </div>
                                                                    <div className="table-responsive">
                                                                        <table className="table table-hover mb-0">
                                                                            <thead className="table-light">
                                                                            <tr>
                                                                                <th className="border-0 fw-semibold">Scholarship</th>
                                                                                <th className="border-0 fw-semibold text-center">Status</th>
                                                                                <th className="border-0 fw-semibold d-none d-sm-table-cell">Grant Amount</th>
                                                                                <th className="border-0 fw-semibold d-none d-sm-table-cell">Awarded Amount</th>
                                                                                <th className="border-0 fw-semibold d-none d-md-table-cell">Date</th>
                                                                            </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                            {appData.selected_scholarships.map((scholarship) => (
                                                                                <tr key={scholarship.id} className="align-middle">
                                                                                    <td>
                                                                                        <div>
                                                                                            <div className="fw-semibold text-dark">{scholarship.scholarship_name}</div>
                                                                                            {scholarship.scholarship_description && (
                                                                                                <small className="text-muted d-block mt-1">
                                                                                                    {scholarship.scholarship_description}
                                                                                                </small>
                                                                                            )}
                                                                                            <div className="d-sm-none mt-2">
                                                                                                <div className="small text-muted">
                                                                                                    Grant: <span className="fw-medium">{formatCurrency(scholarship.grant_amount)}</span>
                                                                                                </div>
                                                                                                <div className="small text-muted">
                                                                                                    Awarded: <span className="fw-medium text-success">
                                                                                                    {scholarship.awarded_amount
                                                                                                        ? formatCurrency(scholarship.awarded_amount)
                                                                                                        : scholarship.status === 'awarded'
                                                                                                            ? formatCurrency(scholarship.grant_amount)
                                                                                                            : '-'
                                                                                                    }
                                                                                                </span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="text-center">
                                                                                    <span className={`badge ${getStatusBadgeClass(scholarship.status)}`}>
                                                                                        {scholarship.status.charAt(0).toUpperCase() + scholarship.status.slice(1)}
                                                                                    </span>
                                                                                    </td>
                                                                                    <td className="d-none d-sm-table-cell">
                                                                                        <span className="fw-medium">{formatCurrency(scholarship.grant_amount)}</span>
                                                                                    </td>
                                                                                    <td className="d-none d-sm-table-cell">
                                                                                    <span className="fw-medium text-success">
                                                                                        {scholarship.awarded_amount
                                                                                            ? formatCurrency(scholarship.awarded_amount)
                                                                                            : scholarship.status === 'awarded'
                                                                                                ? formatCurrency(scholarship.grant_amount)
                                                                                                : '-'
                                                                                        }
                                                                                    </span>
                                                                                    </td>
                                                                                    <td className="d-none d-md-table-cell">
                                                                                        <small className="text-muted">
                                                                                            <i className="fas fa-calendar me-1"></i>
                                                                                            {formatDate(scholarship.selected_at)}
                                                                                        </small>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Recommended Scholarships */}
                                                            {appData.recommended_scholarships.length > 0 && (
                                                                <div className="mb-4">
                                                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                                                        <h6 className="text-info fw-bold mb-0">
                                                                            <i className="fas fa-lightbulb me-2"></i>
                                                                            Recommended Scholarships
                                                                        </h6>
                                                                        <span className="badge bg-info">
                                                                    {appData.recommended_scholarships.length} Recommendation{appData.recommended_scholarships.length !== 1 ? 's' : ''}
                                                                </span>
                                                                    </div>
                                                                    <div className="table-responsive">
                                                                        <table className="table table-hover mb-0">
                                                                            <thead className="table-light">
                                                                            <tr>
                                                                                <th className="border-0 fw-semibold">Scholarship</th>
                                                                                <th className="border-0 fw-semibold d-none d-sm-table-cell">Amount</th>
                                                                                <th className="border-0 fw-semibold text-center">Score</th>
                                                                                <th className="border-0 fw-semibold text-center d-none d-md-table-cell">Classification</th>
                                                                                <th className="border-0 fw-semibold d-none d-lg-table-cell">Eligibility</th>
                                                                            </tr>
                                                                            </thead>
                                                                            <tbody>


                                                                            {appData.recommended_scholarships.map((scholarship) => (
                                                                                <tr key={scholarship.id} className="align-middle">
                                                                                    <td>
                                                                                        <div>
                                                                                            <div className="fw-semibold text-dark">{scholarship.scholarship_name}</div>
                                                                                            {scholarship.scholarship_description && (
                                                                                                <small className="text-muted d-block mt-1">
                                                                                                    {scholarship.scholarship_description}
                                                                                                </small>
                                                                                            )}
                                                                                            <div className="d-sm-none mt-2">
                                                                                            <span className="badge bg-success me-2">
                                                                                                {formatCurrency(scholarship.grant_amount)}
                                                                                            </span>
                                                                                                <span className={`badge ${getClassificationBadgeClass(scholarship.classification)} d-md-none`}>
                                                                                                {scholarship.classification}
                                                                                            </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="d-none d-sm-table-cell">
                                                                                    <span className="fw-medium text-success">
                                                                                        {formatCurrency(scholarship.grant_amount)}
                                                                                    </span>
                                                                                    </td>
                                                                                    <td className="text-center">
                                                                                    <span className="badge bg-primary fw-bold">
                                                                                        {(scholarship.score).toFixed(2)}%
                                                                                    </span>
                                                                                    </td>
                                                                                    <td className="text-center d-none d-md-table-cell">
                                                                                    <span className={`badge ${getClassificationBadgeClass(scholarship.classification)}`}>
                                                                                        {scholarship.classification}
                                                                                    </span>
                                                                                    </td>
                                                                                    <td className="d-none d-lg-table-cell">
                                                                                        {scholarship.eligibility_reasons && (
                                                                                            <small className="text-muted">
                                                                                                {typeof scholarship.eligibility_reasons === 'string'
                                                                                                    ? scholarship.eligibility_reasons
                                                                                                    : Array.isArray(scholarship.eligibility_reasons)
                                                                                                        ? scholarship.eligibility_reasons.join(', ')
                                                                                                        : JSON.stringify(scholarship.eligibility_reasons)
                                                                                                }
                                                                                            </small>
                                                                                        )}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            )}



                                                            {/* No Additional Data Message */}
                                                            {!appData.evaluation && appData.recommended_scholarships.length === 0 && appData.selected_scholarships.length === 0 && (
                                                                <div className="text-center py-4">
                                                                    <div className="bg-light rounded-3 p-4 d-inline-block">
                                                                        <i className="fas fa-info-circle text-muted fs-2 mb-3"></i>
                                                                        <h6 className="text-muted fw-medium">No Additional Data</h6>
                                                                        <p className="text-muted small mb-0">No evaluation or scholarship data available for this application.</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ScholarshipSummary;