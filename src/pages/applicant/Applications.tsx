import React, { useMemo, useState } from 'react';
import { useAuth } from "../../context/AuthContext.tsx";
import { Eye, Download, FileText, Calendar, Award, TrendingUp, Pencil, Filter, Plus, Search } from 'lucide-react';
import { Link } from "react-router-dom";

const Applications: React.FC = () => {
    const { applications: scholarshipData, isLoading } = useAuth();
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('all');
    const [q, setQ] = useState('');

    const applications = scholarshipData?.applications || [];
    const summaryStats = scholarshipData?.summary_statistics;

    const getStatusBadge = (status?: string) => {
        const map: Record<string, string> = {
            pending: 'bg-warning text-dark',
            approved: 'bg-success',
            denied: 'bg-danger'
        };
        return map[status || ''] || 'bg-secondary';
    };

    const getClassificationBadge = (classification?: string) => {
        const map: Record<string, string> = {
            'Eligible': 'bg-success',
            'Conditionally Eligible': 'bg-info',
            'Low Eligibility': 'bg-warning text-dark',
            'Not Eligible': 'bg-danger'
        };
        return map[classification || ''] || 'bg-secondary';
    };

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        return applications.filter(a => {
            const stOk = statusFilter === 'all' ? true : a.application.status === statusFilter;
            if (!needle) return stOk;
            const ref = `ref-${a.application.id}`.toLowerCase();
            const ay = (a.application.academic_year || '').toLowerCase();
            const sem = (a.application.semester || '').toLowerCase();
            return stOk && (ref.includes(needle) || ay.includes(needle) || sem.includes(needle));
        });
    }, [applications, statusFilter, q]);

    if (isLoading) {
        return (
            <div className="container-fluid py-4">
                <div className="row g-3">
                    {[...Array(4)].map((_, i) => (
                        <div className="col-md-3" key={i}>
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    <div className="placeholder-glow">
                                        <span className="placeholder col-3 me-3" style={{ height: 48 }} />
                                        <span className="placeholder col-7" />
                                        <div className="mt-3">
                                            <span className="placeholder col-6" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card border-0 shadow-lg rounded-4 mt-3">
                    <div className="card-header bg-white py-3">
                        <div className="placeholder-glow">
                            <span className="placeholder col-3" />
                        </div>
                    </div>
                    <div className="card-body">
                        {[...Array(5)].map((_, i) => (
                            <div className="placeholder-glow d-flex align-items-center mb-3" key={i}>
                                <span className="placeholder col-2 me-2" />
                                <span className="placeholder col-2 me-2" />
                                <span className="placeholder col-2 me-2" />
                                <span className="placeholder col-2 me-2" />
                                <span className="placeholder col-1 me-2" />
                                <span className="placeholder col-2 me-2" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="row mb-3">
                <div className="col-12 d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div>
                        <h2 className="fw-bold mb-1">My Applications</h2>
                        <p className="text-muted mb-0">Track scholarship submissions, statuses, and eligibility results</p>
                    </div>
                    <div className="d-flex gap-2">
                        <Link to="/applicant/apply" className="btn btn-primary">
                            <Plus size={18} className="me-2" />
                            New Application
                        </Link>
                        <div className="btn-group">
                            <button type="button" className="btn btn-outline-primary">
                                <Download size={18} className="me-2" />
                                Export
                            </button>
                            <button type="button" className="btn btn-outline-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                                <span className="visually-hidden">Toggle Dropdown</span>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li><button className="dropdown-item">Export CSV</button></li>
                                <li><button className="dropdown-item">Export PDF</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                                <FileText size={22} className="text-primary" />
                            </div>
                            <div className="ms-3">
                                <p className="text-muted mb-1 small">Total Applications</p>
                                <h4 className="mb-0 fw-bold">{summaryStats?.total_applications || 0}</h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body d-flex align-items-center">
                            <div className="bg-warning bg-opacity-10 rounded-3 p-3">
                                <Calendar size={22} className="text-warning" />
                            </div>
                            <div className="ms-3">
                                <p className="text-muted mb-1 small">Pending</p>
                                <h4 className="mb-0 fw-bold">
                                    {applications.filter(a => a.application.status === 'pending').length}
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body d-flex align-items-center">
                            <div className="bg-success bg-opacity-10 rounded-3 p-3">
                                <Award size={22} className="text-success" />
                            </div>
                            <div className="ms-3">
                                <p className="text-muted mb-1 small">Approved</p>
                                <h4 className="mb-0 fw-bold">{summaryStats?.approved_applications || 0}</h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body d-flex align-items-center">
                            <div className="bg-info bg-opacity-10 rounded-3 p-3">
                                <TrendingUp size={22} className="text-info" />
                            </div>
                            <div className="ms-3">
                                <p className="text-muted mb-1 small">Avg. Score</p>
                                <h4 className="mb-0 fw-bold">
                                    {summaryStats?.average_score ? (summaryStats.average_score * 100).toFixed(1) + '%' : '0.0%'}
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="card-header bg-white border-bottom py-3">
                    <div className="d-flex flex-wrap align-items-center gap-2">
                        <div className="input-group" style={{ maxWidth: 360 }}>
                            <span className="input-group-text bg-white"><Search size={16} /></span>
                            <input
                                type="search"
                                className="form-control"
                                placeholder="Search reference, AY, or semester"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                aria-label="Search applications"
                            />
                        </div>
                        <div className="vr d-none d-md-block" />
                        <div className="d-flex align-items-center gap-2">
                            <span className="text-muted small d-none d-sm-inline-flex"><Filter size={16} className="me-1" />Status</span>
                            <div className="btn-group" role="group" aria-label="Filter by status">
                                {(['all','pending','approved','denied'] as const).map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setStatusFilter(s)}
                                    >
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover table-striped align-middle mb-0">
                            <thead className="table-light sticky-top" style={{ top: 0, zIndex: 1 }}>
                            <tr>
                                <th className="px-4 py-3">Reference #</th>
                                <th className="py-3">Submitted</th>
                                <th className="py-3">Academic Year</th>
                                <th className="py-3">Semester</th>
                                <th className="py-3">Status</th>
                                <th className="py-3">Eligibility</th>
                                <th className="py-3">Classification</th>
                                <th className="py-3 text-center">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-5">
                                        <div className="d-flex flex-column align-items-center">
                                            <FileText size={44} className="mb-2 text-muted opacity-75" />
                                            <p className="mb-1 fw-semibold">No applications found</p>
                                            <p className="text-muted small mb-3">Try adjusting filters or start a new application</p>
                                            <Link to="/applicant/apply" className="btn btn-outline-primary btn-sm">
                                                <Plus size={16} className="me-1" /> Create Application
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((appData: any) => {
                                    const app = appData.application;
                                    const evaluation = appData.evaluation;
                                    const pct = ((evaluation?.score || 0) * 100);
                                    return (
                                        <tr key={app.id}>
                                            <td className="px-4">
                                                <span className="fw-semibold text-primary">#REF-{app.id.toString().padStart(8, '0')}</span>
                                            </td>
                                            <td>
                                                {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                }) : '—'}
                                            </td>
                                            <td><span className="text-muted">{app.academic_year || 'N/A'}</span></td>
                                            <td><span className="text-muted">{app.semester || 'N/A'}</span></td>
                                            <td>
                          <span
                              className={`badge ${getStatusBadge(app.status)} px-3 py-2`}
                              aria-label={`Status ${app.status || 'unknown'}`}
                          >
                            {(app.status || 'unknown').charAt(0).toUpperCase() + (app.status || 'unknown').slice(1)}
                          </span>
                                            </td>
                                            <td>
                                                {evaluation ? (
                                                    <div className="d-flex align-items-center" style={{ minWidth: 160 }}>
                                                        <div
                                                            className="progress flex-grow-1 me-2"
                                                            style={{ height: 8 }}
                                                            role="progressbar"
                                                            aria-valuenow={pct}
                                                            aria-valuemin={0}
                                                            aria-valuemax={100}
                                                            aria-label="Eligibility score"
                                                        >
                                                            <div
                                                                className="progress-bar bg-primary"
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                        <span className="fw-semibold small">{pct.toFixed(1)}%</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted small">Not evaluated</span>
                                                )}
                                            </td>
                                            <td>
                          <span
                              className={`badge ${getClassificationBadge(evaluation?.classification)} px-3 py-2`}
                              aria-label={`Classification ${evaluation?.classification || 'Pending'}`}
                          >
                            {evaluation?.classification || 'Pending'}
                          </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="btn-group btn-group-sm" role="group">
                                                    <Link
                                                        className="btn btn-outline-primary"
                                                        title="View Details"
                                                        to={`/applicant/application/${app.id}`}
                                                    >
                                                        <Eye size={16} />
                                                    </Link>
                                                    {app.status === 'pending' && (
                                                        <Link
                                                            className="btn btn-outline-secondary"
                                                            title="Edit Details"
                                                            to={`/applicant/application/${app.id}/edit`}
                                                        >
                                                            <Pencil size={16} />
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                {filtered.length > 0 && (
                    <div className="card-footer bg-white border-top py-3">
                        <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted small">
                Showing {filtered.length} of {applications.length} applications
              </span>
                            <nav aria-label="Pagination">
                                <ul className="pagination pagination-sm mb-0">
                                    <li className="page-item disabled">
                                        <span className="page-link">Previous</span>
                                    </li>
                                    <li className="page-item active">
                                        <span className="page-link">1</span>
                                    </li>
                                    <li className="page-item disabled">
                                        <span className="page-link">Next</span>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Applications;
