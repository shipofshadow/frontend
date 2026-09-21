import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import type { Applicant } from '../../interfaces/applicant';
import ViewApplicantReadOnlyForm from '../../components/admin/modals/ViewApplicantReadOnlyForm';
import { CheckCircle, GraduationCap, Search, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const QualifiedStudents = () => {
    const { token, isFaculty, userCampusId } = useAuth();
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [filtered, setFiltered] = useState<Applicant[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

    const fetchQualified = async () => {
        setLoading(true);
        try {
            const res = await axios.get<Applicant[]>(`${API_BASE_URL}/api/applicants/qualified`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            let data = res.data;
            if (isFaculty && userCampusId) {
                data = data.filter(a => a.campus_id === userCampusId);
            }
            setApplicants(data);
            setFiltered(data);
        } catch {
            await Swal.fire('Error', 'Failed to load qualified students.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQualified();
    }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(
            applicants.filter(a =>
                `${a.first_name} ${a.last_name}`.toLowerCase().includes(q) ||
                a.course?.toLowerCase().includes(q) ||
                a.campus?.toLowerCase().includes(q)
            )
        );
    }, [search, applicants]);

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            approved: 'bg-success',
            pending: 'bg-warning text-dark',
            denied: 'bg-danger',
            evaluated: 'bg-info',
        };
        return (
            <span className={`badge rounded-pill ${map[status] ?? 'bg-secondary'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
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
                                    <div className="page-header-icon">
                                        <CheckCircle size={20} />
                                    </div>
                                    Qualified Students
                                </h1>
                            </div>
                            <div className="col-auto mb-3">
                                <button className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" onClick={fetchQualified}>
                                    <RefreshCw size={14} />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-xl px-4">
                <div className="card mb-4">
                    <div className="card-header d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2 text-muted small">
                            <GraduationCap size={16} />
                            <span>
                                {loading ? 'Loading…' : `${filtered.length} qualified student${filtered.length !== 1 ? 's' : ''}`}
                            </span>
                        </div>
                        <div className="input-group" style={{ maxWidth: 280 }}>
                            <span className="input-group-text"><Search size={14} /></span>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Search name, course, campus…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center py-5">
                                <div className="spinner-border text-primary" role="status" />
                                <span className="ms-3 text-muted">Loading qualified students…</span>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <GraduationCap size={40} className="mb-2 opacity-50" />
                                <p className="mb-0">No qualified students found.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Name</th>
                                            <th>Course</th>
                                            <th>Campus</th>
                                            <th>Birth Date</th>
                                            <th>Date Applied</th>
                                            <th>Score</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(a => (
                                            <tr key={a.id}>
                                                <td>
                                                    <div className="fw-semibold">{a.last_name}, {a.first_name} {a.middle_name}</div>
                                                    <div className="text-muted small">{a.students_student_id}</div>
                                                </td>
                                                <td>{a.course ?? '—'}</td>
                                                <td>{a.campus ?? '—'}</td>
                                                <td>{a.birth_date ? new Date(a.birth_date).toLocaleDateString() : '—'}</td>
                                                <td>{a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}</td>
                                                <td>
                                                    {a.score != null
                                                        ? <span className="badge bg-primary rounded-pill">{Number(a.score).toFixed(2)}</span>
                                                        : '—'}
                                                </td>
                                                <td>{statusBadge(a.status)}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                                                        onClick={() => setSelectedApplicant(a)}
                                                    >
                                                        <i className="fa-regular fa-eye" />
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedApplicant && (
                <ViewApplicantReadOnlyForm
                    applicant={selectedApplicant}
                    onClose={() => setSelectedApplicant(null)}
                />
            )}
        </>
    );
};

export default QualifiedStudents;