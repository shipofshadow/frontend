import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { adminApproveSelection, getStudentSelection } from '../../services/scholarshipService';

interface ApplicantRow {
    application_id: number;
    user_id: number;
    name: string;
    student_id?: string;
    campus_id?: number;
}

interface StudentSelectionRecord {
    id: number;
    scholarship_id: number;
    scholarship_name: string;
    status: 'student_chosen' | 'accepted' | 'rejected';
    created_at: string;
}

interface EnrichedRow extends ApplicantRow {
    selection: StudentSelectionRecord | null;
    selectionLoading: boolean;
}

const statusBadge = (status: StudentSelectionRecord['status']) => {
    switch (status) {
        case 'student_chosen':
            return <span className="badge bg-warning text-dark">Pending Review</span>;
        case 'accepted':
            return <span className="badge bg-success">Approved</span>;
        case 'rejected':
            return <span className="badge bg-danger">Rejected</span>;
    }
};

const ScholarshipSelectionApprovals: React.FC = () => {
    const { token, isFaculty, userCampusId } = useAuth();
    const [rows, setRows] = useState<EnrichedRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const loadData = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<ApplicantRow[]>(`${API_BASE_URL}/api/evaluations/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            let applicants = response.data;
            if (isFaculty && userCampusId) {
                applicants = applicants.filter(a => a.campus_id === userCampusId);
            }

            // Initialize rows without selections
            const initial: EnrichedRow[] = applicants.map(a => ({
                ...a,
                selection: null,
                selectionLoading: true,
            }));
            setRows(initial);
            setLoading(false);

            // Fetch selections in parallel
            await Promise.all(
                applicants.map(async (a) => {
                    try {
                        const sel: StudentSelectionRecord | null = await getStudentSelection(a.application_id, token);
                        setRows(prev =>
                            prev.map(r =>
                                r.application_id === a.application_id
                                    ? { ...r, selection: sel, selectionLoading: false }
                                    : r,
                            ),
                        );
                    } catch {
                        setRows(prev =>
                            prev.map(r =>
                                r.application_id === a.application_id
                                    ? { ...r, selectionLoading: false }
                                    : r,
                            ),
                        );
                    }
                }),
            );
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load data.';
            setError(message);
            setLoading(false);
        }
    }, [token, isFaculty, userCampusId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleApprove = async (row: EnrichedRow) => {
        const confirm = await Swal.fire({
            title: 'Approve Selection?',
            html: `Approve <strong>${row.selection?.scholarship_name}</strong> for <strong>${row.name}</strong>?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, approve',
            confirmButtonColor: '#198754',
        });
        if (!confirm.isConfirmed) return;

        setActionLoading(row.application_id);
        try {
            await adminApproveSelection(row.application_id, 'accept', undefined, token!);
            await Swal.fire({ icon: 'success', title: 'Approved', timer: 1500, showConfirmButton: false });
            await loadData();
        } catch {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to approve selection.' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (row: EnrichedRow) => {
        const { value: reason, isConfirmed } = await Swal.fire({
            title: 'Reject Selection',
            html: `Reject <strong>${row.selection?.scholarship_name}</strong> for <strong>${row.name}</strong>?`,
            input: 'textarea',
            inputLabel: 'Reason (optional)',
            inputPlaceholder: 'Enter reason for rejection…',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Reject',
            confirmButtonColor: '#dc3545',
        });
        if (!isConfirmed) return;

        setActionLoading(row.application_id);
        try {
            await adminApproveSelection(row.application_id, 'reject', reason || undefined, token!);
            await Swal.fire({ icon: 'success', title: 'Rejected', timer: 1500, showConfirmButton: false });
            await loadData();
        } catch {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to reject selection.' });
        } finally {
            setActionLoading(null);
        }
    };

    const withSelection = rows.filter(r => r.selection !== null);

    return (
        <div className="container-fluid px-4 py-4">
            {/* Page header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                        <CheckCircle size={28} />
                    </div>
                    <div>
                        <h1 className="h3 fw-bold mb-0">Scholarship Selection Approvals</h1>
                        <p className="text-muted mb-0 small">Review and act on student scholarship choices</p>
                    </div>
                </div>
                <button
                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    onClick={loadData}
                    disabled={loading}
                >
                    <RefreshCw size={16} className={loading ? 'spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
                    <AlertTriangle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* Table card */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                    <span className="fw-semibold">
                        Students with Scholarship Selections
                        {!loading && (
                            <span className="badge bg-primary ms-2">{withSelection.length}</span>
                        )}
                    </span>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary mb-3" role="status" />
                            <p className="text-muted">Loading…</p>
                        </div>
                    ) : withSelection.length === 0 ? (
                        <div className="text-center py-5">
                            <Clock size={48} className="text-muted mb-3" />
                            <h5 className="text-muted">No student selections to review.</h5>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Student</th>
                                        <th>Student ID</th>
                                        <th>Application ID</th>
                                        <th>Chosen Scholarship</th>
                                        <th>Status</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {withSelection.map(row => (
                                        <tr key={row.application_id}>
                                            <td className="fw-semibold">{row.name}</td>
                                            <td className="text-muted">{row.student_id ?? '—'}</td>
                                            <td className="text-muted">#{row.application_id}</td>
                                            <td>{row.selection!.scholarship_name}</td>
                                            <td>{statusBadge(row.selection!.status)}</td>
                                            <td className="text-center">
                                                {row.selection!.status === 'student_chosen' ? (
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <button
                                                            className="btn btn-success btn-sm d-flex align-items-center gap-1"
                                                            onClick={() => handleApprove(row)}
                                                            disabled={actionLoading === row.application_id}
                                                        >
                                                            <CheckCircle size={14} />
                                                            Accept
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                                                            onClick={() => handleReject(row)}
                                                            disabled={actionLoading === row.application_id}
                                                        >
                                                            <XCircle size={14} />
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted small">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default ScholarshipSelectionApprovals;
