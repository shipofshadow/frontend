import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import {
    Activity, CheckCircle, Clock, XCircle, AlertCircle,
    RefreshCw, ChevronLeft, ChevronRight, Search
} from 'lucide-react';

interface LogEntry {
    application_id: number;
    status: string;
    created_at: string;
    updated_at: string;
    remarks: string | null;
    student_name: string;
    student_id: string;
    course_name: string | null;
    campus_name: string | null;
    semester_name: string | null;
    academic_year: string | null;
}

interface LogsResponse {
    logs: LogEntry[];
    total: number;
    limit: number;
    offset: number;
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; badgeClass: string; label: string }> = {
    approved:  { icon: <CheckCircle size={14} />,  badgeClass: 'bg-success',            label: 'Approved'  },
    pending:   { icon: <Clock size={14} />,         badgeClass: 'bg-warning text-dark',  label: 'Pending'   },
    denied:    { icon: <XCircle size={14} />,        badgeClass: 'bg-danger',             label: 'Denied'    },
    evaluated: { icon: <AlertCircle size={14} />,   badgeClass: 'bg-info',               label: 'Evaluated' },
    returned:  { icon: <AlertCircle size={14} />,   badgeClass: 'bg-secondary',          label: 'Returned'  },
    submitted: { icon: <Clock size={14} />,          badgeClass: 'bg-primary',            label: 'Submitted' },
};

const PAGE_SIZE = 25;

const ActivityLogs = () => {
    const { token } = useAuth();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const fetchLogs = useCallback(async (offset = 0, showRefresh = false) => {
        if (showRefresh) setRefreshing(true); else setLoading(true);
        setError(null);
        try {
            const res = await axios.get<LogsResponse>(`${API_BASE_URL}/api/dashboard/activity-logs`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { limit: PAGE_SIZE, offset },
            });
            setLogs(res.data.logs);
            setTotal(res.data.total);
        } catch {
            setError('Failed to load activity logs. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => {
        fetchLogs(page * PAGE_SIZE);
    }, [page, fetchLogs]);

    const filtered = logs.filter(l => {
        const q = search.toLowerCase();
        return (
            l.student_name?.toLowerCase().includes(q) ||
            l.student_id?.toLowerCase().includes(q) ||
            l.campus_name?.toLowerCase().includes(q) ||
            l.status?.toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(total / PAGE_SIZE);

    const formatDate = (d: string) => {
        if (!d) return '—';
        return new Date(d).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true,
        });
    };

    const renderStatus = (status: string) => {
        const cfg = STATUS_CONFIG[status] ?? { icon: <Activity size={14} />, badgeClass: 'bg-secondary', label: status };
        return (
            <span className={`badge ${cfg.badgeClass} d-inline-flex align-items-center gap-1`}>
                {cfg.icon} {cfg.label}
            </span>
        );
    };

    return (
        <>
            <header className="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
                <div className="container-fluid px-4">
                    <div className="page-header-content">
                        <div className="row align-items-center justify-content-between pt-3">
                            <div className="col-auto mb-3">
                                <h1 className="page-header-title">
                                    <div className="page-header-icon"><Activity size={20} /></div>
                                    Activity Logs
                                </h1>
                                <p className="page-header-subtitle mb-0">Recent application activity across the system</p>
                            </div>
                            <div className="col-auto mb-3">
                                <button
                                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                    onClick={() => fetchLogs(page * PAGE_SIZE, true)}
                                    disabled={refreshing}
                                >
                                    <RefreshCw size={14} className={refreshing ? 'spin-animation' : ''} />
                                    {refreshing ? 'Refreshing…' : 'Refresh'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-xl px-4">
                <div className="card mb-4">
                    <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <span className="text-muted small">
                            {loading ? 'Loading…' : `${total.toLocaleString()} total events`}
                        </span>
                        <div className="input-group" style={{ maxWidth: 300 }}>
                            <span className="input-group-text"><Search size={14} /></span>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Search name, campus, status…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="card-body p-0">
                        {error ? (
                            <div className="alert alert-danger m-3">{error}</div>
                        ) : loading ? (
                            <div className="d-flex justify-content-center align-items-center py-5">
                                <div className="spinner-border text-primary" role="status" />
                                <span className="ms-3 text-muted">Loading activity logs…</span>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <Activity size={40} className="mb-2 opacity-50" />
                                <p className="mb-0">No activity found.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>#</th>
                                            <th>Student</th>
                                            <th>Course / Campus</th>
                                            <th>Semester</th>
                                            <th>Status</th>
                                            <th>Remarks</th>
                                            <th>Last Updated</th>
                                            <th>Submitted</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((log, i) => (
                                            <tr key={log.application_id}>
                                                <td className="text-muted small">{page * PAGE_SIZE + i + 1}</td>
                                                <td>
                                                    <div className="fw-semibold">{log.student_name}</div>
                                                    <div className="text-muted small">{log.student_id}</div>
                                                </td>
                                                <td>
                                                    <div>{log.course_name ?? '—'}</div>
                                                    <div className="text-muted small">{log.campus_name ?? '—'}</div>
                                                </td>
                                                <td>
                                                    <div>{log.semester_name ?? '—'}</div>
                                                    <div className="text-muted small">{log.academic_year ?? '—'}</div>
                                                </td>
                                                <td>{renderStatus(log.status)}</td>
                                                <td>
                                                    <span className="text-muted small" style={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {log.remarks ?? '—'}
                                                    </span>
                                                </td>
                                                <td className="small">{formatDate(log.updated_at)}</td>
                                                <td className="small">{formatDate(log.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="card-footer d-flex align-items-center justify-content-between">
                            <span className="text-muted small">
                                Page {page + 1} of {totalPages}
                            </span>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    disabled={page === 0}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    <ChevronLeft size={14} /> Prev
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Next <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin-animation { animation: spin 1s linear infinite; }
            `}</style>
        </>
    );
};

export default ActivityLogs;