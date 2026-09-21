import React, { useEffect, useState } from 'react';
import { 
    FileText, 
    CheckCircle, 
    Clock, 
    TrendingUp, 
    Building, 
    GraduationCap, 
    RefreshCw,
    BarChart2,
    Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMetrics, type MetricsData } from '../../services/dashboard';

const Metrics: React.FC = () => {
    const { token } = useAuth();
    const [data, setData] = useState<MetricsData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getMetrics(token);
            if (res) {
                setData(res);
            } else {
                setError('Failed to fetch analytics metrics.');
            }
        } catch (err) {
            console.error('Error in Metrics page:', err);
            setError('An error occurred while loading metrics data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [token]);

    const overall = data?.overall;
    const perSemester = data?.per_semester || [];
    const perCampus = data?.per_campus || [];
    const topCourses = data?.top_courses || [];

    const maxCampusTotal = Math.max(...perCampus.map(c => c.total), 1);

    return (
        <div className="container-fluid px-4 py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-1 text-gray-800 fw-bold d-flex align-items-center gap-2">
                        <BarChart2 className="text-primary" size={28} />
                        System Analytics & Metrics
                    </h1>
                    <p className="text-muted small mb-0">
                        All-time application aggregate figures, semester trends, campus distribution, and course rankings.
                    </p>
                </div>
                <button 
                    onClick={loadData} 
                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                    disabled={loading}
                >
                    <RefreshCw size={14} className={loading ? "spin" : ""} />
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <p className="text-muted">Loading analytics data...</p>
                </div>
            ) : error ? (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <div>{error}</div>
                </div>
            ) : (
                <>
                    {/* Row 1: KPI Cards */}
                    <div className="row g-3 mb-4">
                        <div className="col-xl-3 col-md-6">
                            <div className="card border-0 shadow-sm border-start border-primary border-4 h-100">
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-xs fw-bold text-primary text-uppercase mb-1">
                                                Total Applications
                                            </div>
                                            <div className="h4 mb-0 fw-bold text-gray-800">
                                                {(overall?.overall_total ?? 0).toLocaleString()}
                                            </div>
                                            <div className="small text-muted mt-1">All-time submissions</div>
                                        </div>
                                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                                            <FileText size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-3 col-md-6">
                            <div className="card border-0 shadow-sm border-start border-success border-4 h-100">
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-xs fw-bold text-success text-uppercase mb-1">
                                                Approved
                                            </div>
                                            <div className="h4 mb-0 fw-bold text-gray-800">
                                                {(overall?.approved_total ?? 0).toLocaleString()}
                                            </div>
                                            <div className="small text-muted mt-1">Beneficiaries awarded</div>
                                        </div>
                                        <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                                            <CheckCircle size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-3 col-md-6">
                            <div className="card border-0 shadow-sm border-start border-warning border-4 h-100">
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-xs fw-bold text-warning text-uppercase mb-1">
                                                Pending Review
                                            </div>
                                            <div className="h4 mb-0 fw-bold text-gray-800">
                                                {(overall?.pending_total ?? 0).toLocaleString()}
                                            </div>
                                            <div className="small text-muted mt-1">Awaiting evaluation</div>
                                        </div>
                                        <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning">
                                            <Clock size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-3 col-md-6">
                            <div className="card border-0 shadow-sm border-start border-info border-4 h-100">
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="text-xs fw-bold text-info text-uppercase mb-1">
                                                Approval Rate
                                            </div>
                                            <div className="h4 mb-0 fw-bold text-gray-800">
                                                {overall?.approval_rate_pct ?? 0}%
                                            </div>
                                            <div className="small text-muted mt-1">Of total applications</div>
                                        </div>
                                        <div className="bg-info bg-opacity-10 p-3 rounded-circle text-info">
                                            <TrendingUp size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Per-Semester Breakdown */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
                            <Calendar size={18} className="text-primary" />
                            <h6 className="m-0 fw-bold text-primary">Academic Year & Semester Breakdown</h6>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-4">Academic Year</th>
                                            <th>Semester</th>
                                            <th className="text-center">Total</th>
                                            <th className="text-center">Approved</th>
                                            <th className="text-center">Pending</th>
                                            <th className="text-center">Denied</th>
                                            <th className="text-end pe-4">Approval Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {perSemester.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="text-center py-4 text-muted">
                                                    No semester historical data available.
                                                </td>
                                            </tr>
                                        ) : (
                                            perSemester.map((sem, idx) => {
                                                const rate = sem.total > 0 
                                                    ? Math.round((sem.approved / sem.total) * 100) 
                                                    : 0;
                                                return (
                                                    <tr key={idx}>
                                                        <td className="ps-4 fw-medium text-dark">{sem.academic_year}</td>
                                                        <td>{sem.semester}</td>
                                                        <td className="text-center fw-bold">{sem.total}</td>
                                                        <td className="text-center">
                                                            <span className="badge bg-success-subtle text-success border border-success-subtle">
                                                                {sem.approved}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            <span className="badge bg-warning-subtle text-warning border border-warning-subtle">
                                                                {sem.pending}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                                                                {sem.denied}
                                                            </span>
                                                        </td>
                                                        <td className="text-end pe-4">
                                                            <div className="d-flex align-items-center justify-content-end gap-2">
                                                                <div className="progress flex-grow-1" style={{ height: '6px', maxWidth: '80px' }}>
                                                                    <div 
                                                                        className="progress-bar bg-success" 
                                                                        style={{ width: `${rate}%` }}
                                                                    />
                                                                </div>
                                                                <span className="small fw-semibold">{rate}%</span>
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
                    </div>

                    {/* Row 3: Campus Distribution & Top Courses */}
                    <div className="row g-4">
                        {/* Campus Distribution */}
                        <div className="col-lg-5">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
                                    <Building size={18} className="text-primary" />
                                    <h6 className="m-0 fw-bold text-primary">Applications by Campus</h6>
                                </div>
                                <div className="card-body">
                                    {perCampus.length === 0 ? (
                                        <p className="text-muted text-center py-4 mb-0">No campus breakdown data.</p>
                                    ) : (
                                        <div className="d-flex flex-column gap-3">
                                            {perCampus.map((camp, idx) => {
                                                const pct = Math.round((camp.total / maxCampusTotal) * 100);
                                                const appRate = camp.total > 0 ? Math.round((camp.approved / camp.total) * 100) : 0;
                                                return (
                                                    <div key={idx}>
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <span className="fw-medium text-dark">{camp.campus || 'Main Campus'}</span>
                                                            <div className="text-end">
                                                                <span className="fw-bold">{camp.total}</span>
                                                                <span className="text-muted small ms-1">({camp.approved} approved, {appRate}%)</span>
                                                            </div>
                                                        </div>
                                                        <div className="progress" style={{ height: '8px' }}>
                                                            <div 
                                                                className="progress-bar bg-primary" 
                                                                role="progressbar" 
                                                                style={{ width: `${pct}%` }} 
                                                                aria-valuenow={pct} 
                                                                aria-valuemin={0} 
                                                                aria-valuemax={100}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Top Courses */}
                        <div className="col-lg-7">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
                                    <GraduationCap size={18} className="text-primary" />
                                    <h6 className="m-0 fw-bold text-primary">Top 10 Courses by Applicants</h6>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-sm table-hover align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="ps-3" style={{ width: '40px' }}>#</th>
                                                    <th>Course Name</th>
                                                    <th>Campus</th>
                                                    <th className="text-end pe-3">Applicants</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {topCourses.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="text-center py-4 text-muted">
                                                            No course applicant data available.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    topCourses.map((c, idx) => (
                                                        <tr key={idx}>
                                                            <td className="ps-3 text-muted">{idx + 1}</td>
                                                            <td>
                                                                <div className="fw-medium text-dark">{c.course || 'Unassigned'}</div>
                                                                {c.department && <div className="text-muted small">{c.department}</div>}
                                                            </td>
                                                            <td><span className="badge bg-light text-dark">{c.campus || '—'}</span></td>
                                                            <td className="text-end pe-3">
                                                                <span className="badge bg-primary-subtle text-primary fw-bold">
                                                                    {c.total}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Metrics;