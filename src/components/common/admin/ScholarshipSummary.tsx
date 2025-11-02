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
                    <i className="fas fa-redo me-2"></i>Try Again
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
            {/* Summary Statistics */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-lg-4">
                    <div className="card border h-100">
                        <div className="card-body text-center">
                            <div className="mb-3">
                                <i className="fas fa-file-alt text-primary" style={{ fontSize: '2.5rem' }}></i>
                            </div>
                            <h2 className="fw-bold text-primary mb-2">{data.summary_statistics.total_applications}</h2>
                            <p className="text-muted mb-0 small">Total Applications</p>
                        </div>
                    </div>
                </div>


                <div className="col-12 col-sm-6 col-lg-4">
                    <div className="card border h-100">
                        <div className="card-body text-center">
                            <div className="mb-3">
                                <i className="fas fa-chart-line text-info" style={{ fontSize: '2.5rem' }}></i>
                            </div>
                            <h2 className="fw-bold text-info mb-2">
                                {data.summary_statistics.average_gwa ? data.summary_statistics.average_gwa.toFixed(2) : 'N/A'}
                            </h2>
                            <p className="text-muted mb-0 small">Average GWA</p>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-4">
                    <div className="card border h-100">
                        <div className="card-body text-center">
                            <div className="mb-3">
                                <i className="fas fa-money-bill-wave text-warning" style={{ fontSize: '2.5rem' }}></i>
                            </div>
                            <h3 className="fw-bold text-warning mb-2" style={{ fontSize: '1.5rem' }}>
                                {formatCurrency(data.summary_statistics.total_awarded_amount)}
                            </h3>
                            <p className="text-muted mb-0 small">Total Awarded</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="card border mb-4">
                <div className="card-header bg-white border-bottom">
                    <h5 className="mb-0 fw-bold">
                        <i className="fas fa-chart-bar me-2 text-primary"></i>
                        Performance Metrics
                    </h5>
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-12 col-md-12">
                            <div className="p-3 bg-light rounded">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="mb-0 fw-bold">
                                        <i className="fas fa-check-circle text-success me-2"></i>
                                        Approval Rate
                                    </h6>
                                    <span className="badge bg-success">{data.summary_statistics.approval_rate}%</span>
                                </div>
                                <div className="progress" style={{ height: '10px' }}>
                                    <div
                                        className="progress-bar bg-success"
                                        role="progressbar"
                                        style={{ width: `${data.summary_statistics.approval_rate}%` }}
                                        aria-valuenow={data.summary_statistics.approval_rate}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                    ></div>
                                </div>
                                <small className="text-muted mt-2 d-block">Applications approved vs total submitted</small>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Applications Timeline */}
            <div className="card border">
                <div className="card-header bg-primary text-white">
                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <h5 className="mb-0 fw-bold">
                            <i className="fas fa-history me-2"></i>
                            Applications Timeline
                        </h5>
                        {data.applications.length > 0 && (
                            <span className="badge bg-white text-primary">
                                {data.applications.length} Application{data.applications.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>

                <div className="card-body">
                    {data.applications.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fas fa-inbox text-muted mb-3" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                            <h5 className="text-muted">No Applications Found</h5>
                            <p className="text-muted">Your scholarship application journey will begin here.</p>
                        </div>
                    ) : (
                        <div className="timeline">
                            {data.applications.map((appData) => (
                                <div key={appData.application.id} className="mb-4">
                                    <div className="card border">
                                        <div className="card-header bg-light border-bottom-0">
                                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                                <div>
                                                    <h5 className="mb-1 fw-bold">
                                                        <i className="fas fa-graduation-cap text-primary me-2"></i>
                                                        {appData.application.academic_year}
                                                    </h5>
                                                    <p className="mb-0 text-muted small">
                                                        <i className="fas fa-calendar-alt me-1"></i>
                                                        {appData.application.semester}
                                                    </p>
                                                    <small className="text-muted">
                                                        <i className="fas fa-clock me-1"></i>
                                                        Submitted: {formatDate(appData.application.submitted_at)}
                                                    </small>
                                                </div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className={getStatusBadgeClass(appData.application.status)}>
                                                        {appData.application.status.charAt(0).toUpperCase() + appData.application.status.slice(1)}
                                                    </span>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => toggleApplicationExpansion(appData.application.id)}
                                                    >
                                                        <i className={`fas fa-chevron-${expandedApplications.has(appData.application.id) ? 'up' : 'down'}`}></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {expandedApplications.has(appData.application.id) && (
                                            <div className="card-body">
                                                {/* Application Remarks */}
                                                {appData.application.remarks && (
                                                    <div className="alert alert-info mb-3">
                                                        <h6 className="alert-heading fw-bold">
                                                            <i className="fas fa-comment-alt me-2"></i>
                                                            Remarks
                                                        </h6>
                                                        <p className="mb-0">{appData.application.remarks}</p>
                                                    </div>
                                                )}

                                                {/* Evaluation Section */}
                                                {appData.evaluation && (
                                                    <div className="mb-4">
                                                        <h6 className="fw-bold mb-3">
                                                            <i className="fas fa-chart-bar text-primary me-2"></i>
                                                            Evaluation Results
                                                        </h6>
                                                        <div className="row g-3">
                                                            <div className="col-12 col-lg-8">
                                                                <div className="row g-3">
                                                                    <div className="col-12 col-sm-4">
                                                                        <div className="card bg-primary text-white text-center">
                                                                            <div className="card-body">
                                                                                <i className="fas fa-star mb-2" style={{ fontSize: '1.5rem' }}></i>
                                                                                <h3 className="mb-0">{appData.evaluation.gwa.toFixed(2)}</h3>
                                                                                <small>GWA</small>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-12 col-sm-4">
                                                                        <div className="card bg-info text-white text-center">
                                                                            <div className="card-body">
                                                                                <i className="fas fa-book-open mb-2" style={{ fontSize: '1.5rem' }}></i>
                                                                                <h3 className="mb-0">{appData.evaluation.total_units}</h3>
                                                                                <small>Total Units</small>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-12 col-sm-4">
                                                                        <div className="card bg-success text-white text-center">
                                                                            <div className="card-body">
                                                                                <i className="fas fa-dollar-sign mb-2" style={{ fontSize: '1.5rem' }}></i>
                                                                                <h6 className="mb-0">{formatCurrency(appData.evaluation.income)}</h6>
                                                                                <small>Family Income</small>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-12 col-lg-4">
                                                                <div className="card border h-100">
                                                                    <div className="card-body text-center">
                                                                        <h6 className="fw-bold mb-3">Evaluation Score</h6>
                                                                        <div className="mb-3">
                                                                            <div className="display-4 fw-bold text-primary">
                                                                                {(appData.evaluation.score * 100).toFixed(0)}%
                                                                            </div>
                                                                        </div>
                                                                        <span className={getClassificationBadgeClass(appData.evaluation.classification)}>
                                                                            {appData.evaluation.classification}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Selected/Awarded Scholarships */}
                                                {appData.selected_scholarships.length > 0 && (
                                                    <div className="mb-4">
                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                            <h6 className="fw-bold mb-0">
                                                                <i className="fas fa-trophy text-success me-2"></i>
                                                                Selected/Awarded Scholarships
                                                            </h6>
                                                            <span className="badge bg-success">
                                                                {appData.selected_scholarships.length} Award{appData.selected_scholarships.length !== 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                        <div className="table-responsive">
                                                            <table className="table table-bordered table-hover mb-0">
                                                                <thead className="table-light">
                                                                <tr>
                                                                    <th>Scholarship</th>
                                                                    <th className="text-center">Status</th>
                                                                    <th className="d-none d-sm-table-cell">Grant Amount</th>
                                                                    <th className="d-none d-sm-table-cell">Awarded Amount</th>
                                                                    <th className="d-none d-md-table-cell">Date</th>
                                                                </tr>
                                                                </thead>
                                                                <tbody>
                                                                {appData.selected_scholarships.map((scholarship) => (
                                                                    <tr key={scholarship.id}>
                                                                        <td>
                                                                            <div className="fw-bold">{scholarship.scholarship_name}</div>
                                                                            {scholarship.scholarship_description && (
                                                                                <small className="text-muted d-block">{scholarship.scholarship_description}</small>
                                                                            )}
                                                                        </td>
                                                                        <td className="text-center">
                                                                                <span className={getStatusBadgeClass(scholarship.status)}>
                                                                                    {scholarship.status.charAt(0).toUpperCase() + scholarship.status.slice(1)}
                                                                                </span>
                                                                        </td>
                                                                        <td className="d-none d-sm-table-cell">{formatCurrency(scholarship.grant_amount)}</td>
                                                                        <td className="d-none d-sm-table-cell">
                                                                            {scholarship.awarded_amount
                                                                                ? formatCurrency(scholarship.awarded_amount)
                                                                                : scholarship.status === 'awarded'
                                                                                    ? formatCurrency(scholarship.grant_amount)
                                                                                    : '-'
                                                                            }
                                                                        </td>
                                                                        <td className="d-none d-md-table-cell">
                                                                            <small>{formatDate(scholarship.selected_at)}</small>
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
                                                    <div>
                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                            <h6 className="fw-bold mb-0">
                                                                <i className="fas fa-lightbulb text-warning me-2"></i>
                                                                Recommended Scholarships
                                                            </h6>
                                                            <span className="badge bg-info">
                                                                {appData.recommended_scholarships.length} Recommendation{appData.recommended_scholarships.length !== 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                        <div className="table-responsive">
                                                            <table className="table table-bordered table-hover mb-0">
                                                                <thead className="table-light">
                                                                <tr>
                                                                    <th>Scholarship</th>
                                                                    <th className="d-none d-sm-table-cell">Amount</th>
                                                                    <th className="text-center">Score</th>
                                                                    <th className="text-center d-none d-md-table-cell">Classification</th>
                                                                </tr>
                                                                </thead>
                                                                <tbody>
                                                                {appData.recommended_scholarships.map((scholarship) => (
                                                                    <tr key={scholarship.id}>
                                                                        <td>
                                                                            <div className="fw-bold">{scholarship.scholarship_name}</div>
                                                                            {scholarship.scholarship_description && (
                                                                                <small className="text-muted d-block">{scholarship.scholarship_description}</small>
                                                                            )}
                                                                        </td>
                                                                        <td className="d-none d-sm-table-cell">{formatCurrency(scholarship.grant_amount)}</td>
                                                                        <td className="text-center">
                                                                            <span className="badge bg-primary">{scholarship.score.toFixed(1)}%</span>
                                                                        </td>
                                                                        <td className="text-center d-none d-md-table-cell">
                                                                                <span className={getClassificationBadgeClass(scholarship.classification)}>
                                                                                    {scholarship.classification}
                                                                                </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* No Additional Data */}
                                                {!appData.evaluation && appData.recommended_scholarships.length === 0 && appData.selected_scholarships.length === 0 && (
                                                    <div className="text-center py-4">
                                                        <i className="fas fa-info-circle text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                                                        <p className="text-muted mb-0">No additional data available for this application.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScholarshipSummary;