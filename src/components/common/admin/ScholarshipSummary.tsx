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

        </div>

    );
};

export default ScholarshipSummary;