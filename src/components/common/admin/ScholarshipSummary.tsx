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
            <div className="container-fluid px-4">
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                    <div className="card-header position-relative py-5" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderBottom: 'none'
                    }}>
                        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                        }}></div>
                        <div className="position-relative">
                            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center">
                                <div className="d-flex align-items-center mb-3 mb-lg-0">
                                    <div className="bg-white bg-opacity-20 backdrop-blur rounded-4 p-4 me-4 shadow-lg">
                                        <i className="fas fa-history text-dark" style={{ fontSize: '2rem' }}></i>
                                    </div>
                                    <div>
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="fas fa-graduation-cap text-white me-3 opacity-75"></i>
                                            <h3 className="mb-0 fw-bold text-white">Applications Timeline</h3>
                                        </div>
                                        <p className="mb-0 text-white opacity-75 fw-medium fs-6">
                                            <i className="fas fa-chart-line me-2"></i>
                                            Comprehensive journey through your scholarship applications
                                        </p>
                                    </div>
                                </div>
                                {data.applications.length > 0 && (
                                    <div className="bg-white bg-opacity-20 backdrop-blur rounded-pill px-4 py-3 shadow-lg">
                                        <div className="d-flex align-items-center text-dark">
                                            <i className="fas fa-file-alt me-3"></i>
                                            <span className="fw-bold fs-5">
                                    {data.applications.length} Application{data.applications.length !== 1 ? 's' : ''}
                                </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card-body p-5" style={{ backgroundColor: '#fafbfc' }}>
                        {data.applications.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="position-relative mb-5">
                                    <div className="rounded-circle p-5 d-inline-flex align-items-center justify-content-center shadow-sm"
                                         style={{ width: '160px', height: '160px', background: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)' }}>
                                        <i className="fas fa-inbox opacity-50" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                                    </div>
                                    <div className="position-absolute top-0 start-50 translate-middle">
                                        <div className="rounded-circle p-3 shadow-lg" style={{ backgroundColor: '#667eea' }}>
                                            <i className="fas fa-plus text-white"></i>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <i className="fas fa-search opacity-25 me-2" style={{ fontSize: '1.5rem', color: '#6c757d' }}></i>
                                    <h4 className="fw-semibold d-inline" style={{ color: '#495057' }}>No Applications Found</h4>
                                </div>
                                <p className="fs-6 mx-auto lh-base" style={{ maxWidth: '480px', color: '#6c757d' }}>
                                    <i className="fas fa-info-circle me-2"></i>
                                    Your scholarship application journey will begin here. Submit your first application to start tracking your progress.
                                </p>
                            </div>
                        ) : (
                            <div className="timeline position-relative">
                                {data.applications.map((appData, index) => (
                                    <div key={appData.application.id} className="timeline-item mb-6 position-relative">
                                        {/* Enhanced Timeline connector */}
                                        {index < data.applications.length - 1 && (
                                            <div className="timeline-connector position-absolute d-none d-lg-block"
                                                 style={{
                                                     left: '35px',
                                                     top: '120px',
                                                     width: '4px',
                                                     height: 'calc(100% + 20px)',
                                                     background: 'linear-gradient(180deg, rgba(102, 126, 234, 0.4) 0%, rgba(102, 126, 234, 0.2) 50%, rgba(102, 126, 234, 0.1) 80%, transparent 100%)',
                                                     borderRadius: '2px'
                                                 }}>
                                            </div>
                                        )}

                                        <div className="row">
                                            <div className="col-12">
                                                <div className="card border-0 shadow-sm position-relative rounded-4 overflow-hidden hover-lift transition-all bg-white">
                                                    {/* Enhanced Timeline dot */}
                                                    <div className="timeline-dot position-absolute bg-white shadow-xl border-0 rounded-circle d-none d-lg-flex align-items-center justify-content-center transition-all"
                                                         style={{
                                                             left: '-18px',
                                                             top: '40px',
                                                             width: '70px',
                                                             height: '70px',
                                                             background: appData.application.status === 'approved'
                                                                 ? 'linear-gradient(135deg, #28a745, #20c997)'
                                                                 : appData.application.status === 'denied'
                                                                     ? 'linear-gradient(135deg, #dc3545, #fd7e14)'
                                                                     : 'linear-gradient(135deg, #6f42c1, #007bff)',
                                                             boxShadow: `0 10px 30px ${appData.application.status === 'approved' ? 'rgba(40, 167, 69, 0.3)' :
                                                                 appData.application.status === 'denied' ? 'rgba(220, 53, 69, 0.3)' : 'rgba(111, 66, 193, 0.3)'}`
                                                         }}>
                                                        <i className={`fas ${
                                                            appData.application.status === 'approved' ? 'fa-check-circle' :
                                                                appData.application.status === 'denied' ? 'fa-times-circle' :
                                                                    'fa-clock'
                                                        } text-white`} style={{ fontSize: '1.5rem' }}></i>
                                                    </div>

                                                    {/* Status indicator bar */}
                                                    <div className="position-absolute top-0 start-0 w-100" style={{
                                                        height: '5px',
                                                        background: appData.application.status === 'approved'
                                                            ? 'linear-gradient(90deg, #28a745, #20c997)'
                                                            : appData.application.status === 'denied'
                                                                ? 'linear-gradient(90deg, #dc3545, #fd7e14)'
                                                                : 'linear-gradient(90deg, #6f42c1, #007bff)'
                                                    }}></div>

                                                    <div className="card-header bg-white border-0 py-4 px-5">
                                                        <div className="d-flex flex-column flex-xl-row justify-content-between align-items-start align-items-xl-center">
                                                            <div className="mb-3 mb-xl-0 flex-grow-1">
                                                                <div className="d-flex align-items-center mb-3">
                                                                    <div className="rounded-3 p-3 me-4" style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
                                                                        <i className="fas fa-calendar-check" style={{ fontSize: '1.25rem', color: '#667eea' }}></i>
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="fw-bold mb-1 d-flex align-items-center" style={{ color: '#212529' }}>
                                                                            <i className="fas fa-graduation-cap me-2 opacity-75" style={{ color: '#667eea' }}></i>
                                                                            {appData.application.academic_year}
                                                                        </h4>
                                                                        <h6 className="fw-semibold mb-0" style={{ color: '#6c757d' }}>
                                                                            <i className="fas fa-calendar-alt me-2"></i>
                                                                            {appData.application.semester}
                                                                        </h6>
                                                                    </div>
                                                                </div>
                                                                <div className="d-flex flex-wrap align-items-center gap-4 ms-5">
                                                                    <div className="d-flex align-items-center" style={{ color: '#6c757d' }}>
                                                                        <i className="fas fa-paper-plane me-2" style={{ color: '#17a2b8' }}></i>
                                                                        <small className="fw-medium">
                                                                            Submitted: {formatDate(appData.application.submitted_at)}
                                                                        </small>
                                                                    </div>
                                                                    <div className="d-xl-none">
                                                            <span className={`badge rounded-pill px-4 py-2 fw-medium d-inline-flex align-items-center ${getStatusBadgeClass(appData.application.status)}`}>
                                                                <i className={`fas ${
                                                                    appData.application.status === 'approved' ? 'fa-check me-2' :
                                                                        appData.application.status === 'denied' ? 'fa-times me-2' :
                                                                            'fa-hourglass-half me-2'
                                                                }`}></i>
                                                                {appData.application.status.charAt(0).toUpperCase() + appData.application.status.slice(1)}
                                                            </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-3">
                                                    <span className={`badge rounded-pill px-4 py-3 fw-semibold d-none d-xl-inline-flex align-items-center ${getStatusBadgeClass(appData.application.status)}`}
                                                          style={{ fontSize: '0.9rem' }}>
                                                        <i className={`fas ${
                                                            appData.application.status === 'approved' ? 'fa-trophy me-2' :
                                                                appData.application.status === 'denied' ? 'fa-exclamation-triangle me-2' :
                                                                    'fa-spinner me-2'
                                                        }`}></i>
                                                        {appData.application.status.charAt(0).toUpperCase() + appData.application.status.slice(1)}
                                                    </span>
                                                                <button
                                                                    className="btn btn-lg rounded-pill px-5 py-2 fw-semibold transition-all hover-shadow d-flex align-items-center"
                                                                    style={{
                                                                        backgroundColor: '#667eea',
                                                                        color: 'white',
                                                                        border: 'none'
                                                                    }}
                                                                    onClick={() => toggleApplicationExpansion(appData.application.id)}
                                                                    data-bs-toggle="tooltip"
                                                                    title={expandedApplications.has(appData.application.id) ? 'Collapse details' : 'Expand details'}
                                                                >
                                                                    <i className={`fas fa-chevron-${expandedApplications.has(appData.application.id) ? 'up' : 'down'} me-2`}></i>
                                                                    <span className="d-none d-sm-inline">
                                                            {expandedApplications.has(appData.application.id) ? 'Show Less' : 'Show Details'}
                                                        </span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {expandedApplications.has(appData.application.id) && (
                                                        <div className="card-body p-5" style={{ backgroundColor: '#f8fafb' }}>
                                                            {/* Application Remarks */}
                                                            {appData.application.remarks && (
                                                                <div className="alert border-0 mb-5 shadow-sm rounded-4 position-relative overflow-hidden"
                                                                     style={{
                                                                         background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                                                         borderLeft: '6px solid #2196f3'
                                                                     }}>
                                                                    <div className="position-absolute top-0 end-0 opacity-10">
                                                                        <i className="fas fa-quote-right" style={{ fontSize: '4rem', transform: 'translate(50%, -25%)', color: '#2196f3' }}></i>
                                                                    </div>
                                                                    <div className="d-flex align-items-start position-relative">
                                                                        <div className="rounded-4 p-3 me-4 mt-1" style={{ backgroundColor: 'rgba(33, 150, 243, 0.2)' }}>
                                                                            <i className="fas fa-comment-alt" style={{ fontSize: '1.25rem', color: '#2196f3' }}></i>
                                                                        </div>
                                                                        <div className="flex-grow-1">
                                                                            <h5 className="alert-heading fw-bold mb-3 d-flex align-items-center" style={{ color: '#1976d2' }}>
                                                                                <i className="fas fa-clipboard-list me-2"></i>
                                                                                Application Remarks
                                                                            </h5>
                                                                            <p className="mb-0 lh-lg fs-6" style={{ color: '#212529' }}>{appData.application.remarks}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Evaluation Section */}
                                                            {appData.evaluation && (
                                                                <div className="mb-5">
                                                                    <div className="d-flex align-items-center mb-4">
                                                                        <div className="rounded-4 p-3 me-4" style={{ backgroundColor: 'rgba(102, 126, 234, 0.15)' }}>
                                                                            <i className="fas fa-chart-bar" style={{ fontSize: '1.5rem', color: '#667eea' }}></i>
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="fw-bold mb-1 d-flex align-items-center" style={{ color: '#667eea' }}>
                                                                                <i className="fas fa-calculator me-2"></i>
                                                                                Evaluation Results
                                                                            </h4>
                                                                            <p className="mb-0" style={{ color: '#6c757d' }}>
                                                                                <i className="fas fa-microscope me-1"></i>
                                                                                Comprehensive assessment analysis
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="row g-4">
                                                                        <div className="col-12 col-lg-8">
                                                                            <div className="card border-0 shadow-lg rounded-4 h-100 overflow-hidden">
                                                                                <div className="card-header text-white py-3" style={{
                                                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                                                }}>
                                                                                    <h6 className="mb-0 fw-bold text-uppercase d-flex align-items-center">
                                                                                        <i className="fas fa-database me-2"></i>
                                                                                        Academic & Financial Performance
                                                                                    </h6>
                                                                                </div>
                                                                                <div className="card-body p-4">
                                                                                    <div className="row g-4">
                                                                                        <div className="col-12 col-sm-4">
                                                                                            <div className="text-center p-4 rounded-4 shadow-lg h-100 position-relative overflow-hidden"
                                                                                                 style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                                                                                <div className="position-absolute top-0 start-0 w-100 h-100 opacity-20">
                                                                                                    <i className="fas fa-medal position-absolute top-50 start-50 translate-middle" style={{ fontSize: '4rem', color: 'white' }}></i>
                                                                                                </div>
                                                                                                <div className="position-relative">
                                                                                                    <i className="fas fa-star text-white mb-2" style={{ fontSize: '1.5rem' }}></i>
                                                                                                    <div className="text-white fw-bold display-5 mb-2">{appData.evaluation.gwa.toFixed(2)}</div>
                                                                                                    <small className="text-white fw-semibold text-uppercase opacity-75">
                                                                                                        <i className="fas fa-graduation-cap me-1"></i>GWA
                                                                                                    </small>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="col-12 col-sm-4">
                                                                                            <div className="text-center p-4 rounded-4 shadow-lg h-100 position-relative overflow-hidden"
                                                                                                 style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                                                                                                <div className="position-absolute top-0 start-0 w-100 h-100 opacity-20">
                                                                                                    <i className="fas fa-book position-absolute top-50 start-50 translate-middle" style={{ fontSize: '4rem', color: 'white' }}></i>
                                                                                                </div>
                                                                                                <div className="position-relative">
                                                                                                    <i className="fas fa-book-open text-white mb-2" style={{ fontSize: '1.5rem' }}></i>
                                                                                                    <div className="text-white fw-bold display-5 mb-2">{appData.evaluation.total_units}</div>
                                                                                                    <small className="text-white fw-semibold text-uppercase opacity-75">
                                                                                                        <i className="fas fa-list-ol me-1"></i>Total Units
                                                                                                    </small>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="col-12 col-sm-4">
                                                                                            <div className="text-center p-4 rounded-4 shadow-lg h-100 position-relative overflow-hidden"
                                                                                                 style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                                                                                                <div className="position-absolute top-0 start-0 w-100 h-100 opacity-20">
                                                                                                    <i className="fas fa-coins position-absolute top-50 start-50 translate-middle" style={{ fontSize: '4rem', color: 'white' }}></i>
                                                                                                </div>
                                                                                                <div className="position-relative">
                                                                                                    <i className="fas fa-dollar-sign text-white mb-2" style={{ fontSize: '1.5rem' }}></i>
                                                                                                    <div className="text-white fw-bold mb-2" style={{ fontSize: '1.5rem' }}>
                                                                                                        {formatCurrency(appData.evaluation.income)}
                                                                                                    </div>
                                                                                                    <small className="text-white fw-semibold text-uppercase opacity-75">
                                                                                                        <i className="fas fa-home me-1"></i>Family Income
                                                                                                    </small>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-12 col-lg-4">
                                                                            <div className="card border-0 shadow-lg rounded-4 h-100 overflow-hidden">
                                                                                <div className="card-header text-white py-3" style={{
                                                                                    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
                                                                                }}>
                                                                                    <h6 className="mb-0 fw-bold text-uppercase d-flex align-items-center">
                                                                                        <i className="fas fa-target me-2"></i>
                                                                                        Evaluation Score
                                                                                    </h6>
                                                                                </div>
                                                                                <div className="card-body p-4 text-center">
                                                                                    <div className="mb-4">
                                                                                        <div className="score-circle mx-auto mb-3 position-relative d-inline-flex align-items-center justify-content-center shadow-xl"
                                                                                             style={{
                                                                                                 width: '140px',
                                                                                                 height: '140px',
                                                                                                 borderRadius: '50%',
                                                                                                 background: `conic-gradient(from 0deg, #667eea 0deg, #764ba2 ${(appData.evaluation.score * 100) * 3.6}deg, #e9ecef ${(appData.evaluation.score * 100) * 3.6}deg)`,
                                                                                                 boxShadow: '0 15px 40px rgba(102, 126, 234, 0.3)'
                                                                                             }}>
                                                                                            <div className="bg-white rounded-circle d-flex flex-column align-items-center justify-content-center shadow-sm position-relative"
                                                                                                 style={{ width: '100px', height: '100px' }}>
                                                                                                <i className="fas fa-percentage mb-1" style={{ fontSize: '0.75rem', color: '#667eea' }}></i>
                                                                                                <span className="fw-bold display-6" style={{ color: '#667eea' }}>{(appData.evaluation.score * 100).toFixed(0)}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="small fw-semibold d-flex align-items-center justify-content-center" style={{ color: '#6c757d' }}>
                                                                                            <i className="fas fa-chart-pie me-1"></i>
                                                                                            Score out of 100
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="rounded-4 p-4" style={{ backgroundColor: '#f8f9fa' }}>
                                                                                        <div className="d-flex justify-content-between align-items-center">
                                                                                <span className="fw-semibold d-flex align-items-center" style={{ color: '#6c757d' }}>
                                                                                    <i className="fas fa-tags me-2"></i>
                                                                                    Classification:
                                                                                </span>
                                                                                            <span className={`badge rounded-pill px-3 py-2 fw-semibold d-flex align-items-center ${getClassificationBadgeClass(appData.evaluation.classification)}`}>
                                                                                    <i className="fas fa-award me-1"></i>
                                                                                                {appData.evaluation.classification}
                                                                                </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Selected/Awarded Scholarships */}
                                                            {appData.selected_scholarships.length > 0 && (
                                                                <div className="mb-5">
                                                                    <div className="d-flex align-items-center justify-content-between mb-4">
                                                                        <div className="d-flex align-items-center">
                                                                            <div className="rounded-4 p-3 me-4" style={{ backgroundColor: 'rgba(40, 167, 69, 0.15)' }}>
                                                                                <i className="fas fa-trophy" style={{ fontSize: '1.5rem', color: '#28a745' }}></i>
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="fw-bold mb-1 d-flex align-items-center" style={{ color: '#28a745' }}>
                                                                                    <i className="fas fa-medal me-2"></i>
                                                                                    Selected/Awarded Scholarships
                                                                                </h4>
                                                                                <p className="mb-0 small" style={{ color: '#6c757d' }}>
                                                                                    <i className="fas fa-check-circle me-1"></i>
                                                                                    Scholarships you have been awarded
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <span className="badge rounded-pill px-4 py-2 fw-semibold d-flex align-items-center" style={{ backgroundColor: '#28a745', color: 'white' }}>
                                                                <i className="fas fa-list-ol me-2"></i>
                                                                            {appData.selected_scholarships.length} Award{appData.selected_scholarships.length !== 1 ? 's' : ''}
                                                            </span>
                                                                    </div>
                                                                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                                                                        <div className="table-responsive">
                                                                            <table className="table table-hover mb-0 align-middle">
                                                                                <thead className="text-white" style={{
                                                                                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                                                                                }}>
                                                                                <tr>
                                                                                    <th className="border-0 fw-semibold py-4 px-4">
                                                                                        <i className="fas fa-graduation-cap me-2"></i>Scholarship
                                                                                    </th>
                                                                                    <th className="border-0 fw-semibold text-center py-4">
                                                                                        <i className="fas fa-flag me-2"></i>Status
                                                                                    </th>
                                                                                    <th className="border-0 fw-semibold d-none d-sm-table-cell py-4">
                                                                                        <i className="fas fa-money-bill me-2"></i>Grant Amount
                                                                                    </th>
                                                                                    <th className="border-0 fw-semibold d-none d-sm-table-cell py-4">
                                                                                        <i className="fas fa-hand-holding-usd me-2"></i>Awarded Amount
                                                                                    </th>
                                                                                    <th className="border-0 fw-semibold d-none d-md-table-cell py-4">
                                                                                        <i className="fas fa-calendar me-2"></i>Date
                                                                                    </th>
                                                                                </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                {appData.selected_scholarships.map((scholarship) => (
                                                                                    <tr key={scholarship.id} className="hover-row transition-all">
                                                                                        <td className="px-4 py-4">
                                                                                            <div>
                                                                                                <div className="fw-bold mb-1 d-flex align-items-center" style={{ color: '#212529' }}>
                                                                                                    <i className="fas fa-award me-2" style={{ color: '#ffc107' }}></i>
                                                                                                    {scholarship.scholarship_name}
                                                                                                </div>
                                                                                                {scholarship.scholarship_description && (
                                                                                                    <small className="d-block ms-4" style={{ color: '#6c757d' }}>
                                                                                                        {scholarship.scholarship_description}
                                                                                                    </small>
                                                                                                )}
                                                                                                <div className="d-sm-none mt-3">
                                                                                                    <div className="d-flex flex-wrap gap-2">
                                                                                                <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#28a745', color: 'white' }}>
                                                                                                    <i className="fas fa-dollar-sign me-1"></i>
                                                                                                    {formatCurrency(scholarship.grant_amount)}
                                                                                                </span>
                                                                                                        <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#17a2b8', color: 'white' }}>
                                                                                                    <i className="fas fa-hand-holding-usd me-1"></i>
                                                                                                            {scholarship.awarded_amount
                                                                                                                ? formatCurrency(scholarship.awarded_amount)
                                                                                                                : scholarship.status === 'awarded'
                                                                                                                    ? formatCurrency(scholarship.grant_amount)
                                                                                                                    : 'Pending'
                                                                                                            }
                                                                                                </span>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="text-center py-4">
                                                                                    <span className={`badge rounded-pill px-4 py-2 fw-semibold d-flex align-items-center justify-content-center ${getStatusBadgeClass(scholarship.status)}`}>
                                                                                        <i className={`fas ${
                                                                                            scholarship.status === 'awarded' ? 'fa-check-circle' :
                                                                                                scholarship.status === 'selected' ? 'fa-star' : 'fa-times-circle'
                                                                                        } me-2`}></i>
                                                                                        {scholarship.status.charAt(0).toUpperCase() + scholarship.status.slice(1)}
                                                                                    </span>
                                                                                        </td>
                                                                                        <td className="d-none d-sm-table-cell py-4">
                                                                                            <div className="d-flex align-items-center">
                                                                                                <i className="fas fa-money-bill-wave me-2" style={{ color: '#28a745' }}></i>
                                                                                                <span className="fw-bold" style={{ color: '#28a745' }}>{formatCurrency(scholarship.grant_amount)}</span>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="d-none d-sm-table-cell py-4">
                                                                                            <div className="d-flex align-items-center">
                                                                                                <i className="fas fa-hand-holding-usd me-2" style={{ color: '#17a2b8' }}></i>
                                                                                                <span className="fw-bold" style={{ color: '#17a2b8' }}>
                                                                                            {scholarship.awarded_amount
                                                                                                ? formatCurrency(scholarship.awarded_amount)
                                                                                                : scholarship.status === 'awarded'
                                                                                                    ? formatCurrency(scholarship.grant_amount)
                                                                                                    : '-'
                                                                                            }
                                                                                        </span>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="d-none d-md-table-cell py-4">
                                                                                            <div className="d-flex align-items-center" style={{ color: '#6c757d' }}>
                                                                                                <i className="fas fa-calendar-check me-2" style={{ color: '#667eea' }}></i>
                                                                                                <small className="fw-medium">
                                                                                                    {formatDate(scholarship.selected_at)}
                                                                                                </small>
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Recommended Scholarships */}
                                                            {appData.recommended_scholarships.length > 0 && (
                                                                <div className="mb-4">
                                                                    <div className="d-flex align-items-center justify-content-between mb-4">
                                                                        <div className="d-flex align-items-center">
                                                                            <div className="rounded-4 p-3 me-4" style={{ backgroundColor: 'rgba(23, 162, 184, 0.15)' }}>
                                                                                <i className="fas fa-lightbulb" style={{ fontSize: '1.5rem', color: '#17a2b8' }}></i>
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="fw-bold mb-1 d-flex align-items-center" style={{ color: '#17a2b8' }}>
                                                                                    <i className="fas fa-star me-2"></i>
                                                                                    Recommended Scholarships
                                                                                </h4>
                                                                                <p className="mb-0 small" style={{ color: '#6c757d' }}>
                                                                                    <i className="fas fa-brain me-1"></i>
                                                                                    AI-powered recommendations based on your profile
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <span className="badge rounded-pill px-4 py-2 fw-semibold d-flex align-items-center" style={{ backgroundColor: '#17a2b8', color: 'white' }}>
                                                                <i className="fas fa-list me-2"></i>
                                                                            {appData.recommended_scholarships.length} Recommendation{appData.recommended_scholarships.length !== 1 ? 's' : ''}
                                                            </span>
                                                                    </div>
                                                                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                                                                        <div className="table-responsive">
                                                                            <table className="table table-hover mb-0 align-middle">
                                                                                <thead className="text-white" style={{
                                                                                    background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)'
                                                                                }}>
                                                                                <tr>
                                                                                    <th className="border-0 fw-semibold py-4 px-4">
                                                                                        <i className="fas fa-graduation-cap me-2"></i>Scholarship
                                                                                    </th>
                                                                                    <th className="border-0 fw-semibold d-none d-sm-table-cell py-4">
                                                                                        <i className="fas fa-money-bill me-2"></i>Amount
                                                                                    </th>
                                                                                    <th className="border-0 fw-semibold text-center py-4">
                                                                                        <i className="fas fa-chart-line me-2"></i>Score
                                                                                    </th>
                                                                                    <th className="border-0 fw-semibold text-center d-none d-md-table-cell py-4">
                                                                                        <i className="fas fa-tags me-2"></i>Classification
                                                                                    </th>
                                                                                    <th className="border-0 fw-semibold d-none d-lg-table-cell py-4">
                                                                                        <i className="fas fa-clipboard-check me-2"></i>Eligibility
                                                                                    </th>
                                                                                </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                {appData.recommended_scholarships.map((scholarship) => (
                                                                                    <tr key={scholarship.id} className="hover-row transition-all">
                                                                                        <td className="px-4 py-4">
                                                                                            <div>
                                                                                                <div className="fw-bold mb-1 d-flex align-items-center" style={{ color: '#212529' }}>
                                                                                                    <i className="fas fa-gift me-2" style={{ color: '#17a2b8' }}></i>
                                                                                                    {scholarship.scholarship_name}
                                                                                                </div>
                                                                                                {scholarship.scholarship_description && (
                                                                                                    <small className="d-block ms-4" style={{ color: '#6c757d' }}>
                                                                                                        {scholarship.scholarship_description}
                                                                                                    </small>
                                                                                                )}
                                                                                                <div className="d-sm-none mt-3">
                                                                                                    <div className="d-flex flex-wrap gap-2">
                                                                                                <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#28a745', color: 'white' }}>
                                                                                                    <i className="fas fa-dollar-sign me-1"></i>
                                                                                                    {formatCurrency(scholarship.grant_amount)}
                                                                                                </span>
                                                                                                        <span className={`badge rounded-pill px-3 py-2 d-md-none ${getClassificationBadgeClass(scholarship.classification)}`}>
                                                                                                    <i className="fas fa-tag me-1"></i>
                                                                                                            {scholarship.classification}
                                                                                                </span>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="d-none d-sm-table-cell py-4">
                                                                                            <div className="d-flex align-items-center">
                                                                                                <i className="fas fa-money-bill-wave me-2" style={{ color: '#28a745' }}></i>
                                                                                                <span className="fw-bold" style={{ color: '#28a745' }}>
                                                                                            {formatCurrency(scholarship.grant_amount)}
                                                                                        </span>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="text-center py-4">
                                                                                            <div className="d-inline-flex align-items-center justify-content-center rounded-pill px-4 py-2" style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
                                                                                                <i className="fas fa-percent me-2" style={{ color: '#667eea' }}></i>
                                                                                                <span className="badge border-0 fw-bold px-3 py-2" style={{ backgroundColor: '#667eea', color: 'white' }}>
                                                                                            {(scholarship.score).toFixed(1)}%
                                                                                        </span>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="text-center d-none d-md-table-cell py-4">
                                                                                    <span className={`badge rounded-pill px-4 py-2 fw-semibold d-flex align-items-center justify-content-center ${getClassificationBadgeClass(scholarship.classification)}`}>
                                                                                        <i className="fas fa-award me-2"></i>
                                                                                        {scholarship.classification}
                                                                                    </span>
                                                                                        </td>
                                                                                        <td className="d-none d-lg-table-cell py-4">
                                                                                            {scholarship.eligibility_reasons && (
                                                                                                <div className="d-flex align-items-start">
                                                                                                    <i className="fas fa-check-circle me-2 mt-1" style={{ color: '#28a745' }}></i>
                                                                                                    <small className="lh-base" style={{ color: '#6c757d' }}>
                                                                                                        {typeof scholarship.eligibility_reasons === 'string'
                                                                                                            ? scholarship.eligibility_reasons
                                                                                                            : Array.isArray(scholarship.eligibility_reasons)
                                                                                                                ? scholarship.eligibility_reasons.join(', ')
                                                                                                                : JSON.stringify(scholarship.eligibility_reasons)
                                                                                                        }
                                                                                                    </small>
                                                                                                </div>
                                                                                            )}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* No Additional Data Message */}
                                                            {!appData.evaluation && appData.recommended_scholarships.length === 0 && appData.selected_scholarships.length === 0 && (
                                                                <div className="text-center py-5">
                                                                    <div className="rounded-4 p-5 d-inline-block shadow-sm"
                                                                         style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                                                                        <div className="rounded-circle p-4 d-inline-flex align-items-center justify-content-center mb-4" style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
                                                                            <i className="fas fa-file-invoice" style={{ fontSize: '2.5rem', color: '#667eea' }}></i>
                                                                        </div>
                                                                        <h5 className="fw-bold mb-3 d-flex align-items-center justify-content-center" style={{ color: '#495057' }}>
                                                                            <i className="fas fa-info-circle me-2"></i>
                                                                            No Additional Data Available
                                                                        </h5>
                                                                        <p className="mb-0 lh-base" style={{ maxWidth: '400px', color: '#6c757d' }}>
                                                                            <i className="fas fa-hourglass-half me-2"></i>
                                                                            Evaluation and scholarship data is currently being processed. Check back soon for updates.
                                                                        </p>
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

            <style>
                {`
                .hover-lift {
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

                .hover-lift:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 35px rgba(0,0,0,0.15) !important;
            }

                .transition-all {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

                .hover-shadow {
                transition: box-shadow 0.3s ease, transform 0.3s ease;
            }

                .hover-shadow:hover {
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3) !important;
                transform: translateY(-2px);
            }

                .hover-row {
                transition: background-color 0.2s ease, transform 0.2s ease;
            }

                .hover-row:hover {
                background-color: rgba(102, 126, 234, 0.05) !important;
                transform: scale(1.01);
            }

                .backdrop-blur {
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
            }

                .score-circle {
                position: relative;
                transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

                .score-circle:hover {
                transform: scale(1.08);
            }

                .timeline-dot {
                transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

                .timeline-dot:hover {
                transform: scale(1.15);
            }

                .mb-6 {
                margin-bottom: 3rem !important;
            }

                @media (max-width: 992px) {
                .timeline-connector {
                display: none !important;
            }

                .timeline-dot {
                display: none !important;
            }
            }

                @media (max-width: 768px) {
                .card-body {
                padding: 1.5rem !important;
            }

                .card-header {
                padding: 1.25rem !important;
            }
            }

                .badge {
                font-weight: 600;
                letter-spacing: 0.3px;
            }

                table tbody tr {
                transition: all 0.2s ease;
            }

                table tbody tr:hover {
                transform: scale(1.01);
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }`}
            </style>
        </div>

    );
};

export default ScholarshipSummary;