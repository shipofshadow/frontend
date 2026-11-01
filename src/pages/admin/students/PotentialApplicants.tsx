import { useEffect, useState, useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import axios from 'axios';
import { API_BASE_URL } from "../../../config.ts";
import { useAuth } from "../../../context/AuthContext.tsx";
import { Users, Mail, Send, CheckCircle, Clock } from 'lucide-react';

interface PotentialApplicant {
    user_id: number;
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
    registered_at: string;
    reminder_sent: boolean;
    reminder_sent_at: string | null;
    campus_id?: number;
}

interface ActiveSemester {
    id: number;
    name: string;
    academicYear: string;
}

interface PotentialApplicantsResponse {
    potentialApplicants: PotentialApplicant[];
    total: number;
    activeSemester: ActiveSemester;
}

interface SendReminderResponse {
    success: boolean;
    message?: string;
    error?: string;
    sent_at?: string;
}

interface BulkReminderResponse {
    success: boolean;
    results: {
        sent: number;
        skipped: number;
        details: Array<{
            student_id: number;
            status: 'sent' | 'skipped';
            reason?: string;
        }>;
    };
}

type SortKey = 'student_id' | 'name' | 'email' | 'registered_at' | 'reminder_status';

const PotentialApplicants = () => {
    const [applicants, setApplicants] = useState<PotentialApplicant[]>([]);
    const [activeSemester, setActiveSemester] = useState<ActiveSemester | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sendingId, setSendingId] = useState<number | null>(null);
    const [isBulkSending, setIsBulkSending] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({ sent: 0, total: 0 });
    const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'not_sent'>('all');
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('registered_at');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const { token, user, isAdmin, isFaculty, userCampusId } = useAuth();

    // Computed stats
    const stats = useMemo(() => {
        const total = applicants.length;
        const sent = applicants.filter(a => a.reminder_sent).length;
        const pending = total - sent;
        return { total, sent, pending };
    }, [applicants]);

    // Filter by status and search term, then sort
    const filteredApplicants = useMemo(() => {
        let rows = applicants;
        if (statusFilter === 'sent') rows = rows.filter(a => a.reminder_sent);
        else if (statusFilter === 'not_sent') rows = rows.filter(a => !a.reminder_sent);

        const term = search.trim().toLowerCase();
        if (term) {
            rows = rows.filter(a =>
                `${a.first_name} ${a.last_name}`.toLowerCase().includes(term) ||
                (a.student_id || '').toLowerCase().includes(term) ||
                (a.email || '').toLowerCase().includes(term)
            );
        }

        const dir = sortDir === 'asc' ? 1 : -1;
        return [...rows].sort((a, b) => {
            switch (sortKey) {
                case 'student_id':
                    return dir * (a.student_id || '').localeCompare(b.student_id || '');
                case 'name':
                    return dir * `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`);
                case 'email':
                    return dir * (a.email || '').localeCompare(b.email || '');
                case 'reminder_status':
                    return dir * (Number(a.reminder_sent) - Number(b.reminder_sent));
                default:
                    return dir * (new Date(a.registered_at).getTime() - new Date(b.registered_at).getTime());
            }
        });
    }, [applicants, statusFilter, search, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filteredApplicants.length / perPage));
    const currentPage = Math.min(page, totalPages);
    const pagedApplicants = useMemo(
        () => filteredApplicants.slice((currentPage - 1) * perPage, currentPage * perPage),
        [filteredApplicants, currentPage, perPage]
    );

    useEffect(() => {
        setPage(1);
    }, [statusFilter, search, sortKey, sortDir, perPage]);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const sortIcon = (key: SortKey) =>
        sortKey !== key ? 'fa-sort text-muted' : sortDir === 'asc' ? 'fa-sort-up text-primary' : 'fa-sort-down text-primary';

    const fetchApplicants = useCallback(async () => {
        if (!isAdmin) return;

        try {
            setLoading(true);
            setError(null);

            const response = await axios.get<PotentialApplicantsResponse>(
                `${API_BASE_URL}/api/students/potential-applicants`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    timeout: 10000
                }
            );

            // Filter by campus for faculty users
            let data = response.data.potentialApplicants;
            if (isFaculty && userCampusId) {
                data = data.filter(applicant => applicant.campus_id === userCampusId);
            }
            setApplicants(data);
            setActiveSemester(response.data.activeSemester);
        } catch (err) {
            console.error('Error fetching potential applicants:', err);
            const errorMessage = 'Failed to load potential applicants';
            setError(errorMessage);
            await Swal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    }, [token, isAdmin, isFaculty, userCampusId]);


    const handleSendReminder = useCallback(async (student: PotentialApplicant) => {
        const result = await Swal.fire({
            title: 'Send Reminder Email',
            html: `
                <p>Send scholarship application reminder to:</p>
                <p><strong>${student.first_name} ${student.last_name}</strong></p>
                <p class="text-muted">${student.email}</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Send Email',
            confirmButtonColor: '#0d6efd',
            cancelButtonText: 'Cancel'
        });


        if (result.isConfirmed) {
            try {
                setSendingId(student.user_id);

                const response = await axios.post<SendReminderResponse>(
                    `${API_BASE_URL}/api/students/send-application-reminder`,
                    { student_id: student.user_id },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data.success) {
                    // Update local state
                    setApplicants(prev =>
                        prev.map(a =>
                            a.user_id === student.user_id
                                ? { ...a, reminder_sent: true, reminder_sent_at: response.data.sent_at || new Date().toISOString() }
                                : a
                        )
                    );

                    await Swal.fire({
                        title: 'Email Sent!',
                        text: `Reminder sent to ${student.first_name} ${student.last_name}`,
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    throw new Error(response.data.error || 'Failed to send reminder');
                }
            } catch (err) {
                console.error('Error sending reminder:', err);
                await Swal.fire({
                    title: 'Error',
                    text: 'Failed to send reminder. Please try again.',
                    icon: 'error'
                });
            } finally {
                setSendingId(null);
            }
        }
    }, [token]);


    const handleBulkSend = useCallback(async () => {
        const pendingStudents = applicants.filter(a => !a.reminder_sent);
        const pendingCount = pendingStudents.length;

        if (pendingCount === 0) {
            await Swal.fire({
                title: 'No Pending Reminders',
                text: 'All students have already received a reminder.',
                icon: 'info'
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Send Bulk Reminders',
            html: `
                <p>Send reminder emails to <strong>${pendingCount}</strong> students?</p>
                <p class="text-muted small">Students who already received a reminder will be skipped.</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Send All',
            confirmButtonColor: '#198754',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                setIsBulkSending(true);
                setBulkProgress({ sent: 0, total: pendingCount });

                const studentIds = pendingStudents.map(s => s.user_id);

                const response = await axios.post<BulkReminderResponse>(
                    `${API_BASE_URL}/api/students/send-bulk-reminders`,
                    { student_ids: studentIds },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data.success) {
                    const { sent, skipped } = response.data.results;

                    // Update local state for sent reminders
                    const sentStudentIds = response.data.results.details
                        .filter(d => d.status === 'sent')
                        .map(d => d.student_id);

                    setApplicants(prev =>
                        prev.map(a =>
                            sentStudentIds.includes(a.user_id)
                                ? { ...a, reminder_sent: true, reminder_sent_at: new Date().toISOString() }
                                : a
                        )
                    );

                    await Swal.fire({
                        title: 'Bulk Send Complete',
                        html: `
                            <p><strong>${sent}</strong> reminders sent successfully</p>
                            ${skipped > 0 ? `<p class="text-muted">${skipped} skipped (already sent)</p>` : ''}
                        `,
                        icon: 'success'
                    });
                } else {
                    throw new Error('Failed to send bulk reminders');
                }
            } catch (err) {
                console.error('Error sending bulk reminders:', err);
                await Swal.fire({
                    title: 'Error',
                    text: 'Failed to send bulk reminders. Please try again.',
                    icon: 'error'
                });
            } finally {
                setIsBulkSending(false);
                setBulkProgress({ sent: 0, total: 0 });
            }
        }
    }, [applicants, token]);

    // Handle access control
    useEffect(() => {
        if (!isAdmin && user) {
            Swal.fire({
                title: 'Access Denied',
                text: 'Admin access required.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        fetchApplicants();
    }, [isAdmin, user, fetchApplicants]);

    const formatDate = useCallback((dateString: string | null) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'Invalid Date';
        }
    }, []);

    const handleRetry = useCallback(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    if (!isAdmin && user) {
        return (
            <div className="container-fluid px-4">
                <div className="alert alert-danger border-0 shadow-sm" role="alert">
                    <div className="d-flex align-items-center">
                        <i className="fas fa-exclamation-triangle fa-2x me-3"></i>
                        <div>
                            <h4 className="alert-heading mb-1">Access Denied</h4>
                            <p className="mb-0">You don't have permission to view this page. Admin access is required.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                .stat-card {
                    transition: transform 0.2s, box-shadow 0.2s;
                    border: 1px solid #e9ecef;
                }
                .stat-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.1);
                }
                .table thead th {
                    background-color: #f8f9fa;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    letter-spacing: 0.5px;
                    border-bottom: 2px solid #dee2e6;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                .table tbody tr {
                    transition: background-color 0.15s ease;
                }
                .table tbody tr:hover {
                    background-color: #f8f9fa;
                }
                .fade-in {
                    animation: fadeIn 0.3s ease-in;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .action-btn {
                    transition: all 0.15s ease;
                }
                .action-btn:hover {
                    transform: translateY(-1px);
                }
                .student-badge {
                    font-size: 0.75rem;
                    padding: 0.35em 0.65em;
                }
            `}</style>

            {/* Header */}
            <header className="bg-white border-bottom shadow-sm mb-4">
                <div className="container-fluid px-4">
                    <div className="py-4">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div className="me-3 p-3 bg-primary bg-opacity-10 rounded">
                                    <Users className="text-primary" size={32} />
                                </div>
                                <div>
                                    <h1 className="h3 mb-1 fw-bold">Potential Applicants</h1>
                                    <p className="text-muted mb-0 small">
                                        Students who have registered but not yet applied for scholarships
                                    </p>
                                </div>
                            </div>
                            {activeSemester && (
                                <span className="badge bg-primary fs-6">
                                    {activeSemester.name} {activeSemester.academicYear}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-fluid px-4">
                {/* Stats Row */}
                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="card stat-card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Total Potential Applicants</p>
                                        <h3 className="mb-0 fw-bold">{stats.total}</h3>
                                    </div>
                                    <div className="bg-primary bg-opacity-10 p-3 rounded-3">
                                        <Users className="text-primary" size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card stat-card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Reminders Sent</p>
                                        <h3 className="mb-0 fw-bold text-success">{stats.sent}</h3>
                                    </div>
                                    <div className="bg-success bg-opacity-10 p-3 rounded-3">
                                        <CheckCircle className="text-success" size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card stat-card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Pending</p>
                                        <h3 className="mb-0 fw-bold text-warning">{stats.pending}</h3>
                                    </div>
                                    <div className="bg-warning bg-opacity-10 p-3 rounded-3">
                                        <Clock className="text-warning" size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-bottom py-3">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                            <h5 className="mb-0 fw-semibold">
                                <i className="fas fa-list me-2 text-primary"></i>
                                Student List
                            </h5>
                            <div className="d-flex align-items-center gap-3">
                                {/* Status Filter */}
                                <select
                                    className="form-select form-select-sm"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'sent' | 'not_sent')}
                                    style={{ width: 'auto' }}
                                >
                                    <option value="all">All Status ({stats.total})</option>
                                    <option value="not_sent">Not Sent ({stats.pending})</option>
                                    <option value="sent">Sent ({stats.sent})</option>
                                </select>

                                <input
                                    type="search"
                                    className="form-control form-control-sm"
                                    style={{ width: '240px' }}
                                    placeholder="Search by name, student ID, email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    title="Refresh"
                                    onClick={fetchApplicants}
                                    disabled={loading}
                                >
                                    <i className="fas fa-sync"></i>
                                </button>

                                {/* Bulk Send Button */}
                                <button
                                    className="btn btn-success d-flex align-items-center gap-2"
                                    onClick={handleBulkSend}
                                    disabled={stats.pending === 0 || isBulkSending}
                                >
                                    {isBulkSending ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm"></span>
                                            Sending {bulkProgress.sent}/{bulkProgress.total}...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            Send All Reminders ({stats.pending})
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card-body p-0">
                        {error && (
                            <div className="alert alert-danger m-4 border-0 shadow-sm" role="alert">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-exclamation-triangle me-3"></i>
                                        <div>
                                            <strong>Error:</strong> {error}
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-sm btn-outline-danger action-btn"
                                        onClick={handleRetry}
                                    >
                                        <i className="fas fa-redo me-1"></i>
                                        Retry
                                    </button>
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="text-muted fw-medium">Loading potential applicants...</p>
                            </div>
                        ) : filteredApplicants.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fas fa-users-slash fa-3x text-muted mb-3 opacity-25"></i>
                                <h5 className="text-muted">No Potential Applicants Found</h5>
                                <p className="text-muted small mb-3">
                                    {statusFilter === 'all'
                                        ? 'All registered students have already applied for scholarships'
                                        : statusFilter === 'sent'
                                        ? 'No reminders have been sent yet'
                                        : 'All students have received a reminder'}
                                </p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead>
                                    <tr>
                                        <th className="border-0">#</th>
                                        <th className="border-0" role="button" onClick={() => toggleSort('student_id')}>
                                            <i className="fas fa-id-card me-2 text-primary"></i>
                                            Student ID <i className={`fas ${sortIcon('student_id')} ms-1`}></i>
                                        </th>
                                        <th className="border-0" role="button" onClick={() => toggleSort('name')}>
                                            <i className="fas fa-user me-2 text-primary"></i>
                                            Name <i className={`fas ${sortIcon('name')} ms-1`}></i>
                                        </th>
                                        <th className="border-0" role="button" onClick={() => toggleSort('email')}>
                                            <i className="fas fa-envelope me-2 text-primary"></i>
                                            Email <i className={`fas ${sortIcon('email')} ms-1`}></i>
                                        </th>
                                        <th className="border-0" role="button" onClick={() => toggleSort('registered_at')}>
                                            <i className="fas fa-calendar me-2 text-primary"></i>
                                            Registered <i className={`fas ${sortIcon('registered_at')} ms-1`}></i>
                                        </th>
                                        <th className="border-0 text-center" role="button" onClick={() => toggleSort('reminder_status')}>
                                            <i className="fas fa-bell me-2 text-primary"></i>
                                            Reminder Status <i className={`fas ${sortIcon('reminder_status')} ms-1`}></i>
                                        </th>
                                        <th className="border-0 text-center">
                                            <i className="fas fa-cog me-2 text-muted"></i>
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {pagedApplicants.map((student, index) => (
                                        <tr key={student.user_id} className="fade-in">
                                            <td>{(currentPage - 1) * perPage + index + 1}</td>
                                            <td>
                                                <span className="badge student-badge bg-light text-dark border fw-semibold">
                                                    {student.student_id}
                                                </span>
                                            </td>
                                            <td>
                                                <strong>
                                                    {student.first_name} {student.last_name}
                                                </strong>
                                            </td>
                                            <td>
                                                <a
                                                    href={`mailto:${student.email}`}
                                                    className="text-decoration-none text-primary d-flex align-items-center small"
                                                    title={`Send email to ${student.email}`}
                                                >
                                                    <i className="far fa-envelope me-2"></i>
                                                    {student.email}
                                                </a>
                                            </td>
                                            <td>
                                                {formatDate(student.registered_at)}
                                            </td>
                                            <td className="text-center">
                                                {student.reminder_sent ? (
                                                    <span className="badge bg-success d-inline-flex align-items-center gap-1">
                                                        <CheckCircle size={12} />
                                                        Sent {formatDate(student.reminder_sent_at)}
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-secondary">Not Sent</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-center">
                                                    {!student.reminder_sent && (
                                                        <button
                                                            className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                                                            onClick={() => handleSendReminder(student)}
                                                            disabled={sendingId === student.user_id}
                                                        >
                                                            {sendingId === student.user_id ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm"></span>
                                                                    Sending...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Mail size={14} />
                                                                    Send Reminder
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                    {student.reminder_sent && (
                                                        <span className="text-muted small">—</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {filteredApplicants.length > 0 && (
                        <div className="card-footer bg-white border-top py-3">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 text-muted small">
                                <span>
                                    Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filteredApplicants.length)} of {filteredApplicants.length} students
                                </span>
                                <div className="d-flex align-items-center gap-2">
                                    <select
                                        className="form-select form-select-sm"
                                        style={{ width: 'auto' }}
                                        value={perPage}
                                        onChange={(e) => setPerPage(Number(e.target.value))}
                                    >
                                        {[5, 10, 15, 20, 25].map(n => (
                                            <option key={n} value={n}>{n} / page</option>
                                        ))}
                                    </select>
                                    <button className="btn btn-outline-secondary btn-sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                                        Previous
                                    </button>
                                    <span>Page {currentPage} of {totalPages}</span>
                                    <button className="btn btn-outline-secondary btn-sm" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PotentialApplicants;
